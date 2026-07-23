import {
    BaseActionComponent,
    MentionableValue,
    type BaseActionComponentData,
} from './base.js';
import BuildValidationError from '../error.js';
import requireField from '../utils/requireField.js';
import {
    ComponentType,
    type APIChannelSelectComponent,
} from 'discord-api-types/v10';

interface ChannelSelectData extends BaseActionComponentData {
    default_values?: string[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

class ChannelSelectComponent extends BaseActionComponent<
    ComponentType.ChannelSelect,
    ChannelSelectData,
    APIChannelSelectComponent
> {
    constructor(data: ChannelSelectData = {}) {
        super(data);
    }

    get Type(): ComponentType.ChannelSelect {
        return ComponentType.ChannelSelect;
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

    get DefaultValues(): readonly string[] | undefined {
        return this.data.default_values && [...this.data.default_values];
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

    defaultValues(...values: string[]) {
        this.data.default_values = values;
        return this;
    }

    clone(): this {
        return new ChannelSelectComponent({ ...this.data }) as this;
    }

    toJSON(): APIChannelSelectComponent {
        requireField(this.data.custom_id, 'custom_id', {
            builder: 'channelSelect',
            id: this.data.id,
            custom_id: this.data.custom_id,
        });

        if (this.data.min_values !== undefined) {
            if (this.data.min_values < 0 || this.data.min_values > 25) {
                throw new BuildValidationError(
                    'ChannelSelect.min_values must be between 0 and 25',
                    ['channelSelect.min_values'],
                );
            }
        }

        if (this.data.max_values !== undefined) {
            if (this.data.max_values < 1 || this.data.max_values > 25) {
                throw new BuildValidationError(
                    'ChannelSelect.max_values must be between 0 and 25',
                    ['channelSelect.max_values'],
                );
            }
        }

        return {
            type: ComponentType.ChannelSelect,
            ...this.data,
            default_values: this.data.default_values
                ? this.data.default_values.map((x) => ({
                      type: MentionableValue.Channel,
                      id: x,
                  }))
                : undefined,
            custom_id: this.data.custom_id!,
        };
    }
}

export function channelSelect() {
    return new ChannelSelectComponent();
}

export type { ChannelSelectComponent };
