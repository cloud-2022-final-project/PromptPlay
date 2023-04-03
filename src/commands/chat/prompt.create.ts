import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { Lang } from '../../services/index.js';
import { Command, CommandDeferType } from '../command.js';
import { EventData } from '../../models/internal-models.js';
import { InteractionUtils } from '../../utils/index.js';
import { Language } from '../../models/enum-helpers/index.js';

/**
 * This command handles when a player prompts a new image at the start of the game.
 */
export class SubmitImage implements Command {
    public names = [Lang.getRef('chatCommands.submitImage', Language.Default)];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        const prompt = intr.options.getString('prompt');

        await InteractionUtils.send(intr, `Your prompt is ${prompt}`);
    }
}
