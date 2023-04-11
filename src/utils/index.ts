import { targetChannel as daily } from './../jobs/daily.js';
import { Guild } from 'discord.js';
import { Logger } from '../services/logger.js';

export { ClientUtils } from './client-utils.js';
export { CommandUtils } from './command-utils.js';
export { FormatUtils } from './format-utils.js';
export { InteractionUtils } from './interaction-utils.js';
export { MathUtils } from './math-utils.js';
export { MessageUtils } from './message-utils.js';
export { PartialUtils } from './partial-utils.js';
export { PermissionUtils } from './permission-utils.js';
export { RandomUtils } from './random-utils.js';
export { RegexUtils } from './regex-utils.js';
export { ShardUtils } from './shard-utils.js';
export { StringUtils } from './string-utils.js';
export { ThreadUtils } from './thread-utils.js';

const requiredChannels = [daily];

/**
 * Creates the required channels if they don't exist.
 * @param client A custom discord.js client
 * @param channels A list of channel names
 */
export const prepareChannels = async (guild: Guild): Promise<void> => {
    for (const channelName of requiredChannels) {
        const existingChannel = guild.channels.cache.find(channel => channel.name === channelName);

        if (existingChannel) {
            continue;
        }

        try {
            await guild.channels.create({
                name: channelName,
            });
        } catch (error) {
            Logger.error(`Error creating channel ${channelName} in guild ${guild.name}`);
        }
    }
};


export const imageExists = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url);
        return response.status === 200;
    } catch (error) {
        return false;
    }
};