import { ChannelType, TextChannel } from 'discord.js';
import { Job } from './index.js';
import { CustomClient } from '../extensions/index.js';
import { Logger } from '../services/index.js';

export const targetChannel = 'daily';

/**
 * Forcefully does the `Daily` job.
 * @param client The client to send the image with.
 * @param targetChannel The name of the channel to send the image to.
 */
export const sendDaily = async (client: CustomClient, targetChannel: string) => {
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
    // TODO: Implement the job's functionality
    channel.send("Good morning! It's a new day!");
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
        sendDaily(this.client, targetChannel);
    }
}
