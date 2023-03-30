import { ChannelType, TextChannel } from 'discord.js';
import { Job } from './index.js';
import { CustomClient } from '../extensions/index.js';
import { Logger } from '../services/index.js';

/**
 * Forcefully sends a picture of the day to the specified channel.
 * @param client The client to send the image with.
 * @param targetChannel The name of the channel to send the image to.
 */
export const sendDaily = async (client: CustomClient, targetChannel: string) => {
    // Find the channel by name
    const channel = client.channels.cache.find(
        c => c.type === ChannelType.GuildText && c.name === targetChannel
    ) as TextChannel | undefined;

    // Send a message to the channel
    if (channel) {
        channel.send("Good morning! It's a new day!");
    } else {
        Logger.error(`Could not find channel with name ${targetChannel}`);
    }
};

/**
 * A job that runs every day to send a picture of the day.
 */
export class Daily implements Job {
    name = 'Daily';
    log = true;
    /** runs every day at 08:00:00 AM */
    schedule = '0 0 8 * * *';

    private targetChannel = 'daily';

    constructor(private client: CustomClient) {}

    async run() {
        sendDaily(this.client, this.targetChannel);
    }
}
