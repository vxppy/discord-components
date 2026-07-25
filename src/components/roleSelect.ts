import {
    BaseInteractiveComponent,
    MentionableValue,
    type BaseInteractiveComponentData,
    type SelectMenuWithoutOptions,
} from './base.js';
import BuildValidationError from '../error.js';
import requireField from '../utils/requireField.js';
import {
    ComponentType,
    type APIRoleSelectComponent,
} from 'discord-api-types/v10';

interface RoleSelectData extends BaseInteractiveComponentData {
    default_values?: string[];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

class RoleSelectComponent
    extends BaseInteractiveComponent<
        ComponentType.RoleSelect,
        RoleSelectData,
        APIRoleSelectComponent
    >
    implements SelectMenuWithoutOptions<string>
{
    constructor(data: RoleSelectData = {}) {
        super(data);
    }

    get Type(): ComponentType.RoleSelect {
        return ComponentType.RoleSelect;
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

    defaultValues(...values: string[]) {
        this.data.default_values = values;
        return this;
    }

    clone(): this {
        return new RoleSelectComponent({ ...this.data }) as this;
    }

    toJSON(): APIRoleSelectComponent {
        requireField(this.data.custom_id, 'custom_id', {
            builder: 'roleSelect',
            id: this.data.id,
            custom_id: this.data.custom_id,
        });

        if (this.data.min_values !== undefined) {
            if (this.data.min_values < 0 || this.data.min_values > 25) {
                throw new BuildValidationError(
                    'RoleSelect.min_values must be between 0 and 25',
                    ['roleSelect.min_values'],
                );
            }
        }

        if (this.data.max_values !== undefined) {
            if (this.data.max_values < 1 || this.data.max_values > 25) {
                throw new BuildValidationError(
                    'RoleSelect.max_values must be between 0 and 25',
                    ['roleSelect.max_values'],
                );
            }
        }

        return {
            type: ComponentType.RoleSelect,
            ...this.data,
            default_values: this.data.default_values
                ? this.data.default_values.map((x) => ({
                      type: MentionableValue.Role,
                      id: x,
                  }))
                : undefined,
            custom_id: this.data.custom_id!,
        };
    }
}

/**
 * Creates a RoleSelectComponent
 */
export function roleSelect() {
    return new RoleSelectComponent();
}

export type { RoleSelectComponent };
