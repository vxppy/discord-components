# @vxppy/discord-components

A simple builder library for creating Discord Components V2 messages. Compatible with discord.js.

Components are plain builder objects that can be nested and configured through a fluent API. Helper functions such as text(), container(), and actionRow() create their respective builders with sensible defaults.

## Installation

```sh
mkdir project_name
cd project_name
git clone https://github.com/vxppy/discord-components.git .
```

## Quick Start

```ts
import {
    actionRow,
    buttons,
    ButtonStyle,
    container,
    text,
} from '@vxppy/discord-components';

const body = container(
    text('Say hi'),
    actionRow(
        buttons
            .regular({
                label: 'Hi!',
                customId: 'say-hi',
            })
            .style(ButtonStyle.Success),
    ),
);
```
