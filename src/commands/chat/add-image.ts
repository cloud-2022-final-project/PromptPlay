import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';
import { Command, CommandDeferType } from '../command.js';
import { EventData } from '../../models/internal-models.js';
import { InteractionUtils, allowedImageTypes } from '../../utils/index.js';
import { prisma } from '../../prisma.js';
import mime from 'mime';

export const addImageCommandName = 'add-image';

/**
 * Command to manually submit a daily image with a prompt.
 */
export class AddImage implements Command {
    public names = [addImageCommandName];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        const attachment = intr.options.get('image')?.attachment;
        const contentType = attachment?.contentType;

        const embed = new EmbedBuilder();

        // verify image type
        const mimeType = mime.getExtension(contentType);
        if (!allowedImageTypes.includes(mime.getExtension(contentType))) {
            await InteractionUtils.send(
                intr,
                embed
                    .setTitle('Invalid Image Type')
                    .setColor('Red')
                    .setDescription(
                        `Image mime type \`${mimeType}\` is not supported. Supported image mime types: ${allowedImageTypes
                            .map(t => `\`${t}\``)
                            .join(', ')}`
                    )
            );
            return;
        }

        const url = attachment?.url;
        const prompt = intr.options.get('prompt')?.value as string;

        if (!url || !prompt) {
            await InteractionUtils.send(
                intr,
                embed
                    .setTitle('Invalid Arguments')
                    .setColor('Red')
                    .setDescription('Please provide a valid `image` and `prompt`')
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
                .setTitle('Image Received!')
                .setDescription(`"\`${prompt}\`"`)
        );
    }
}
