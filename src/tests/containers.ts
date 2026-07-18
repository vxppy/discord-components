import { container, text } from '@vxppy/discord-components';
import { MessageFlags, TextChannel } from 'discord.js';

declare const channel: TextChannel;

channel.send({
    components: [container()],
    flags: MessageFlags.IsComponentsV2,
});
