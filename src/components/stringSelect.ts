import {
    BaseInteractiveComponent,
    type BaseInteractiveComponentData,
    type PartialEmoji,
    type PartList,
    type SelectMenu,
} from './base.js';
import BuildValidationError from '../error.js';
import type { FlattenableArray } from '../utils/normalize.js';
import normalize from '../utils/normalize.js';
import requireField from '../utils/requireField.js';
import resolveEmoji from '../utils/resolveEmoji.js';
import type { APIStringSelectComponent } from 'discord-api-types/v10';
import { ComponentType } from 'discord-api-types/v9';

interface SelectOptionData {
    label: string;
    value: string;
    description?: string;
    emoji?: PartialEmoji;
    default?: boolean;
}

class SelectOption {
    constructor(private data: SelectOptionData) {}

    get Label() {
        return this.data.label;
    }

    get Value() {
        return this.data.value;
    }

    get Description() {
        return this.data.description;
    }

    get Emoji() {
        return this.data.emoji;
    }

    get IsDefault() {
        return this.data.default;
    }

    label(name: string) {
        this.data.label = name;
        return this;
    }

    value(value: string) {
        this.data.value = value;
        return this;
    }

    description(value: string) {
        this.data.description = value;
        return this;
    }

    emoji(value: string | PartialEmoji) {
        this.data.emoji =
            typeof value == 'string' ? resolveEmoji(value) : value;
        return this;
    }

    default(state: boolean = true) {
        this.data.default = state;
        return this;
    }

    clone() {
        return new SelectOption({ ...this.data });
    }

    toJSON() {
        return {
            ...this.data,
        };
    }
}

export function option(data: SelectOptionData) {
    return new SelectOption(data);
}

interface StringSelectData extends BaseInteractiveComponentData {
    options: SelectOption[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

type StringSelectOption = SelectOption | SelectOptionData;

const normalizeOptions = (x: FlattenableArray<StringSelectOption>) =>
    normalize(x).map((i) => (i instanceof SelectOption ? i : option(i)));

class StringSelectComponent
    extends BaseInteractiveComponent<
        ComponentType.StringSelect,
        StringSelectData,
        APIStringSelectComponent
    >
    implements SelectMenu<string>, PartList<SelectOption>
{
    constructor(data: StringSelectData) {
        super(data);
    }

    get Type(): ComponentType.StringSelect {
        return ComponentType.StringSelect;
    }

    get Placeholder() {
        return this.data.placeholder;
    }

    get MinValue() {
        return this.data.min_values;
    }

    get MaxValues() {
        return this.data.max_values;
    }

    get Options(): readonly SelectOption[] {
        return this.data.options;
    }

    placeholder(content: string) {
        this.data.placeholder = content;
        return this;
    }

    minValues(count: number = 1) {
        if (count < 1 || count > 25) {
            throw new Error('Invalid count for string select menu');
        }

        this.data.min_values = count;
        return this;
    }

    maxValues(count: number = 1) {
        if (count < 1 || count > 25) {
            throw new Error('Invalid count for string select menu');
        }

        this.data.max_values = count;
        return this;
    }

    first(): SelectOption | undefined {
        return this.data.options[0];
    }

    last(): SelectOption | undefined {
        return this.data.options[this.data.options.length - 1];
    }

    at(index: number): SelectOption | undefined {
        return this.data.options.at(index);
    }

    push(...parts: FlattenableArray<SelectOption>): this {
        this.data.options.push(...normalize(parts));
        return this;
    }

    shift(): SelectOption | undefined {
        return this.data.options.shift();
    }

    unshift(...parts: FlattenableArray<SelectOption>): this {
        this.data.options.unshift(...normalize(parts));
        return this;
    }

    pop(): SelectOption | undefined {
        return this.data.options.pop();
    }

    insert(index: number, ...parts: FlattenableArray<SelectOption>): this {
        this.data.options.splice(index, 0, ...normalize(parts));
        return this;
    }

    remove(...parts: SelectOption[]): this {
        this.data.options.filter((i) => parts.includes(i));
        return this;
    }

    removeAt(index: number, count: number = 1): SelectOption[] {
        return this.data.options.splice(index, count);
    }

    splice(
        index: number,
        count: number,
        ...parts: FlattenableArray<SelectOption>
    ): SelectOption[] {
        return this.data.options.splice(index, count, ...normalize(parts));
    }

    options(...options: FlattenableArray<SelectOption>) {
        this.data.options = normalizeOptions(options);
        return this;
    }

    clone() {
        return new StringSelectComponent({
            ...this.data,
            options: [...this.data.options],
        }) as this;
    }

    toJSON(): APIStringSelectComponent {
        requireField(this.data.custom_id, 'custom_id', {
            builder: 'stringSelect',
            id: this.data.id,
            custom_id: this.data.custom_id,
        });

        if (!this.data.options.length) {
            throw new BuildValidationError(
                'StringSelect must contain at least 1 options',
                ['stringSelect'],
            );
        }

        if (this.data.options.length > 25) {
            throw new BuildValidationError(
                'StringSelect must contain at most 25 options',
                ['stringSelect'],
            );
        }

        if (this.data.min_values !== undefined) {
            if (this.data.min_values < 0 || this.data.min_values > 25) {
                throw new BuildValidationError(
                    'StringSelect.min_values must be between 0 and 25',
                    ['stringSelect.min_values'],
                );
            }
        }

        if (this.data.max_values !== undefined) {
            if (this.data.max_values < 1 || this.data.max_values > 25) {
                throw new BuildValidationError(
                    'StringSelect.max_values must be between 0 and 25',
                    ['stringSelect.max_values'],
                );
            }
        }

        const options: SelectOptionData[] = new Array(this.data.options.length);

        for (let i = 0; i < options.length; i++) {
            try {
                options[i] = this.data.options[i]!.toJSON();
            } catch (e) {
                if (!(e instanceof BuildValidationError)) throw e;

                throw new BuildValidationError(e.reason, [
                    `stringSelect.options[${i}]`,
                    ...e.path,
                ]);
            }
        }

        return {
            type: ComponentType.StringSelect,
            ...this.data,
            custom_id: this.data.custom_id!,
            options,
        };
    }
}

export function stringSelect(...options: FlattenableArray<StringSelectOption>) {
    return new StringSelectComponent({
        options: normalizeOptions(options),
    });
}

export type { SelectOption, StringSelectComponent };
