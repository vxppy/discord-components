import {
    BaseActionComponent,
    type ActionComponentData,
    type ActionComponentJSON,
    type Mentionable,
} from '../base.js';
import { ComponentType } from '../componentType.js';
import BuildValidationError from '../error.js';
import requireField from '../utils/requireField.js';

interface ChannelSelectData extends ActionComponentData {
    default_values?: string[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

interface ChannelSelectPayload extends ActionComponentJSON {
    default_values?: Mentionable<'channel'>[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

class ChannelSelectComponent extends BaseActionComponent<
    ComponentType.ChannelSelect,
    ChannelSelectData,
    ChannelSelectPayload
> {
    constructor(data: ChannelSelectData = {}) {
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

    defaultValues(...values: string[]) {
        this.data.default_values = values;
        return this;
    }

    clone(): this {
        return new ChannelSelectComponent({ ...this.data }) as this;
    }

    toJSON(): ChannelSelectPayload {
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
                      type: 'channel',
                      id: x,
                  }))
                : undefined,
        };
    }
}

export function channelSelect() {
    return new ChannelSelectComponent();
}

export type { ChannelSelectComponent };
