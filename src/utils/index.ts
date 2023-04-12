import axios from 'axios';
import { Guild } from 'discord.js';
import mime from 'mime';

import { targetChannel as daily } from '../jobs/daily.js';
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

/**
 * @see https://discord.com/developers/docs/reference#editing-message-attachments-using-attachments-within-embeds
 */
export const allowedImageTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export const imageExists = async (url: string): Promise<boolean> => {
    try {
        const response = await axios.head(url, { maxRedirects: 5 }); // Limit the number of redirects to avoid infinite loops
        const contentType = response.headers['content-type'];
        if (!contentType) {
            return false;
        }
        const mimeType = mime.getExtension(contentType);
        return allowedImageTypes.includes(mimeType);
    } catch (error) {
        return false;
    }
};
