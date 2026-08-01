import {
    ComponentType,
    type APISeparatorComponent,
} from 'discord-api-types/v10';
import { BaseComponent, type BaseComponentData } from './base.js';

interface SeparatorData extends BaseComponentData {
    divider: boolean;
    spacing: 1 | 2;
}

class SeparatorComponent extends BaseComponent<
    ComponentType.Separator,
    SeparatorData,
    APISeparatorComponent
> {
    constructor(data: SeparatorData) {
        super(data);
    }

    get Type(): ComponentType.Separator {
        return ComponentType.Separator;
    }

    /**
     * Whether the separator has a divider or not
     */
    get HasDivider() {
        return this.data.divider;
    }

    /**
     * The spacing of the separator
     */
    get Spacing() {
        return this.data.spacing;
    }

    id(id: number) {
        return new SeparatorComponent({ ...this.data, id }) as this;
    }

    private static get(divider: boolean, spacing: 1 | 2) {
        const index = (Number(divider) << 1) | (spacing - 1);

        return (
            cache[index] ??
            (cache[index] = new SeparatorComponent({ divider, spacing }))
        );
    }

    /**
     * Set whether the separator is hidden or not (default `true`)
     * @param divider
     */
    hide(divider: boolean = true) {
        return SeparatorComponent.get(!divider, this.data.spacing);
    }

    /**
     * Set the spacing of the separator
     * @param spacing
     */
    spacing(spacing: 1 | 2) {
        return SeparatorComponent.get(this.data.divider, spacing);
    }

    clone(): this {
        return this;
    }

    toJSON(): APISeparatorComponent {
        return {
            type: ComponentType.Separator,
            ...this.data,
        };
    }
}

const cache: SeparatorComponent[] = [
    new SeparatorComponent({ divider: true, spacing: 1 }),
];

/**
 * Creates a SeparatorComponent
 */
export function separator() {
    return cache[0]!;
}

export type { SeparatorComponent };
