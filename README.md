# @vxppy/discord-components

[![npm version](https://img.shields.io/npm/v/@vxppy/discord-components)](https://www.npmjs.com/package/discord-components)
[![GitHub stars](https://img.shields.io/github/stars/vxppy/discord-components?style=social)](https://github.com/vxppy/discord-components/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A simple builder library for creating Discord Components V2 messages. Compatible with discord.js.

Components are plain builder objects that can be nested and configured through a fluent API. Helper functions such as text(), container(), and actionRow() create their respective builders with sensible defaults.

## Installation

```sh
npm i @vxppy/discord-components
```

## Quick Start

```ts
import { actionRow, button, container, text } from '@vxppy/discord-components';

const body = container(
    text('Say hi'),
    actionRow(button.label('Hi!').customId('hello_world').success()),
);
```

## Documentation

Documentation is currently a work in progress. In the meantime, the source code is fully typed and serves as the primary reference.
