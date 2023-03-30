import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { Lang } from '../../services/index.js';
import { Command, CommandDeferType } from '../command.js';
import { EventData } from '../../models/internal-models.js';
import { InteractionUtils } from '../../utils/index.js';
import { Language } from '../../models/enum-helpers/index.js';

export class Start implements Command {
    public names = ['start'];
    public deferType = CommandDeferType.PUBLIC;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        const user = intr.user;

        // await InteractionUtils.send(intr, Lang.getEmbed('displayEmbeds.test', data.lang));
        await InteractionUtils.send(intr, `Hello ${user.username}`);
    }
}
