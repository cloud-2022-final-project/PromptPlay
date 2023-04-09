import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';
import { Lang } from '../../services/index.js';
import { Command, CommandDeferType } from '../command.js';
import { EventData } from '../../models/internal-models.js';
import { InteractionUtils } from '../../utils/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { processingDaily } from '../../jobs/daily.js';

/**
 * This command handles when a player makes a guess.
 */
export class Guess implements Command {
    public names = [Lang.getRef('chatCommands.guess', Language.Default)];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        if (processingDaily) {
            await InteractionUtils.send(
                intr,
                new EmbedBuilder()
                    .setColor('Random')
                    .setTitle('Nope!')
                    .setDescription(
                        'The daily result is being processed! Please try again in a few minutes.'
                    )
            );
            return;
        }

        // get the prompt
        const prompt = intr.options.getString('prompt');

        // check if the prompt is valid
        if (!prompt) {
            await InteractionUtils.send(
                intr,
                new EmbedBuilder()
                    .setColor('Random')
                    .setTitle('Nope!')
                    .setDescription('Please enter the `prompt` named option.')
            );
            return;
        }

        // TODO: do something with the prompt

        await InteractionUtils.send(intr, `Your prompt is ${prompt}`);
    }
}
