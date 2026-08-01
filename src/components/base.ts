import {
    SelectMenuDefaultValueType,
    type ComponentType,
} from 'discord-api-types/v10';
import type { FlattenableArray } from '../utils/normalize.js';

export interface PartialEmoji {
    id?: string;
    name: string;
    animated?: boolean;
}

export type EmojiResolvable = string | PartialEmoji;

export interface BaseComponentData {
    id?: number;
}

export interface BaseInteractiveComponentData extends BaseComponentData {
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

    /**
     * Deep copies the current object
     */
    abstract clone(): this;
    /**
     * Creates JSON payload for component as used by discord.js
     */
    abstract toJSON(): TPayload;

    /**
     * The type of the component
     */
    abstract get Type(): TType;

    /**
     * The 32-bit integer identifier assigned to the component, if present.
     */
    get Id() {
        return this.data.id;
    }

    /**
     * Sets the 32-bit integer identifier of the component
     *
     * Pass `undefined` to unset
     *
     * @param id 32 bit id to set
     */
    id(id?: number) {
        this.data.id = typeof id == 'number' ? id | 0xff_ff_ff_ff : undefined;
        return this;
    }

    /**
     * Returns the stringified version of toJSON()
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }
}

export abstract class BaseInteractiveComponent<
    TType extends ComponentType,
    TData extends BaseInteractiveComponentData,
    TPayload,
> extends BaseComponent<TType, TData, TPayload> {
    constructor(payload: TData) {
        super(payload);
    }

    /**
     * The custom id of the interactive component
     */
    get CustomId() {
        return this.data.custom_id;
    }

    /**
     * The disabled status of the interactive component
     */
    get IsDisabled() {
        return this.data.disabled;
    }

    /**
     * Sets the customId of the interactive component
     */
    customId(id: string) {
        this.data.custom_id = id;
        return this;
    }

    /**
     * Sets whether the component is disabled or not
     */
    disable(state: boolean = true) {
        this.data.disabled = state;
        return this;
    }
}

export interface CanSpoiler {
    /**
     * Whether the component is marked as a spoiler.
     */
    get IsSpoiler(): boolean | undefined;

    /**
     * Marks or un-marks the component as a spoiler.
     *
     * @param spoiler Whether to mark the component as a spoiler. Defaults to `true`.
     */
    spoiler(spoiler?: boolean): this;
}

export interface HasDescription {
    /**
     * the description of the component.
     */
    get Description(): string | undefined;

    /**
     * Sets the description text of the component.
     *
     * Pass `undefined` to remove the description.
     *
     * @param description The description text
     */
    description(description?: string): this;
}

export interface HasLabel {
    /**
     * the label of the component.
     */
    get Label(): string | undefined;

    /**
     * Sets the description text of the component.
     *
     * Pass `undefined` to remove the description.
     *
     * @param label The label text
     */
    label(label?: string): this;
}

export interface HasUrl {
    /**
     * The url of the component
     */
    get Url(): string | undefined;

    /**
     * Sets the url of the component.
     *
     * @param url The url to set.
     */
    url(url: string): this;
}

export interface SelectMenu<T> {
    /**
     * The placeholder of the select menu
     */
    get Placeholder(): string | undefined;
    /**
     * The minimum selection count of the select menu
     */
    get MinValue(): number | undefined;
    /**
     * The maximum selection count of the select menu
     */
    get MaxValues(): number | undefined;

    /**
     * Sets the placeholder text of the select menu.
     *
     * Pass `undefined` to remove the placeholder.
     *
     * @param placeholder The placeholder text, or `undefined` to remove it.
     */
    placeholder(placeholder?: string): this;
    /**
     * Sets the minimum number of selections required.
     *
     * A value of `0` is only supported for select menus used in modals.
     *
     * @param count The minimum number of selections. Must be between `1` and `25`. Defaults to `1`.
     */
    minValues(count?: number): this;
    /**
     * Sets the maximum number of selections required.
     * @param count The maximum number of selections. Must be between `1` and `25`. Defaults to `1`.
     */
    maxValues(count?: number): this;
}

export interface SelectMenuWithoutOptions<T> extends SelectMenu<T> {
    /**
     * The default values of the select menu.
     */
    get DefaultValues(): readonly T[] | undefined;

    /**
     * Sets the default values for the select menu.
     *
     * The number of values must be between `MinValues` and `MaxValues`.
     *
     * @param values The default selected values.
     */
    defaultValues(...values: T[]): this;
}

export interface PartList<T> {
    /**
     * Gets the first component from the component array
     */
    first(): T | undefined;
    /**
     * Gets the last component from the component array
     */
    last(): T | undefined;
    /**
     * Get the component at index from the component array
     * @param index The index in component array
     */
    at(index: number): T | undefined;

    /**
     * Adds new component to the end of the component array
     * @param parts The component to add
     */
    push(...parts: FlattenableArray<T>): this;
    /**
     * Removes the component from the end of the component array and returns it
     */
    pop(): T | undefined;

    /**
     * Removes the component from the start of the component array and returns it
     */
    shift(): T | undefined;
    /**
     * Adds new component to the start of the component array
     * @param parts The component to add
     */
    unshift(...parts: FlattenableArray<T>): this;

    /**
     * Removes components by identity from the component array.
     *
     * Each component must be the exact same instance as one contained in the component array.
     *
     * @param parts The components to remove.
     */
    remove(...parts: T[]): this;

    /**
     * Inserts new component at the index of the component array
     * @param index The index to insert the components at
     * @param parts The components to insert
     */
    insert(index: number, ...parts: FlattenableArray<T>): this;
    /**
     * Removes components at the index up to count from the component array
     * @param index The index to remove the components at
     * @param count The number of components to remove (default `0`)
     */
    removeAt(index: number, count?: number): T[];

    /**
     * Splice the component array. Remove components at index and then optionally add more components at index
     * @param index The index to remove and insert component at
     * @param count The number of components to remove
     * @param parts The components to insert into the component array
     */
    splice(index: number, count: number, ...parts: FlattenableArray<T>): T[];
}
