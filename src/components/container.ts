import {
    BaseComponent,
    type BaseComponentData,
    type ColorResolable,
    type ComponentJSON,
} from '../base.js';
import { ComponentType } from '../componentType.js';
import BuildValidationError from '../error.js';
import type { FlattenableArray } from '../utils/normalize.js';
import normalize from '../utils/normalize.js';
import parseHex from '../utils/parseHex.js';
import type { ActionRowComponent } from './actionRow.js';
import type { FileComponent } from './file.js';
import type { MediaGalleryComponent } from './mediaGallery.js';
import type { SectionComponent } from './section.js';
import type { SeparatorComponent } from './separator.js';
import type { TextDisplayComponent } from './text.js';

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
    ComponentType.MediaGallery,
    ComponentType.File,
];

interface ContainerData extends BaseComponentData {
    accent_color?: number;
    spoiler?: boolean;
    components: ContainerChild[];
}

interface ContainerPayload extends ComponentJSON {
    components: ComponentJSON[];
    accent_color?: number;
    spoiler?: boolean;
}

class ContainerComponent extends BaseComponent<
    ComponentType.Section,
    ContainerData,
    ContainerPayload
> {
    constructor(data: ContainerData) {
        super(data);
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

    items(...components: FlattenableArray<ContainerChild>) {
        this.data.components = normalize(components);
    }

    append(...components: FlattenableArray<ContainerChild>) {
        this.data.components.push(...normalize(components));
    }

    clone(): this {
        return new ContainerComponent({
            ...this.data,
            components: this.data.components.map((i) => i.clone()),
        }) as this;
    }

    toJSON(): ContainerPayload {
        if (!this.data.components.length) {
            throw new BuildValidationError(
                'Container must contain at least one component',
                ['container'],
            );
        }

        const components: ComponentJSON[] = new Array(
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
            type: ComponentType.Section,
            components: components,
        };
    }
}

export function container(...components: FlattenableArray<ContainerChild>) {
    return new ContainerComponent({ components: normalize(components) });
}

export type { ContainerComponent };
