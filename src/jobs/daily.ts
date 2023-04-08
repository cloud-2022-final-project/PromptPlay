import { ChannelType, EmbedBuilder, TextChannel } from 'discord.js';
import { Job } from './index.js';
import { CustomClient } from '../extensions/index.js';
import { Logger } from '../services/index.js';
import { prisma } from '../prisma.js';
import { ClientUtils } from '../utils/client-utils.js';
import { MessageUtils } from '../utils/message-utils.js';
import { DailyImage } from '@prisma/client';

export const targetChannel = 'daily';

export let processingDaily = false;

/**
 * Forcefully does the `Daily` job.
 * @param client The client to send the image with.
 * @param targetChannel The name of the channel to send the image to.
 */
export const processDaily = async (client: CustomClient, targetChannel: string) => {
    processingDaily = true;
    await _process(client, targetChannel);
    processingDaily = false;
};

const _process = async (client: CustomClient, targetChannel: string) => {
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
                select: {
                    score: true,
                    discordId: true,
                },
            },
        },
    });

    // if there is no current image, create a new one and send it
    if (!dailyImage) {
        const newImage = await getNewImage();
        const dailyImage = await prisma.dailyImage.create({
            data: {
                prompt: newImage.prompt,
                url: newImage.url,
            },
        });
        await sendNewDailyImage(channel, dailyImage);
        return;
    }

    // Set the new image and prompt for the next day
    const updatedDailyImage = await updateDailyImage(dailyImage.url);

    // report the results of the previous round's voting
    await reportDailyResults(dailyImage, dailyImage.players, client, channel);

    // send the new image
    await sendNewDailyImage(channel, updatedDailyImage);
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
 * This function finds a new image and prompt to use for the next day from wherever the image is stored.
 */
const getNewImage = async (): Promise<{
    url: string;
    prompt: string;
}> => {
    // TODO: get a new image and its prompt
    return {
        prompt: 'This is a prompt.',
        url: 'https://i.redd.it/k7xzx3bq4lb71.jpg',
    };
};

/**
 * This updates the daily image so that it has a new image url and prompt. All players of the new round are also reset.
 * @param url The url of the daily image to update
 * @returns The updated daily image
 */
const updateDailyImage = async (url: string) => {
    // remove all players for the next round
    await prisma.dailyPlayer.deleteMany();

    // get a new image and prompt
    const newImage = await getNewImage();

    // set a new image and prompt
    return await prisma.dailyImage.update({
        where: {
            url,
        },
        data: {
            url: newImage.url,
            prompt: newImage.prompt,
            round: {
                increment: 1,
            },
        },
    });
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
        .setColor('Random')
        .setTitle(`Round ${dailyImage.round} Results`)
        .setImage(dailyImage.url).setDescription(`
            **Prompt:** ${dailyImage.prompt}\n\n
            **Top 10 Players:**\n
            ${top10
                .map(
                    (discordUser, i) => `${i + 1}. ${discordUser.username} ${dailyPlayers[i].score}`
                )
                .join('\n')}`);
    MessageUtils.send(channel, embed);

    // privately report each player's score to them
    await Promise.all(
        discordUsers.map(async (discordUser, i) => {
            const embed = new EmbedBuilder()
                .setColor('Random')
                .setImage(dailyImage.url)
                .setTitle(`Round ${dailyImage.round} Results`).setDescription(`
                    **Prompt:** ${dailyImage.prompt}\n\n
                    **Your Score:** ${dailyPlayers[i].score} (highest score: ${
                dailyPlayers[0].score
            })
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
    // TODO: get hint from ChatGPT.
    const hint = 'This is a hint.';

    const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`Round ${dailyImage.round} starts now!`)
        .setDescription(hint)
        .setImage(dailyImage.url);
    MessageUtils.send(channel, embed);
};
