import { CommandInteraction, PermissionsString } from 'discord.js';
import { Language } from '../../models/enum-helpers/index.js';
import { Lang } from '../../services/lang.js';
import { Command, CommandDeferType } from './../command.js';
import { EventData } from '../../models/internal-models.js';
import { CustomClient } from '../../extensions/custom-client.js';
import { processDaily, targetChannel } from '../../jobs/daily.js';
import { InteractionUtils } from '../../utils/interaction-utils.js';

/**
 * This command is used to execute the `Daily` job without having to
 * wait for the scheduled time.
 */
export class ForceSendDaily implements Command {
    names = [Lang.getRef('chatCommands.forceSendDaily', Language.Default)];
    requireClientPerms: PermissionsString[] = ['Administrator'];
    deferType: CommandDeferType = CommandDeferType.HIDDEN;

    constructor(private client: CustomClient) {}

    async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        const hasNextImage = await processDaily(this.client, targetChannel);
        if (hasNextImage) {
            await InteractionUtils.send(intr, 'Done! ❤️');
            return;
        }
        await InteractionUtils.send(
            intr,
            'Done! ❤️\nThere is no next image to play for the next round though.'
        );
    }
}
