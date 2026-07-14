import {
    BaseComponent,
    type BaseComponentData,
    type ComponentJSON,
} from '../base.js';
import { ComponentType } from '../componentType.js';
import type { FlattenableArray } from '../utils/normalize.js';
import normalize from '../utils/normalize.js';

const RichTextFormat = {
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

interface BaseRichTextData {
    language?: string;
    level?: number;
    link?: string;
    orderedItem?: number;
    unorderedItem?: number;
}

type BareRichTextData = BaseRichTextData & { format: number };

type RichTextData = BareRichTextData & {
    content: string;
};

type RichTextResolvable = BaseRichTextData & {
    content: string;
    format?: number;
};

interface TextFormat {
    bold(): this;
    italic(): this;
    underline(): this;
    strikeThrough(): this;

    spoiler(): this;

    quote(): this;
    blockQuote(): this;

    inlineBlock(): this;
    codeblock(language?: string): this;

    heading(level: 1 | 2 | 3): this;
    small(): this;

    ordered(depth?: number): this;
    unordered(depth?: number): this;

    link(link: string): this;
}

type TextNodeResolveable = string | RichTextResolvable | TextNode;

const optionsToNode = (nodes: FlattenableArray<TextNodeResolveable>) =>
    normalize(nodes).map((i) => (i instanceof TextNode ? i : textn(i)));

const rfToContent = (data: RichTextData): string => {
    let content = data.content;

    if (data.format & RichTextFormat.Bold) {
        content = `**${content}**`;
    }

    if (data.format & RichTextFormat.Italic) {
        content = `*${content}*`;
    }

    if (data.format & RichTextFormat.Underline) {
        content = `__${content}__`;
    }

    if (data.format & RichTextFormat.StrikeThrough) {
        content = `~~${content}~~`;
    }

    if (data.format & RichTextFormat.InlineCodeBlock) {
        content = content.includes('`')
            ? `\`\`${content}\`\``
            : `\`${content}\``;
    }

    if (data.format & RichTextFormat.Codeblock) {
        content = `\`\`\`${data.language ? `${data.language}\n` : ''}${content}\`\`\``;
    }

    if (data.format & RichTextFormat.Spoiler) {
        content = `||${content}||`;
    }

    if (data.format & RichTextFormat.Quote) {
        content = `> ${content}`;
    }

    if (data.format & RichTextFormat.BlockQuote) {
        content = `>>> ${content}`;
    }

    if (data.level !== undefined) {
        content =
            data.level == -1
                ? `-# ${content}`
                : `${'#'.repeat(Math.max(1, Math.min(data.level, 3)))} ${content}`;
    }

    if (data.orderedItem !== undefined) {
        content = `${' '.repeat(Math.min(0, data.orderedItem) * 2)}1. ${content}`;
    }

    if (data.unorderedItem !== undefined) {
        content = `${' '.repeat(Math.min(0, data.unorderedItem) * 2)}* ${content}`;
    }

    if (data.link) {
        content = `[${content}](${data.link})`;
    }

    return content;
};

class TextNode implements TextFormat {
    constructor(private rf: RichTextData) {}

    bold(): this {
        this.rf.format |= RichTextFormat.Bold;
        return this;
    }

    italic(): this {
        this.rf.format |= RichTextFormat.Italic;
        return this;
    }

    underline(): this {
        this.rf.format |= RichTextFormat.Underline;
        return this;
    }

    strikeThrough(): this {
        this.rf.format |= RichTextFormat.StrikeThrough;
        return this;
    }

    inlineBlock(): this {
        this.rf.format |= RichTextFormat.InlineCodeBlock;
        return this;
    }

    codeblock(language?: string): this {
        this.rf.format |= RichTextFormat.Codeblock;
        this.rf.language = language;

        return this;
    }

    small(): this {
        this.rf.level = -1;
        return this;
    }

    heading(level: 1 | 2 | 3 = 1): this {
        this.rf.level = level;
        return this;
    }

    spoiler(): this {
        this.rf.format |= RichTextFormat.Spoiler;
        return this;
    }

    quote(): this {
        this.rf.format |= RichTextFormat.Quote;
        return this;
    }

    blockQuote(): this {
        this.rf.format |= RichTextFormat.BlockQuote;
        return this;
    }

    ordered(depth?: number): this {
        this.rf.orderedItem = depth;
        return this;
    }

    unordered(depth?: number): this {
        this.rf.unorderedItem = depth;
        return this;
    }

    link(link: string): this {
        this.rf.link = link;
        return this;
    }

    clone() {
        return new TextNode({ ...this.rf });
    }

    toString() {
        return rfToContent(this.rf);
    }
}

interface TextDisplayPayload extends ComponentJSON {
    content: string;
}

class TextDisplayComponent
    extends BaseComponent<
        ComponentType.TextDisplay,
        BaseComponentData,
        TextDisplayPayload
    >
    implements TextFormat
{
    constructor(
        private parts: TextNode[] = [],
        private rf: BareRichTextData = { format: 0 },
        data: BaseComponentData = {},
    ) {
        super(data);
    }

    content(...parts: FlattenableArray<TextNodeResolveable>) {
        this.parts = optionsToNode(parts);
        return this;
    }

    bold(): this {
        this.rf.format |= RichTextFormat.Bold;
        return this;
    }

    italic(): this {
        this.rf.format |= RichTextFormat.Italic;
        return this;
    }

    underline(): this {
        this.rf.format |= RichTextFormat.Underline;
        return this;
    }

    strikeThrough(): this {
        this.rf.format |= RichTextFormat.StrikeThrough;
        return this;
    }

    inlineBlock(): this {
        this.rf.format |= RichTextFormat.InlineCodeBlock;
        return this;
    }

    codeblock(language?: string): this {
        this.rf.format |= RichTextFormat.Codeblock;
        this.rf.language = language;

        return this;
    }

    small(): this {
        this.rf.level = -1;
        return this;
    }

    heading(level: 1 | 2 | 3 = 1): this {
        this.rf.level = level;
        return this;
    }

    spoiler(): this {
        this.rf.format |= RichTextFormat.Spoiler;
        return this;
    }

    quote(): this {
        this.rf.format |= RichTextFormat.Quote;
        return this;
    }

    blockQuote(): this {
        this.rf.format |= RichTextFormat.BlockQuote;
        return this;
    }

    ordered(depth?: number): this {
        this.rf.orderedItem = depth;
        return this;
    }

    unordered(depth?: number): this {
        this.rf.unorderedItem = depth;
        return this;
    }

    link(link: string): this {
        this.rf.link = link;
        return this;
    }

    clone(): this {
        return new TextDisplayComponent(
            this.parts.map((i) => i.clone()),
            { ...this.rf },
            { ...this.data },
        ) as this;
    }

    serializeContent() {
        const content = this.parts.map((i) => i.toString()).join('');

        return rfToContent({ content, ...this.rf });
    }

    toJSON(): TextDisplayPayload {
        const content = this.serializeContent();

        return {
            type: ComponentType.TextDisplay,
            ...this.data,
            content,
        };
    }
}

export function text(...parts: FlattenableArray<TextNodeResolveable>) {
    return new TextDisplayComponent(optionsToNode(parts));
}

export function textn(part: string | RichTextResolvable) {
    return new TextNode(
        typeof part == 'string'
            ? { content: part, format: 0 }
            : {
                  ...part,
                  format: part.format === undefined ? 0 : part.format,
              },
    );
}

export type { TextDisplayComponent, TextNode };
