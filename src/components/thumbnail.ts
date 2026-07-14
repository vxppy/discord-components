import {
    BaseComponent,
    type BaseComponentData,
    type ComponentJSON,
    type UnfurledMediaItemPayload,
} from '../base.js';
import { ComponentType } from '../componentType.js';
import requireField from '../utils/requireField.js';

interface ThumbnailData extends BaseComponentData {
    url: string;
    description?: string;
    spoiler?: boolean;
}

interface ThumbnailPayload extends ComponentJSON {
    media: UnfurledMediaItemPayload;
    description?: string;
    spoiler?: boolean;
}

class ThumbnailComponent extends BaseComponent<
    ComponentType.Thumbnail,
    ThumbnailData,
    ThumbnailPayload
> {
    constructor(data: ThumbnailData) {
        super(data);
    }

    description(description: string) {
        this.data.description = description;
        return this;
    }

    spoiler(state: boolean = true) {
        this.data.spoiler = state;
        return this;
    }

    clone(): this {
        return new ThumbnailComponent({ ...this.data }) as this;
    }

    toJSON(): ThumbnailPayload {
        requireField(this.data.url, 'media.url', {
            builder: 'thumbnail',
        });

        return {
            type: ComponentType.Thumbnail,
            spoiler: this.data.spoiler,
            description: this.data.description,
            media: {
                url: this.data.url,
            },
        };
    }
}

export function thumbnail(url: string) {
    return new ThumbnailComponent({ url });
}

export type { ThumbnailComponent };
