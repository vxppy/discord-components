import {
    BaseActionComponent,
    type BaseActionComponentData,
    type EmojiResolveable,
    type PartialEmoji,
} from './base.js';
import requireField from '../utils/requireField.js';
import resolveEmoji from '../utils/resolveEmoji.js';

import {
    ButtonStyle,
    ComponentType,
    type APIButtonComponent,
} from 'discord-api-types/v10';

interface ButtonData extends BaseActionComponentData {
    style?: ButtonStyle;
    emoji?: PartialEmoji;
    label?: string;
    sku_id?: string;
    url?: string;
    disabled?: boolean;
}

class ButtonComponent extends BaseActionComponent<
    ComponentType.Button,
    ButtonData,
    APIButtonComponent
> {
    constructor(data: ButtonData = {}) {
        super(data);
    }

    get Type(): ComponentType.Button {
        return ComponentType.Button;
    }

    get Style() {
        return this.data.style;
    }

    get Label() {
        return this.data.label;
    }

    get CustomId() {
        return this.data.custom_id;
    }

    get Url() {
        return this.data.url;
    }

    get SkuId() {
        return this.data.sku_id;
    }

    /**
     * Manually set the style of button. Not recommended for normal use
     */
    style(style: ButtonStyle) {
        this.data.style = style;
        return this;
    }

    primary() {
        this.data.style = ButtonStyle.Primary;
        return this;
    }

    secondary() {
        this.data.style = ButtonStyle.Secondary;
        return this;
    }

    success() {
        this.data.style = ButtonStyle.Success;
        return this;
    }

    danger() {
        this.data.style = ButtonStyle.Danger;
        return this;
    }

    link(url: string) {
        this.data.style = ButtonStyle.Link;

        this.data.url = url;
        return this;
    }

    premium(skuId: string) {
        this.data.style = ButtonStyle.Premium;

        this.data.sku_id = skuId;
        return this;
    }

    label(label: string) {
        this.data.label = label;
        return this;
    }

    emoji(emoji?: EmojiResolveable) {
        this.data.emoji = resolveEmoji(emoji);
        return this;
    }

    clone(): this {
        return new ButtonComponent({ ...this.data }) as this;
    }

    toJSON(): APIButtonComponent {
        switch (this.data.style) {
            case ButtonStyle.Primary:
            case ButtonStyle.Secondary:
            case ButtonStyle.Success:
            case ButtonStyle.Danger: {
                requireField(this.data.custom_id, 'custom_id', {
                    builder: 'button',
                    id: this.data.id,
                    custom_id: this.data.custom_id,
                });

                if (!this.data.emoji && !this.data.label) {
                    requireField(undefined, 'emoji | label', {
                        builder: 'button',
                        id: this.data.id,
                        custom_id: this.data.custom_id,
                    });
                }
                break;
            }
            case ButtonStyle.Link: {
                requireField(this.data.url, 'url', {
                    builder: 'button',
                    id: this.data.id,
                    custom_id: this.data.custom_id,
                });
                break;
            }
            case ButtonStyle.Premium: {
                requireField(this.data.sku_id, 'sku_id', {
                    builder: 'button',
                    id: this.data.id,
                    custom_id: this.data.custom_id,
                });
                break;
            }
        }

        return {
            type: ComponentType.Button,
            ...this.data,
            custom_id: this.data.custom_id!,
        } as APIButtonComponent;
    }
}

export function button() {
    return new ButtonComponent();
}

export type { ButtonComponent };
