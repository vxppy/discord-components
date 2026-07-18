// import type { ComponentType } from './componentType.js';

import {
    SelectMenuDefaultValueType,
    type ComponentType,
} from 'discord-api-types/v10';

export interface PartialEmoji {
    id?: string;
    name: string;
    animated?: boolean;
}

export type EmojiResolveable = string | PartialEmoji;

export interface BaseComponentData {
    id?: number;
}

export interface BaseActionComponentData extends BaseComponentData {
    custom_id?: string;
    disabled?: boolean;
}

export type ColorResolable = string | number;

export { SelectMenuDefaultValueType as MentionableValue };

export type Mentionable<T extends SelectMenuDefaultValueType> = {
    type: T;
    id: string;
};

export abstract class BaseComponent<
    TType extends ComponentType,
    TData extends BaseComponentData,
    TPayload,
> {
    declare private readonly _T: TType;

    constructor(protected data: TData) {}

    abstract clone(): this;
    abstract toJSON(): TPayload;

    id(id: number) {
        this.data.id = id;
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }
}

export abstract class BaseActionComponent<
    TType extends ComponentType,
    TData extends BaseActionComponentData,
    TPayload,
> extends BaseComponent<TType, TData, TPayload> {
    constructor(payload: TData) {
        super(payload);
    }

    disable(state: boolean = true) {
        this.data.disabled = state;
        return this;
    }

    customId(id: string) {
        this.data.custom_id = id;
        return this;
    }
}
