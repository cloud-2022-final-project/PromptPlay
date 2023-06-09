import { addImageCommandName } from './chat/add-image.js';
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    PermissionFlagsBits,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';

import { Args } from './index.js';
import { Language } from '../models/enum-helpers/index.js';
import { Lang } from '../services/index.js';
import { genPromptCommandName } from './chat/gen-prompt.js';
import { addUrlCommandName } from './chat/add-url.js';

export const ChatCommandMetadata: {
    [command: string]: RESTPostAPIChatInputApplicationCommandsJSONBody;
} = {
    GUESS: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getRef('chatCommands.guess', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('chatCommands.guess'),
        description: Lang.getRef('commandDescs.guess', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('commandDescs.guess'),
        dm_permission: false,
        options: [
            {
                name: 'prompt',
                description: 'Prompt for the image',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    DAILY: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getRef('chatCommands.forceSendDaily', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('chatCommands.forceSendDaily'),
        description: Lang.getRef('commandDescs.forceSendDaily', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('commandDescs.forceSendDaily'),
        dm_permission: false,
        default_member_permissions: PermissionFlagsBits.Administrator.toString(),
    },
    ADD_IMAGE: {
        type: ApplicationCommandType.ChatInput,
        name: addImageCommandName,
        description: 'Manually submit a daily image',
        dm_permission: false,
        default_member_permissions: PermissionFlagsBits.Administrator.toString(),
        options: [
            {
                name: 'prompt',
                description: 'Prompt for the image',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'image',
                description: 'The image to submit',
                type: ApplicationCommandOptionType.Attachment,
                required: true,
            },
        ],
    },
    ADD_URL: {
        type: ApplicationCommandType.ChatInput,
        name: addUrlCommandName,
        description: 'Manually submit a daily image url',
        dm_permission: false,
        default_member_permissions: PermissionFlagsBits.Administrator.toString(),
        options: [
            {
                name: 'prompt',
                description: 'Prompt for the image',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'url',
                description:
                    'The url of an image to submit. ❗❗❗ This url must be permanent and not expire. ❗❗❗',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    GEN_PROMPT: {
        type: ApplicationCommandType.ChatInput,
        name: genPromptCommandName,
        description: 'Get a random prompt',
        dm_permission: false,
        default_member_permissions: PermissionFlagsBits.Administrator.toString(),
    },
    WEEKLY: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getRef('chatCommands.forceSendWeekly', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('chatCommands.forceSendWeekly'),
        description: Lang.getRef('commandDescs.forceSendWeekly', Language.Default),
        description_localizations: Lang.getRefLocalizationMap('commandDescs.forceSendWeekly'),
        dm_permission: false,
        default_member_permissions: PermissionFlagsBits.Administrator.toString(),
    },
    // HELP: {
    //     type: ApplicationCommandType.ChatInput,
    //     name: Lang.getRef('chatCommands.help', Language.Default),
    //     name_localizations: Lang.getRefLocalizationMap('chatCommands.help'),
    //     description: Lang.getRef('commandDescs.help', Language.Default),
    //     description_localizations: Lang.getRefLocalizationMap('commandDescs.help'),
    //     dm_permission: true,
    //     options: [
    //         {
    //             ...Args.HELP_OPTION,
    //             required: true,
    //         },
    //     ],
    // },
    // INFO: {
    //     type: ApplicationCommandType.ChatInput,
    //     name: Lang.getRef('chatCommands.info', Language.Default),
    //     name_localizations: Lang.getRefLocalizationMap('chatCommands.info'),
    //     description: Lang.getRef('commandDescs.info', Language.Default),
    //     description_localizations: Lang.getRefLocalizationMap('commandDescs.info'),
    //     dm_permission: true,
    //     options: [
    //         {
    //             ...Args.INFO_OPTION,
    //             required: true,
    //         },
    //     ],
    // },
    // TEST: {
    //     type: ApplicationCommandType.ChatInput,
    //     name: Lang.getRef('chatCommands.test', Language.Default),
    //     name_localizations: Lang.getRefLocalizationMap('chatCommands.test'),
    //     description: Lang.getRef('commandDescs.test', Language.Default),
    //     description_localizations: Lang.getRefLocalizationMap('commandDescs.test'),
    //     dm_permission: true,
    // },
    // NEW_ROOM: {
    //     type: ApplicationCommandType.ChatInput,
    //     name: Lang.getRef('chatCommands.newRoom', Language.Default),
    //     name_localizations: Lang.getRefLocalizationMap('chatCommands.newRoom'),
    //     description: Lang.getRef('commandDescs.newRoom', Language.Default),
    //     description_localizations: Lang.getRefLocalizationMap('commandDescs.newRoom'),
    //     dm_permission: false,
    //     default_member_permissions: undefined,
    // },
    // JOIN_ROOM: {
    //     type: ApplicationCommandType.ChatInput,
    //     name: Lang.getRef('chatCommands.joinRoom', Language.Default),
    //     name_localizations: Lang.getRefLocalizationMap('chatCommands.joinRoom'),
    //     description: Lang.getRef('commandDescs.joinRoom', Language.Default),
    //     description_localizations: Lang.getRefLocalizationMap('commandDescs.joinRoom'),
    //     dm_permission: false,
    //     default_member_permissions: undefined,
    // },
    // START: {
    //     type: ApplicationCommandType.ChatInput,
    //     name: Lang.getRef('chatCommands.start', Language.Default),
    //     name_localizations: Lang.getRefLocalizationMap('chatCommands.start'),
    //     description: Lang.getRef('commandDescs.start', Language.Default),
    //     description_localizations: Lang.getRefLocalizationMap('commandDescs.start'),
    //     dm_permission: false,
    //     default_member_permissions: undefined,
    // },
    // SUBMIT_IMAGE: {
    //     type: ApplicationCommandType.ChatInput,
    //     name: Lang.getRef('chatCommands.submitImage', Language.Default),
    //     name_localizations: Lang.getRefLocalizationMap('chatCommands.submitImage'),
    //     description: Lang.getRef('commandDescs.submitImage', Language.Default),
    //     description_localizations: Lang.getRefLocalizationMap('commandDescs.submitImage'),
    //     dm_permission: false,
    //     default_member_permissions: undefined,
    //     options: [
    //         {
    //             ...Args.SUBMIT_IMAGE_OPTION,
    //             required: true,
    //         },
    //     ],
    // },
};

export const MessageCommandMetadata: {
    [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
} = {
    VIEW_DATE_SENT: {
        type: ApplicationCommandType.Message,
        name: Lang.getRef('messageCommands.viewDateSent', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('messageCommands.viewDateSent'),
        default_member_permissions: undefined,
        dm_permission: true,
    },
};

export const UserCommandMetadata: {
    [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
} = {
    VIEW_DATE_JOINED: {
        type: ApplicationCommandType.User,
        name: Lang.getRef('userCommands.viewDateJoined', Language.Default),
        name_localizations: Lang.getRefLocalizationMap('userCommands.viewDateJoined'),
        default_member_permissions: undefined,
        dm_permission: true,
    },
};
