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
    static cache: SeparatorComponent[] = [
        new SeparatorComponent({ divider: true, spacing: 1 }),
    ];

    constructor(data: SeparatorData) {
        super(data);
    }

    get Type(): ComponentType.Separator {
        return ComponentType.Separator;
    }

    get Divider() {
        return this.data.divider;
    }

    get Spacing() {
        return this.data.spacing;
    }

    id(id: number) {
        return new SeparatorComponent({ ...this.data, id }) as this;
    }

    private static get(divider: boolean, spacing: 1 | 2) {
        const index = (Number(divider) << 1) | (spacing - 1);

        return (
            this.cache[index] ??
            (this.cache[index] = new SeparatorComponent({ divider, spacing }))
        );
    }

    hide(state: boolean = true) {
        SeparatorComponent.get(!state, this.data.spacing);
    }

    size(value: 1 | 2) {
        return SeparatorComponent.get(this.data.divider, value);
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

export function separator() {
    return SeparatorComponent.cache[0]!;
}

export type { SeparatorComponent };
