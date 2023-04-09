import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';
import { Command, CommandDeferType } from '../command.js';
import { EventData } from '../../models/internal-models.js';
import { InteractionUtils } from '../../utils/index.js';

export const manualDailyImageCommandName = 'add-daily-image';

/**
 * Command to manually submit a daily image with a prompt.
 */
export class ManualAddDailyImage implements Command {
    public names = [manualDailyImageCommandName];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = ['Administrator'];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        const attachment = intr.options.get('image')?.attachment;
        const url = attachment?.url;
        const prompt = intr.options.get('prompt')?.value;

        // TODO: Store the image url and prompt.

        const embed = new EmbedBuilder()
            .setImage(url)
            .setColor('Random')
            .setTitle('Prompt Received!')
            .setDescription(`"\`${prompt}\`"`);
        await InteractionUtils.send(intr, embed);
    }
}
