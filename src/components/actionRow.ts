import {
    BaseComponent,
    type BaseComponentData,
    type ComponentJSON,
} from '../base.js';
import { ComponentType } from '../componentType.js';
import BuildValidationError from '../error.js';
import type { FlattenableArray } from '../utils/normalize.js';
import normalize from '../utils/normalize.js';
import type { ButtonComponent } from './button.js';
import type { ChannelSelectComponent } from './channelSelect.js';
import type { MentionableSelectComponent } from './mentionableSelect.js';
import type { RoleSelectComponent } from './roleSelect.js';
import type { StringSelectComponent } from './stringSelect.js';
import type { UserSelectComponent } from './userSelect.js';

type ActionRowChild =
    | ButtonComponent
    | StringSelectComponent
    | UserSelectComponent
    | RoleSelectComponent
    | ChannelSelectComponent
    | MentionableSelectComponent;

const ActionRowValidTypes = [
    ComponentType.Button,
    ComponentType.StringSelect,
    ComponentType.UserSelect,
    ComponentType.RoleSelect,
    ComponentType.ChannelSelect,
    ComponentType.MentionableSelect,
];

interface ActionRowData extends BaseComponentData {
    components: ActionRowChild[];
}

interface ActionRowPayload extends ComponentJSON {
    components: ComponentJSON[];
}

class ActionRowComponent extends BaseComponent<
    ComponentType.ActionRow,
    ActionRowData,
    ActionRowPayload
> {
    constructor(data: ActionRowData) {
        super(data);
    }

    items(...components: FlattenableArray<ActionRowChild>) {
        this.data.components = normalize(components);
    }

    append(...components: FlattenableArray<ActionRowChild>) {
        this.data.components.push(...normalize(components));
    }

    clone(): this {
        return new ActionRowComponent({ ...this.data }) as this;
    }

    toJSON(): ActionRowPayload {
        if (!this.data.components.length) {
            throw new BuildValidationError(
                'ActionRow must contain at least one component',
                ['actionRow'],
            );
        }

        const components: ComponentJSON[] = new Array(
            this.data.components.length,
        );

        let hasButtons: boolean | undefined = false;
        for (let i = 0; i < components.length; i++) {
            if (hasButtons === false) {
                throw new BuildValidationError(
                    `ActionRow can only have at most 1 select menu or 5 buttons`,
                    [`actionRow[${i}]`],
                );
            }

            try {
                const component = this.data.components[i]!.toJSON();

                if (component.type == ComponentType.Button) {
                    if (hasButtons === undefined) {
                        hasButtons = true;
                    } else if (!hasButtons) {
                        throw new BuildValidationError(
                            `ActionRow cannot have multiple type of components`,
                            [`actionRow[${i}]`],
                        );
                    }
                } else if (ActionRowValidTypes.includes(component.type)) {
                    if (hasButtons) {
                        throw new BuildValidationError(
                            `ActionRow cannot have multiple type of components`,
                            [`actionRow[${i}]`],
                        );
                    } else {
                        hasButtons = false;
                    }
                } else {
                    throw new BuildValidationError(
                        `Component type must be one [${ActionRowValidTypes.join(', ')}] in action row`,
                        [`actionRow[${i}]`],
                    );
                }
            } catch (e) {
                if (!(e instanceof BuildValidationError)) throw e;

                throw new BuildValidationError(e.reason, [
                    `actionRow[${i}]`,
                    ...e.path,
                ]);
            }
        }

        return {
            type: ComponentType.ActionRow,
            components,
        };
    }
}

export function actionRow(...components: FlattenableArray<ActionRowChild>) {
    return new ActionRowComponent({ components: normalize(components) });
}

export type { ActionRowComponent };
