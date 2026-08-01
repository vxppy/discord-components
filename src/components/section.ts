import {
    BaseComponent,
    type BaseComponentData,
    type PartList,
} from './base.js';
import BuildValidationError from '../error.js';
import type { FlattenableArray } from '../utils/normalize.js';
import normalize from '../utils/normalize.js';
import requireField from '../utils/requireField.js';
import type { ButtonComponent } from './button.js';
import type { TextDisplayComponent } from './textDisplay.js';
import type { ThumbnailComponent } from './thumbnail.js';
import type {
    APISectionAccessoryComponent,
    APISectionComponent,
    APITextDisplayComponent,
} from 'discord-api-types/v10';
import { ComponentType } from 'discord-api-types/v9';

type SectionAccessory = ButtonComponent | ThumbnailComponent;
type SectionChild = TextDisplayComponent;

interface SectionData extends BaseComponentData {
    accessory?: SectionAccessory; // validated at runtime
    components: SectionChild[];
}

class SectionComponent
    extends BaseComponent<
        ComponentType.Section,
        SectionData,
        APISectionComponent
    >
    implements PartList<SectionChild>
{
    constructor(data: SectionData) {
        super(data);
    }

    get Type(): ComponentType.Section {
        return ComponentType.Section;
    }

    /**
     * The components in the section
     */
    get Components(): readonly SectionChild[] {
        return [...this.data.components];
    }

    /**
     * The accessory of the section
     */
    get Accessory() {
        return this.data.accessory;
    }

    /**
     * Sets the accessory of the section
     * @param accessory The accessory to use
     */
    accessory(accessory: SectionAccessory) {
        this.data.accessory = accessory;
        return this;
    }

    first(): SectionChild | undefined {
        return this.data.components[0];
    }

    last(): SectionChild | undefined {
        return this.data.components[this.data.components.length - 1];
    }

    at(index: number): SectionChild | undefined {
        return this.data.components.at(index);
    }

    push(...parts: FlattenableArray<SectionChild>): this {
        this.data.components.push(...normalize(parts));
        return this;
    }

    shift(): SectionChild | undefined {
        return this.data.components.shift();
    }

    unshift(...parts: FlattenableArray<SectionChild>): this {
        this.data.components.unshift(...normalize(parts));
        return this;
    }

    pop(): SectionChild | undefined {
        return this.data.components.pop();
    }

    insert(index: number, ...parts: FlattenableArray<SectionChild>): this {
        this.data.components.splice(index, 0, ...normalize(parts));
        return this;
    }

    remove(...parts: SectionChild[]): this {
        this.data.components.filter((i) => parts.includes(i));
        return this;
    }

    removeAt(index: number, count: number = 1): SectionChild[] {
        return this.data.components.splice(index, count);
    }

    splice(
        index: number,
        count: number,
        ...parts: FlattenableArray<SectionChild>
    ): SectionChild[] {
        return this.data.components.splice(index, count, ...normalize(parts));
    }

    /**
     * Replace components in the section
     * @param parts The new components to replace the old with
     */
    components(...parts: FlattenableArray<SectionChild>): this {
        this.data.components = normalize(parts);
        return this;
    }

    clone(): this {
        return new SectionComponent({
            ...this.data,
            accessory: this.data.accessory?.clone(),
            components: this.data.components.map((i) => i.clone()),
        }) as this;
    }

    toJSON(): APISectionComponent {
        requireField(this.data.accessory, 'accessory', {
            builder: 'section',
            id: this.data.id,
        });

        let accessory: APISectionAccessoryComponent;

        try {
            accessory = this.data.accessory.toJSON();

            if (
                accessory.type != ComponentType.Button &&
                accessory.type != ComponentType.Thumbnail
            ) {
                throw new BuildValidationError(
                    `Section accessory can only be of type [${ComponentType.Button}, ${ComponentType.Thumbnail}]`,
                    ['section.accessory'],
                );
            }
        } catch (e) {
            if (!(e instanceof BuildValidationError)) throw e;

            throw new BuildValidationError(e.reason, [
                `section.accessory`,
                ...e.path,
            ]);
        }

        const components: APITextDisplayComponent[] = new Array(
            this.data.components.length,
        );

        for (let i = 0; i < components.length; i++) {
            try {
                const component = this.data.components[i]!.toJSON();

                if (component.type != ComponentType.TextDisplay) {
                    throw new BuildValidationError(
                        `Section can only have components of [${ComponentType.TextDisplay}] type`,
                        [`section.components[${i}]`],
                    );
                }

                components[i] = component;
            } catch (e) {
                if (!(e instanceof BuildValidationError)) throw e;

                throw new BuildValidationError(e.reason, [
                    `section.components[${i}]`,
                    ...e.path,
                ]);
            }
        }

        return {
            type: ComponentType.Section,
            accessory: accessory,
            components: components,
        };
    }
}

/**
 * Creates a SectionComponent
 * @param components The components to add to the section
 */
export function section(...components: FlattenableArray<SectionChild>) {
    return new SectionComponent({ components: normalize(components) });
}

export type { SectionComponent };
