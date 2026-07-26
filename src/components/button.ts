import {
    BaseInteractiveComponent,
    type BaseInteractiveComponentData,
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

interface ButtonData extends BaseInteractiveComponentData {
    style?: ButtonStyle;
    emoji?: PartialEmoji;
    label?: string;
    sku_id?: string;
    url?: string;
    disabled?: boolean;
}

class ButtonComponent extends BaseInteractiveComponent<
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

    /**
     * The style of button
     */
    get Style() {
        return this.data.style;
    }

    /**
     * The label of button
     */
    get Label() {
        return this.data.label;
    }

    /**
     * The customId of a normal button
     */
    get CustomId() {
        return this.data.custom_id;
    }

    /**
     * The url of a link button
     */
    get Url() {
        return this.data.url;
    }

    /**
     * THe skuId of a premium button
     */
    get SkuId() {
        return this.data.sku_id;
    }

    /**
     * Manually set the style of button. Not recommended for normal use
     * @deprecated
     */
    style(style: ButtonStyle) {
        this.data.style = style;
        return this;
    }

    /**
     * Makes a regular button with style `ButtonStyle.Primary`
     */
    primary() {
        this.data.style = ButtonStyle.Primary;
        return this;
    }

    /**
     * Makes the button a regular button with style `ButtonStyle.Secondary`
     */
    secondary() {
        this.data.style = ButtonStyle.Secondary;
        return this;
    }

    /**
     * Makes the button a regular button with style `ButtonStyle.Success`
     */
    success() {
        this.data.style = ButtonStyle.Success;
        return this;
    }

    /**
     * Makes the button a regular button with style `ButtonStyle.Danger`
     */
    danger() {
        this.data.style = ButtonStyle.Danger;
        return this;
    }

    /**
     * Makes the button a link button
     * @param url The url of the button
     */
    link(url: string) {
        this.data.style = ButtonStyle.Link;

        this.data.url = url;
        return this;
    }

    /**
     * Makes the button a premium button
     * @param skuId The skuId of the button
     */
    premium(skuId: string) {
        this.data.style = ButtonStyle.Premium;

        this.data.sku_id = skuId;
        return this;
    }

    /**
     * Sets the label of a regular button
     *
     * Pass `undefined` to unset
     *
     * @param label The label of the button
     */
    label(label?: string) {
        this.data.label = label;
        return this;
    }

    /**
     * Sets the emoji of a regular button
     *
     * Pass `undefined` to unset
     * Pass either a `string` or a `PartialEmoji`
     *
     * @param emoji The emoji of the button
     */
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
