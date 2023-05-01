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
                    .setColor('Red')
                    .setTitle('Nope!')
                    .setDescription(
                        'The daily result is being processed! Please try again in a few minutes.'
                    )
            );
            return;
        }

        // get the prompt from the named option
        const prompt = intr.options.get('prompt')?.value as string;

        // check if the prompt is valid
        if (!prompt) {
            await InteractionUtils.send(
                intr,
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Nope!')
                    .setDescription('Please enter the `prompt` named option.')
            );
            return;
        }

        // get the current daily image
        const currentImg = await prisma.dailyImage.findFirst();

        // check if there is an active (in play) daily image
        if (!currentImg || !currentImg.active) {
            await InteractionUtils.send(
                intr,
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('😰😰😰')
                    .setDescription('There is no active daily prompt. Please try again later.')
            );
            return;
        }

        // get the score of the guess
        const newScore = await getSimilarityScore(prompt, currentImg.prompt);

        // // create a user if they don't exist
        // await prisma.user.upsert({
        //     where: {
        //         discordId: intr.user.id,
        //     },
        //     create: {
        //         discordId: intr.user.id,
        //     },
        //     update: {},
        // });

        // create a daily player if they don't exist or update their guess info
        const existingPlayer = await prisma.dailyPlayer.findFirst({
            where: {
                discordId: intr.user.id,
            },
            select: {
                score: true,
            },
        });

        if (existingPlayer) {
            // has guessed before for this daily image
            await Promise.all([
                prisma.dailyPlayer.update({
                    where: {
                        discordId: intr.user.id,
                    },
                    data: {
                        prompt,
                        score: newScore,
                        dailyImageUrl: currentImg.url,
                    },
                }),
                // prisma.user.update({
                //     where: {
                //         discordId: intr.user.id,
                //     },
                //     data: {
                //         totalScore: {
                //             increment: newScore - existingPlayer.score, // increment by the difference because the score is being updated
                //         },
                //     },
                // }),
            ]);
        } else {
            await Promise.all([
                prisma.dailyPlayer.create({
                    data: {
                        discordId: intr.user.id,
                        prompt,
                        score: newScore,
                        dailyImageUrl: currentImg.url,
                    },
                }),
                // prisma.user.update({
                //     where: {
                //         discordId: intr.user.id,
                //     },
                //     data: {
                //         totalScore: {
                //             increment: newScore, // increment by the new score
                //         },
                //     },
                // }),
            ]);
        }

        await InteractionUtils.send(
            intr,
            new EmbedBuilder().setTitle('Prompt received!').setDescription(`"\`${prompt}\`"`)
        );
    }
}

async function getSimilarityScore(sentenceA: string, sentenceB: string): Promise<number> {
    return fetch(`https://cal-score.vercel.app/api/score?a=${sentenceA}&b=${sentenceB}`)
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
