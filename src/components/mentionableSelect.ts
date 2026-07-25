import {
    BaseInteractiveComponent,
    MentionableValue,
    type BaseInteractiveComponentData,
    type Mentionable,
    type SelectMenuWithoutOptions,
} from './base.js';
import BuildValidationError from '../error.js';
import requireField from '../utils/requireField.js';
import {
    ComponentType,
    type APIMentionableSelectComponent,
} from 'discord-api-types/v10';

type MentionType = Mentionable<MentionableValue.Role | MentionableValue.User>;

interface MentionableSelectData extends BaseInteractiveComponentData {
    default_values?: MentionType[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

class MentionableSelectComponent
    extends BaseInteractiveComponent<
        ComponentType.MentionableSelect,
        MentionableSelectData,
        APIMentionableSelectComponent
    >
    implements SelectMenuWithoutOptions<MentionType>
{
    constructor(data: MentionableSelectData = {}) {
        super(data);
    }

    get Type(): ComponentType.MentionableSelect {
        return ComponentType.MentionableSelect;
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

    get DefaultValues() {
        return this.data.default_values && [...this.data.default_values];
    }

    placeholder(placeholder?: string) {
        this.data.placeholder = placeholder;
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

    defaultValues(...values: MentionType[]) {
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

/**
 * Creates a MentionableSelectComponent
 */
export function mentionableSelect() {
    return new MentionableSelectComponent();
}

export type { MentionableSelectComponent };
