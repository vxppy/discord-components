import {
    BaseActionComponent,
    MentionableValue,
    type BaseActionComponentData,
} from './base.js';

import BuildValidationError from '../error.js';
import requireField from '../utils/requireField.js';
import {
    ComponentType,
    type APIUserSelectComponent,
} from 'discord-api-types/v10';

interface UserSelectData extends BaseActionComponentData {
    default_values?: string[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

class UserSelectComponent extends BaseActionComponent<
    ComponentType.UserSelect,
    UserSelectData,
    APIUserSelectComponent
> {
    constructor(data: UserSelectData = {}) {
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
        return new UserSelectComponent({ ...this.data }) as this;
    }

    toJSON(): APIUserSelectComponent {
        requireField(this.data.custom_id, 'custom_id', {
            builder: 'userSelect',
            id: this.data.id,
            custom_id: this.data.custom_id,
        });

        if (this.data.min_values !== undefined) {
            if (this.data.min_values < 0 || this.data.min_values > 25) {
                throw new BuildValidationError(
                    'UserSelect.min_values must be between 0 and 25',
                    ['userSelect.min_values'],
                );
            }
        }

        if (this.data.max_values !== undefined) {
            if (this.data.max_values < 1 || this.data.max_values > 25) {
                throw new BuildValidationError(
                    'UserSelect.max_values must be between 0 and 25',
                    ['userSelect.max_values'],
                );
            }
        }

        return {
            type: ComponentType.UserSelect,
            ...this.data,
            custom_id: this.data.custom_id!,
            default_values: this.data.default_values
                ? this.data.default_values.map((x) => ({
                      type: MentionableValue.User,
                      id: x,
                  }))
                : undefined,
        };
    }
}

export function userSelect() {
    return new UserSelectComponent();
}

export type { UserSelectComponent };
