import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';
import { prisma } from '../../prisma.js';
import { Lang } from '../../services/index.js';
import { Command, CommandDeferType } from '../command.js';
import { EventData } from '../../models/internal-models.js';
import { InteractionUtils } from '../../utils/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { processingDaily } from '../../jobs/daily.js';
import fetch from 'node-fetch';

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

        // get the prompt from the named option
        console.log(intr.options);
        const prompt = intr.options.get('prompt')?.value as string;

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

        await InteractionUtils.send(intr, `Your prompt is "\`${prompt}\`".`);

        const currentImg = await prisma.dailyImage.findFirst();

        function getScore(guessedPrompt: string, truePrompt: string): Promise<number> {
            return fetch(
                `https://cal-score.vercel.app/api/score?a=${guessedPrompt}&b=${truePrompt}`
            )
                .then(async response => {
                    if (response.ok) {
                        return Number(((await response.json()) as number) * 100);
                    } else {
                        throw new Error('Network response was not ok.');
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                    throw error; // rethrow the error so the caller can handle it
                });
        }

        const currentScore = await getScore(prompt, currentImg.prompt);

        //create a record in the database of User and DalilyPlayer, if not exist
        const user = await prisma.user.findUnique({
            where: {
                discordId: intr.user.id,
            },
        });

        if (!user) {
            await prisma.user.create({
                data: {
                    discordId: intr.user.id,
                    totalScore: 0,
                },
            });
        }

        const dailyPlayer = await prisma.dailyPlayer.findUnique({
            where: {
                discordId: intr.user.id,
            },
        });

        if (!dailyPlayer) {
            await prisma.dailyPlayer.create({
                data: {
                    discordId: intr.user.id,
                    prompt: prompt,
                    score: currentScore,
                    dailyImageId: currentImg.url,
                    dailyImageUrl: currentImg.url,
                },
            });
        } else {
            await prisma.dailyPlayer.update({
                where: {
                    discordId: intr.user.id,
                },
                data: {
                    prompt: prompt,
                    score: currentScore,
                },
            });
        }
    }
}
