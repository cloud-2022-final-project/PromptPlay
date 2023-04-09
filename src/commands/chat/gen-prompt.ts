import { PermissionsString, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { EventData } from '../../models/internal-models.js';
import { InteractionUtils } from '../../utils/interaction-utils.js';
import { Command, CommandDeferType } from '../command.js';
import { ChatGPT } from '../../services/chatpgt.js';

export const genPromptCommandName = 'gen-prompt';

export class GenPrompt implements Command {
    public names = [genPromptCommandName];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = ['Administrator'];

    public async execute(intr: ChatInputCommandInteraction, _: EventData): Promise<void> {
        const prompt = await ChatGPT.randomPrompt();
        await InteractionUtils.send(
            intr,
            new EmbedBuilder().setTitle('Here is your prompt!').setDescription(prompt)
        );
    }
}
