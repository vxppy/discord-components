import {
    BaseActionComponent,
    type BaseActionComponentData,
    type PartialEmoji,
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

interface StringSelectData extends BaseActionComponentData {
    options: SelectOption[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

type StringSelectOption = SelectOption | SelectOptionData;

const normalizeOptions = (x: FlattenableArray<StringSelectOption>) =>
    normalize(x).map((i) => (i instanceof SelectOption ? i : option(i)));

class StringSelectComponent extends BaseActionComponent<
    ComponentType.StringSelect,
    StringSelectData,
    APIStringSelectComponent
> {
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

    options(...options: FlattenableArray<StringSelectOption>) {
        this.data.options = normalizeOptions(options);
        return this;
    }

    append(...options: FlattenableArray<StringSelectOption>) {
        this.data.options.push(...normalizeOptions(options));
        return this;
    }

    placeholder(content: string) {
        this.data.placeholder = content;
        return this;
    }

    minValues(count: number) {
        if (count < 0 || count > 25) {
            throw new Error('Invalid count for string select menu');
        }

        this.data.min_values = count;
    }

    maxValues(count: number) {
        if (count < 1 || count > 25) {
            throw new Error('Invalid count for string select menu');
        }

        this.data.max_values = count;
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
