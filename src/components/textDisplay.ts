import { BaseComponent, type BaseComponentData } from './base.js';
import type { FlattenableArray } from '../utils/normalize.js';
import normalize from '../utils/normalize.js';
import type { APITextDisplayComponent } from 'discord-api-types/v10';
import { ComponentType } from 'discord-api-types/v9';
import BuildValidationError from '../error.js';

const RichTextOptions = {
    Bold: 1 << 0,
    Italic: 1 << 1,
    Underline: 1 << 2,
    StrikeThrough: 1 << 2,
    InlineCodeBlock: 1 << 3,
    Codeblock: 1 << 4,
    Spoiler: 1 << 5,
    Quote: 1 << 6,
    BlockQuote: 1 << 7,
};

interface RichTextFormat {
    format: number;
    language?: string;
    level?: number;
    link?: string;
    orderedItem?: number;
    unorderedItem?: number;
}

type TextNodeResolveable = string | TextDisplayComponent;

const formatContent = (content: string, data: RichTextFormat): string => {
    if (data.format & RichTextOptions.Bold) {
        content = `**${content}**`;
    }

    if (data.format & RichTextOptions.Italic) {
        content = `*${content}*`;
    }

    if (data.format & RichTextOptions.Underline) {
        content = `__${content}__`;
    }

    if (data.format & RichTextOptions.StrikeThrough) {
        content = `~~${content}~~`;
    }

    if (data.format & RichTextOptions.InlineCodeBlock) {
        content = content.includes('`')
            ? `\`\`${content}\`\``
            : `\`${content}\``;
    }

    if (data.format & RichTextOptions.Codeblock) {
        content = `\`\`\`${data.language ? `${data.language}\n` : ''}${content}\`\`\``;
    }

    if (data.format & RichTextOptions.Spoiler) {
        content = `||${content}||`;
    }

    if (data.link) {
        content = `[${content}](${data.link})`;
    }

    if (data.orderedItem !== undefined) {
        content = `${' '.repeat(Math.max(0, data.orderedItem) * 2)}1. ${content}`;
    }

    if (data.unorderedItem !== undefined) {
        content = `${' '.repeat(Math.max(0, data.unorderedItem) * 2)}* ${content}`;
    }

    if (data.format & RichTextOptions.Quote) {
        content = `> ${content}`;
    }

    if (data.format & RichTextOptions.BlockQuote) {
        content = `>>> ${content}`;
    }

    if (data.level !== undefined) {
        content =
            data.level == -1
                ? `-# ${content}`
                : `${'#'.repeat(Math.max(1, Math.min(data.level, 3)))} ${content}`;
    }

    return content;
};

interface RichTextStorage {
    content?: string;
    children?: TextDisplayComponent[];
}

const partsToNode = (
    children: FlattenableArray<TextNodeResolveable>,
): RichTextStorage => {
    const formatted = normalize(children);

    if (formatted.length == 1 && typeof formatted[0] == 'string') {
        return {
            content: formatted[0].trim(),
        };
    }

    const result: RichTextStorage = {
        children: [],
    };

    for (const item of formatted) {
        if (item instanceof TextDisplayComponent) {
            result.children!.push(item);
        } else {
            result.children!.push(
                new TextDisplayComponent({
                    content: item,
                }),
            );
        }
    }

    return result;
};

class TextDisplayComponent extends BaseComponent<
    ComponentType.TextDisplay,
    BaseComponentData,
    APITextDisplayComponent
> {
    private marked = false;

    constructor(
        private storage: RichTextStorage = {},
        private formatting: RichTextFormat = { format: 0 },
    ) {
        super({});
    }

    get Type(): ComponentType.TextDisplay {
        return ComponentType.TextDisplay;
    }

    get Content() {
        return this.toString();
    }

    content(...parts: FlattenableArray<TextNodeResolveable>) {
        this.storage = partsToNode(parts);
        return this;
    }

    bold(): this {
        this.formatting.format |= RichTextOptions.Bold;
        return this;
    }

    italic(): this {
        this.formatting.format |= RichTextOptions.Italic;
        return this;
    }

    underline(): this {
        this.formatting.format |= RichTextOptions.Underline;
        return this;
    }

    strikeThrough(): this {
        this.formatting.format |= RichTextOptions.StrikeThrough;
        return this;
    }

    inlineBlock(): this {
        this.formatting.format |= RichTextOptions.InlineCodeBlock;
        return this;
    }

    codeblock(language?: string): this {
        this.formatting.format |= RichTextOptions.Codeblock;
        this.formatting.language = language;

        return this;
    }

    small(): this {
        this.formatting.level = -1;
        return this;
    }

    heading(level: 1 | 2 | 3 = 1): this {
        this.formatting.level = level;
        return this;
    }

    spoiler(): this {
        this.formatting.format |= RichTextOptions.Spoiler;
        return this;
    }

    quote(): this {
        this.formatting.format |= RichTextOptions.Quote;
        return this;
    }

    blockQuote(): this {
        this.formatting.format |= RichTextOptions.BlockQuote;
        return this;
    }

    ordered(depth: number = 0): this {
        this.formatting.orderedItem = depth;
        return this;
    }

    unordered(depth: number = 0): this {
        this.formatting.unorderedItem = depth;
        return this;
    }

    link(link: string): this {
        this.formatting.link = link;
        return this;
    }

    clone(): this {
        return new TextDisplayComponent(
            {
                content: this.storage.content,
                children: this.storage.children?.map((i) => i.clone()),
            },
            { ...this.formatting },
        ) as this;
    }

    toString(): string {
        if (this.storage.content) {
            return formatContent(this.storage.content, this.formatting);
        }

        if (this.marked) {
            throw new BuildValidationError(
                'Cyclic loop detected when trying to convert to string',
                ['text.content'],
            );
        }

        this.marked = true;

        let content = '';
        try {
            for (let i = 0; i < this.storage.children!.length; i++) {
                const child = this.storage.children![i]!;

                try {
                    content += child.toString();
                } catch (e) {
                    if (e instanceof BuildValidationError) {
                        throw new BuildValidationError(e.reason, [
                            `text.parts[${i}]`,
                            ...e.path,
                        ]);
                    }
                    throw e;
                }
            }
        } finally {
            this.marked = false;
        }

        return formatContent(content, this.formatting);
    }

    toJSON(): APITextDisplayComponent {
        const content = this.toString().trim();

        if (!content.length) {
            throw new BuildValidationError(
                'Empty content in text display component',
                ['text.content'],
            );
        }

        return {
            type: ComponentType.TextDisplay,
            ...this.data,
            content: this.toString().trim(),
        };
    }
}

export function text(...parts: FlattenableArray<TextNodeResolveable>) {
    return new TextDisplayComponent(partsToNode(parts));
}

export type { TextDisplayComponent };
