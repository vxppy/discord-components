import {
    BaseComponent,
    type BaseComponentData,
    type ComponentJSON,
} from '../base.js';
import { ComponentType } from '../componentType.js';

interface SeparatorData extends BaseComponentData {
    divider: boolean;
    spacing: 1 | 2;
}

interface SeparatorPayload extends ComponentJSON {
    divider?: boolean;
    spacing?: 1 | 2;
}

class SeparatorComponent extends BaseComponent<
    ComponentType.Separator,
    SeparatorData,
    SeparatorPayload
> {
    static cache: SeparatorComponent[] = [
        new SeparatorComponent({ divider: true, spacing: 1 }),
    ];

    constructor(data: SeparatorData) {
        super(data);
    }

    id(id: string) {
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

    toJSON(): SeparatorPayload {
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
