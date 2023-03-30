import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { Lang } from '../../services/index.js';
import { Command, CommandDeferType } from '../command.js';
import { EventData } from '../../models/internal-models.js';
import { InteractionUtils } from '../../utils/index.js';
import { Language } from '../../models/enum-helpers/index.js';

/**
 * This command handles when a room owner _forcefully_ starts the game.
 * The game usually starts when a specific number of players have joined the room.
 * If there are players less than the number, the game will not start.
 * The room owner can use this command to start the game without having to wait.
 */
export class Start implements Command {
    public names = [Lang.getRef('chatCommands.start', Language.Default)];
    public deferType = CommandDeferType.PUBLIC;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        const user = intr.user;

        // await InteractionUtils.send(intr, Lang.getEmbed('displayEmbeds.test', data.lang));
        await InteractionUtils.send(intr, `Hello ${user.username}`);
    }
}
