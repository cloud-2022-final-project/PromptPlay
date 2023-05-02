import { ChannelType, EmbedBuilder, TextChannel, User } from 'discord.js';
import { Job } from './index.js';
import { CustomClient } from '../extensions/index.js';
import { Lang, Logger } from '../services/index.js';
import { prisma } from '../prisma.js';
import { ClientUtils } from '../utils/client-utils.js';
import { MessageUtils } from '../utils/message-utils.js';
import { DailyImage } from '@prisma/client';
import { ChatGPT } from '../services/chatpgt.js';
import fetch from 'node-fetch';
import { imageExists } from '../utils/index.js';
import { Language } from '../models/enum-helpers/index.js';

export const targetChannel = 'daily';

/**
 * This tells if the `Weekly` job is currently running.
 */
export let processingWeekly = false;

/**
 * Forcefully does the `Weekly` job.
 * @param client The client to send the image with.
 * @param targetChannel The name of the channel to send the image to.
 * @returns
 */
export const processWeekly = async (
    client: CustomClient,
    targetChannel: string
): Promise<boolean> => {
    processingWeekly = true;
    return _process(client, targetChannel).finally(() => {
        processingWeekly = false;
    });
};
/**
 * @returns
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
    const users = await prisma.user.findMany({
        orderBy: {
            totalScore: 'desc',
        },
    });

    reportWeeklyResults(users, client, channel);
    return true;
};
/**
 * A ... that runs every weeks to send summarize score
 */
export class Weekly implements Job {
    name = 'Weekly';
    log = true;
    /** runs every weekly at 08:00:00 AM */
    schedule = '0 0 8 * * 1';

    constructor(private client: CustomClient) {}

    async run() {
        processWeekly(this.client, targetChannel);
    }
}

/**
 * This function reports the results of the voting to the channel and to each player.
 * @param User Players who have voted on the image
 * @param client The discord bot client to send the image with
 * @param channel The channel to send the report to
 */
async function reportWeeklyResults(
    Users: {
        discordId: string;
        totalScore: number;
    }[],
    client: CustomClient,
    channel: TextChannel
) {
    // get all discord users who play this round for their usernames
    const discordUsers = await Promise.all(
        Users.map(async p => await ClientUtils.getUser(client, p.discordId))
    );

    // get the usernames of top players
    const top10 = discordUsers.slice(0, 10);

    // send current image, prompt, and top 10 players publicly to the channel
    const embed = new EmbedBuilder().setColor('Yellow').setTitle(`Weekly Results`).setDescription(`
            **Top 10 Players:**\n
            ${top10
                .map(
                    (discordUser, i) =>
                        `${i + 1}. ${discordUser.tag} 👉
                         ${Users[i].totalScore.toFixed(2)}`
                )
                .join('\n')}`);
    MessageUtils.send(channel, embed);

    // privately report each player's score to them
    await Promise.all(
        discordUsers.map(async (discordUser, i) => {
            const embed = new EmbedBuilder().setColor('Yellow').setTitle(`Results`).setDescription(`
                    **Your Score:** ${Users[i].totalScore.toFixed(
                        2
                    )} (highest score: ${Users[0].totalScore.toFixed(2)})
                    **Rank:** ${i + 1}/${Users.length}`);
            MessageUtils.send(discordUser, embed);
        })
    );
}
