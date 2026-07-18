import {
    BaseActionComponent,
    MentionableValue,
    type BaseActionComponentData,
    type Mentionable,
} from './base.js';
import BuildValidationError from '../error.js';
import requireField from '../utils/requireField.js';
import {
    ComponentType,
    type APIMentionableSelectComponent,
} from 'discord-api-types/v10';

interface MentionableSelectData extends BaseActionComponentData {
    default_values?: Mentionable<
        MentionableValue.Role | MentionableValue.User
    >[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

class MentionableSelectComponent extends BaseActionComponent<
    ComponentType.MentionableSelect,
    MentionableSelectData,
    APIMentionableSelectComponent
> {
    constructor(data: MentionableSelectData = {}) {
        super(data);
    }

    customId(name: string) {
        this.data.custom_id = name;
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

    disable(state: boolean = true) {
        this.data.disabled = state;
        return this;
    }

    defaultValues(
        ...values: Mentionable<MentionableValue.Role | MentionableValue.User>[]
    ) {
        this.data.default_values = values;
        return this;
    }

    clone(): this {
        return new MentionableSelectComponent({ ...this.data }) as this;
    }

    toJSON(): APIMentionableSelectComponent {
        requireField(this.data.custom_id, 'custom_id', {
            builder: 'mentionableSelect',
            id: this.data.id,
            custom_id: this.data.custom_id,
        });

        if (this.data.min_values !== undefined) {
            if (this.data.min_values < 0 || this.data.min_values > 25) {
                throw new BuildValidationError(
                    'MentionableSelect.min_values must be between 0 and 25',
                    ['mentionableSelect.min_values'],
                );
            }
        }

        if (this.data.max_values !== undefined) {
            if (this.data.max_values < 1 || this.data.max_values > 25) {
                throw new BuildValidationError(
                    'MentionableSelect.max_values must be between 0 and 25',
                    ['mentionableSelect.max_values'],
                );
            }
        }

        return {
            type: ComponentType.MentionableSelect,
            ...this.data,
            default_values: this.data.default_values
                ? this.data.default_values
                : undefined,
            custom_id: this.data.custom_id!,
        };
    }
}

export function mentionableSelect() {
    return new MentionableSelectComponent();
}

export type { MentionableSelectComponent };
