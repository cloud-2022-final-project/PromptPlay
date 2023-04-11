import { ChannelType, EmbedBuilder, TextChannel } from 'discord.js';
import { Job } from './index.js';
import { CustomClient } from '../extensions/index.js';
import { Logger } from '../services/index.js';
import { prisma } from '../prisma.js';
import { ClientUtils } from '../utils/client-utils.js';
import { MessageUtils } from '../utils/message-utils.js';
import { DailyImage } from '@prisma/client';
import { ChatGPT } from '../services/chatpgt.js';
import fetch from 'node-fetch';
import { imageExists } from '../utils/index.js';

export const targetChannel = 'daily';

/**
 * This tells if the `Daily` job is currently running.
 */
export let processingDaily = false;

/**
 * Forcefully does the `Daily` job.
 * @param client The client to send the image with.
 * @param targetChannel The name of the channel to send the image to.
 * @returns `true` if there is a new image to play with, `false` otherwise.
 */
export const processDaily = async (
    client: CustomClient,
    targetChannel: string
): Promise<boolean> => {
    processingDaily = true;
    return _process(client, targetChannel).finally(() => {
        processingDaily = false;
    });
};

/**
 * @returns `true` if there is a new image to play with, `false` otherwise.
 */
const _process = async (client: CustomClient, targetChannel: string): Promise<boolean> => {
    // Find the channel by name
    const channel = client.channels.cache.find(
        c => c.type === ChannelType.GuildText && c.name === targetChannel
    ) as TextChannel | undefined;

    // If the channel is not found, log an error.
    if (!channel) {
        Logger.error(`Could not find channel with name ${targetChannel}`);
        return;
    }

    // Process the job

    // get the info of the current image and prompt
    const dailyImage = await prisma.dailyImage.findFirst({
        include: {
            players: {
                orderBy: {
                    score: 'desc',
                },
                select: {
                    score: true,
                    discordId: true,
                    prompt: true,
                },
            },
        },
    });

    // if there is no current image, create a new one and send it
    if (!dailyImage) {
        // get a new image and prompt for the next round
        const newImage = await getNewImage();

        // we have literally no images, so we can't do anything
        if (!newImage) {
            return false;
        }

        // create a fresh daily image
        const dailyImage = await prisma.dailyImage.create({
            data: {
                prompt: newImage.prompt,
                url: newImage.url,
            },
        });

        // send the new image to the channel
        await sendNewDailyImage(channel, dailyImage);

        return true;
    }

    // if the current image is active (in play)
    if (dailyImage.active) {
        // if there are no players,
        // keep the current image and prompt so that we don't waste the current image
        if (dailyImage.players.length === 0) {
            return true;
        }

        await Promise.all([
            // remove all players so that the next round can start with no players
            prisma.dailyPlayer.deleteMany(),
            // report the results of the current round's voting
            reportDailyResults(dailyImage, dailyImage.players, client, channel),
        ]);
    }

    // get a new image and prompt for the next round
    const newImage = await getNewImage();

    // if there is no new image, set the current daily image as inactive
    // and end the job
    if (!newImage) {
        await prisma.dailyImage.update({
            where: {
                url: dailyImage.url,
            },
            data: {
                active: false,
            },
        });
        return false;
    }

    // Update the current daily image with the new image and prompt
    const newDailyImage = await prisma.dailyImage.update({
        where: {
            url: dailyImage.url,
        },
        data: {
            prompt: newImage.prompt,
            url: newImage.url,
            active: true,
            round: {
                increment: 1,
            },
        },
    });

    // send the new image
    await sendNewDailyImage(channel, newDailyImage);
    return true;
};

/**
 * A job that runs every day to send a picture of the day and concludes
 * the previous day's voting.
 */
export class Daily implements Job {
    name = 'Daily';
    log = true;
    /** runs every day at 08:00:00 AM */
    schedule = '0 0 8 * * *';

    constructor(private client: CustomClient) {}

    async run() {
        processDaily(this.client, targetChannel);
    }
}

/**
 * This function finds a new image and prompt to use for the next day from wherever they are stored.
 * @returns The new image and prompt or null if there is no new image
 */
const getNewImage = async (): Promise<{
    url: string;
    prompt: string;
} | null> => {
    let newImage = await prisma.imageStore.findFirst();

    while (newImage && !(await imageExists(newImage.url))) {
        await prisma.imageStore.delete({
            where: {
                url: newImage.url,
            },
        });
        newImage = await prisma.imageStore.findFirst();
    }

    if (newImage) {
        await prisma.imageStore.delete({
            where: {
                url: newImage.url,
            },
        });
        return newImage;
    }

    return null;
};

/**
 * This function reports the results of the voting to the channel and to each player.
 * @param dailyImage The daily image to report on
 * @param dailyPlayers Players who have voted on the image
 * @param client The discord bot client to send the image with
 * @param channel The channel to send the report to
 */
async function reportDailyResults(
    dailyImage: DailyImage,
    dailyPlayers: {
        discordId: string;
        score: number;
        prompt: string;
    }[],
    client: CustomClient,
    channel: TextChannel
) {
    // get all discord users who play this round for their usernames
    const discordUsers = await Promise.all(
        dailyPlayers.map(async p => await ClientUtils.getUser(client, p.discordId))
    );

    // get the usernames of top players
    const top10 = discordUsers.slice(0, 10);

    // send current image, prompt, and top 10 players publicly to the channel
    const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle(`Round ${dailyImage.round} Results`)
        .setImage(dailyImage.url).setDescription(`
            **Answer:** \`${dailyImage.prompt}\`\n
            **Top 10 Players:**\n
            ${top10
                .map(
                    (discordUser, i) =>
                        `${i + 1}. ${discordUser.tag} 👉 \`${
                            dailyPlayers[i].prompt
                        }\` 💯 ${dailyPlayers[i].score.toFixed(2)}`
                )
                .join('\n')}`);
    MessageUtils.send(channel, embed);

    // privately report each player's score to them
    await Promise.all(
        discordUsers.map(async (discordUser, i) => {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setImage(dailyImage.url)
                .setTitle(`Round ${dailyImage.round} Results`).setDescription(`
                    **Answer:** \`${dailyImage.prompt}\`
                    **Your Prompt:** \`${dailyPlayers[i].prompt}\`
                    **Your Score:** ${dailyPlayers[i].score.toFixed(
                        2
                    )} (highest score: ${dailyPlayers[0].score.toFixed(2)})
                    **Rank:** ${i + 1}/${dailyPlayers.length}`);
            MessageUtils.send(discordUser, embed);
        })
    );
}

/**
 * This function sends a new daily image to the channel.
 * @param channel The channel to send the image to
 * @param dailyImage The daily image to send
 */
const sendNewDailyImage = async (channel: TextChannel, dailyImage: DailyImage) => {
    const hint = await ChatGPT.hint(dailyImage.prompt);
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle(`Round ${dailyImage.round} starts now!`)
        .setDescription(hint)
        .setImage(dailyImage.url);
    MessageUtils.send(channel, embed);
};
