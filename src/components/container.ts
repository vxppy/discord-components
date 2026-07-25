import {
    BaseComponent,
    type BaseComponentData,
    type ColorResolable,
    type PartList,
} from './base.js';
import BuildValidationError from '../error.js';
import type { FlattenableArray } from '../utils/normalize.js';
import normalize from '../utils/normalize.js';
import parseHex from '../utils/parseHex.js';
import type { ActionRowComponent } from './actionRow.js';
import type { FileComponent } from './file.js';
import type { MediaGalleryComponent } from './mediaGallery.js';
import type { SectionComponent } from './section.js';
import type { SeparatorComponent } from './separator.js';
import type { TextDisplayComponent } from './textDisplay.js';
import {
    ComponentType,
    type APIComponentInContainer,
    type APIContainerComponent,
} from 'discord-api-types/v10';

type ContainerChild =
    | ActionRowComponent
    | SectionComponent
    | TextDisplayComponent
    | SeparatorComponent
    | MediaGalleryComponent
    | FileComponent;

const ContainerValidTypes = [
    ComponentType.ActionRow,
    ComponentType.Section,
    ComponentType.TextDisplay,
    ComponentType.Separator,
    ComponentType.MediaGallery,
    ComponentType.File,
];

interface ContainerData extends BaseComponentData {
    accent_color?: number;
    spoiler?: boolean;
    components: ContainerChild[];
}

class ContainerComponent
    extends BaseComponent<
        ComponentType.Container,
        ContainerData,
        APIContainerComponent
    >
    implements PartList<ContainerChild>
{
    constructor(data: ContainerData) {
        super(data);
    }

    get Type(): ComponentType.Container {
        return ComponentType.Container;
    }

    get Components(): readonly ContainerChild[] {
        return [...this.data.components];
    }

    get AccentColor() {
        return this.data.accent_color;
    }

    get IsSpoiler() {
        return this.data.spoiler;
    }

    accent(color: ColorResolable) {
        this.data.accent_color =
            typeof color == 'number' ? color : parseHex(color);

        return this;
    }

    spoiler(state: boolean = true) {
        this.data.spoiler = state;

        return this;
    }

    first(): ContainerChild | undefined {
        return this.data.components[0];
    }

    last(): ContainerChild | undefined {
        return this.data.components[this.data.components.length - 1];
    }

    at(index: number): ContainerChild | undefined {
        return this.data.components.at(index);
    }

    push(...parts: FlattenableArray<ContainerChild>): this {
        this.data.components.push(...normalize(parts));
        return this;
    }

    shift(): ContainerChild | undefined {
        return this.data.components.shift();
    }

    unshift(...parts: FlattenableArray<ContainerChild>): this {
        this.data.components.unshift(...normalize(parts));
        return this;
    }

    pop(): ContainerChild | undefined {
        return this.data.components.pop();
    }

    insert(index: number, ...parts: FlattenableArray<ContainerChild>): this {
        this.data.components.splice(index, 0, ...normalize(parts));
        return this;
    }

    remove(...parts: ContainerChild[]): this {
        this.data.components.filter((i) => parts.includes(i));
        return this;
    }

    removeAt(index: number, count: number = 1): ContainerChild[] {
        return this.data.components.splice(index, count);
    }

    splice(
        index: number,
        count: number,
        ...parts: FlattenableArray<ContainerChild>
    ): ContainerChild[] {
        return this.data.components.splice(index, count, ...normalize(parts));
    }

    components(...parts: FlattenableArray<ContainerChild>): this {
        this.data.components = normalize(parts);
        return this;
    }

    clone(): this {
        return new ContainerComponent({
            ...this.data,
            components: this.data.components.map((i) => i.clone()),
        }) as this;
    }

    toJSON(): APIContainerComponent {
        if (!this.data.components.length) {
            throw new BuildValidationError(
                'Container must contain at least one component',
                ['container'],
            );
        }

        const components: APIComponentInContainer[] = new Array(
            this.data.components.length,
        );

        for (let i = 0; i < components.length; i++) {
            try {
                const component = this.data.components[i]!.toJSON();

                if (!ContainerValidTypes.includes(component.type)) {
                    throw new BuildValidationError(
                        `Container can only have components one of [${ContainerValidTypes.join(', ')}] type`,
                        [`container.components[${i}]`],
                    );
                }

                components[i] = component;
            } catch (e) {
                if (!(e instanceof BuildValidationError)) throw e;

                throw new BuildValidationError(e.reason, [
                    `container.components[${i}]`,
                    ...e.path,
                ]);
            }
        }

        return {
            type: ComponentType.Container,
            ...this.data,
            components: components,
        };
    }
}

export function container(...components: FlattenableArray<ContainerChild>) {
    return new ContainerComponent({ components: normalize(components) });
}

export type { ContainerComponent };
