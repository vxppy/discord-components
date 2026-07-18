import type { PartialEmoji } from '../components/base.js';

export default function resolveEmoji(
    emoji?: string | PartialEmoji,
): PartialEmoji | undefined {
    if (typeof emoji != 'string') {
        return emoji;
    }

    if (emoji[0] == '<' && emoji[1] == '>') {
        emoji = emoji.slice(1, -1);
    }

    const parts = emoji.split(':');

    return {
        id: parts[2],
        name: parts[1]!,
        animated: parts[0] == 'a',
    };
}
