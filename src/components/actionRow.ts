import {
    BaseComponent,
    type BaseComponentData,
    type PartList,
} from './base.js';
import BuildValidationError from '../error.js';

import type { FlattenableArray } from '../utils/normalize.js';
import normalize from '../utils/normalize.js';

import type { ButtonComponent } from './button.js';
import type { ChannelSelectComponent } from './channelSelect.js';
import type { MentionableSelectComponent } from './mentionableSelect.js';
import type { RoleSelectComponent } from './roleSelect.js';
import type { StringSelectComponent } from './stringSelect.js';
import type { UserSelectComponent } from './userSelect.js';

import {
    ComponentType,
    type APIActionRowComponent,
} from 'discord-api-types/v10';
import type { APIComponentInMessageActionRow } from 'discord-api-types/v9';

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

class ActionRowComponent
    extends BaseComponent<
        ComponentType.ActionRow,
        ActionRowData,
        APIActionRowComponent<APIComponentInMessageActionRow>
    >
    implements PartList<ActionRowChild>
{
    constructor(data: ActionRowData) {
        super(data);
    }

    get Type(): ComponentType.ActionRow {
        return ComponentType.ActionRow;
    }

    get Components(): readonly ActionRowChild[] {
        return [...this.data.components];
    }

    first(): ActionRowChild | undefined {
        return this.data.components[0];
    }

    last(): ActionRowChild | undefined {
        return this.data.components[this.data.components.length - 1];
    }

    at(index: number): ActionRowChild | undefined {
        return this.data.components.at(index);
    }

    push(...parts: FlattenableArray<ActionRowChild>): this {
        this.data.components.push(...normalize(parts));
        return this;
    }

    shift(): ActionRowChild | undefined {
        return this.data.components.shift();
    }

    unshift(...parts: FlattenableArray<ActionRowChild>): this {
        this.data.components.unshift(...normalize(parts));
        return this;
    }

    pop(): ActionRowChild | undefined {
        return this.data.components.pop();
    }

    insert(index: number, ...parts: FlattenableArray<ActionRowChild>): this {
        this.data.components.splice(index, 0, ...normalize(parts));
        return this;
    }

    remove(...parts: ActionRowChild[]): this {
        this.data.components.filter((i) => parts.includes(i));
        return this;
    }

    removeAt(index: number, count: number = 1): ActionRowChild[] {
        return this.data.components.splice(index, count);
    }

    splice(
        index: number,
        count: number,
        ...parts: FlattenableArray<ActionRowChild>
    ): ActionRowChild[] {
        return this.data.components.splice(index, count, ...normalize(parts));
    }

    components(...parts: FlattenableArray<ActionRowChild>): this {
        this.data.components = normalize(parts);
        return this;
    }

    clone(): this {
        return new ActionRowComponent({ ...this.data }) as this;
    }

    toJSON(): APIActionRowComponent<APIComponentInMessageActionRow> {
        if (!this.data.components.length) {
            throw new BuildValidationError(
                'ActionRow must contain at least one component',
                ['actionRow'],
            );
        }

        const components: APIComponentInMessageActionRow[] = new Array(
            this.data.components.length,
        );

        let hasButtons: boolean | undefined;
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

                components[i] = component;
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
