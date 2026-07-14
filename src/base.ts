import type { ComponentType } from './componentType.js';

export interface PartialEmoji {
    id?: string;
    name: string;
    animated?: boolean;
}

export type EmojiResolveable = string | PartialEmoji;

export interface BaseComponentData {
    id?: string;
}

export interface ComponentJSON {
    type: number;
    id?: string;
}

export interface ActionComponentData extends BaseComponentData {
    custom_id?: string;
    disabled?: boolean;
}

export interface ActionComponentJSON extends ComponentJSON {
    custom_id?: string;
    disabled?: boolean;
}

export interface UnfurledMediaItemPayload {
    url: string;
}

export type ColorResolable = string | number;

export type Mentionable<T extends string = 'channel' | 'role' | 'user'> = {
    type: T;
    id: string;
};

export abstract class BaseComponent<
    TType extends ComponentType,
    TData extends BaseComponentData,
    TPayload extends ComponentJSON,
> {
    declare private readonly _T: TType;

    constructor(protected data: TData) {}

    abstract clone(): this;
    abstract toJSON(): TPayload;

    id(id: string) {
        this.data.id = id;
        return this;
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }
}

export abstract class BaseActionComponent<
    TType extends ComponentType,
    TData extends ActionComponentData,
    TPayload extends ComponentJSON,
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
