import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';
import { Command, CommandDeferType } from '../command.js';
import { EventData } from '../../models/internal-models.js';
import { InteractionUtils, imageExists } from '../../utils/index.js';
import { prisma } from '../../prisma.js';

export const addUrlCommandName = 'add-url';

/**
 * Command to manually submit a daily image url with a prompt.
 */
export class AddUrl implements Command {
    public names = [addUrlCommandName];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, _: EventData): Promise<void> {
        const url = intr.options.get('url')?.value as string;
        const prompt = intr.options.get('prompt')?.value as string;

        const embed = new EmbedBuilder();

        if (!url || !prompt) {
            await InteractionUtils.send(
                intr,
                embed
                    .setTitle('Invalid Arguments')
                    .setColor('Red')
                    .setDescription('Please provide a valid `url` and `prompt`')
            );
            return;
        }

        if (!(await imageExists(url))) {
            await InteractionUtils.send(
                intr,
                embed
                    .setTitle('Invalid URL')
                    .setColor('Red')
                    .setDescription('Image at the given URL does not exist')
            );
            return;
        }

        await prisma.imageStore.create({
            data: {
                url,
                prompt,
            },
        });

        await InteractionUtils.send(
            intr,
            embed
                .setImage(url)
                .setColor('Green')
                .setTitle('URL Received!')
                .setDescription(`"\`${prompt}\`"`)
        );
    }
}
