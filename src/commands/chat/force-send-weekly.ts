import { CommandInteraction, PermissionsString } from 'discord.js';
import { Language } from '../../models/enum-helpers/index.js';
import { Lang } from '../../services/lang.js';
import { Command, CommandDeferType } from './../command.js';
import { EventData } from '../../models/internal-models.js';
import { CustomClient } from '../../extensions/custom-client.js';
import { InteractionUtils } from '../../utils/interaction-utils.js';
import { processWeekly, targetChannel } from '../../jobs/weekly.js';

/**
 * This command is used to execute the `Daily` job without having to
 * wait for the scheduled time.
 */
export class ForceSendWeekly implements Command {
    names = [Lang.getRef('chatCommands.forceSendWeekly', Language.Default)];
    requireClientPerms: PermissionsString[] = [];
    deferType: CommandDeferType = CommandDeferType.HIDDEN;

    constructor(private client: CustomClient) {}

    async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        const result = await processWeekly(this.client, targetChannel);
        if (result) {
            await InteractionUtils.send(intr, 'Done! ❤️');
            return;
        }
        await InteractionUtils.send(intr, 'Done! ❤️\nThere.');
    }
}
