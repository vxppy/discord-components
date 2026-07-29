---json
{
    "layout": "page"
}
---

# @vxppy/discord-components

A fluent, type-safe, composable builder library for creating Discord Components V2 messages with discord.js.

```ts
import {
    actionRow,
    button,
    container,
    separator,
    text,
} from '@vxppy/discord-components';

...

// Build a Components V2 message
message.channel.send({
    components: [
        container(
            text('Components V2').heading(2),
            text('Hello world'),
            text(
                'or with a bit more emphasis\n',
                text('HELLO').bold().underline(),
                ' ',
                text('WORLD').strikeThrough().italic(),
            ),
            separator(),
            actionRow(
                button().primary().label('Ready to start?').customId('start'),
            ),
        ).accent(myFavoriteColor),
    ],
    flags: MessageFlags.IsComponentsV2,
});
```

## Features

- Fluent builder API
- Fully typed with Typescript
- Composable text formatting
- Compatible with discord.js

## More

[Guides](guides/) \
[Reference](reference/)
