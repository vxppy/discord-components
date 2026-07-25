import {
    BaseComponent,
    type BaseComponentData,
    type CanSpoiler,
    type HasDescription,
    type HasUrl,
} from './base.js';

import requireField from '../utils/requireField.js';

import {
    ComponentType,
    type APIThumbnailComponent,
} from 'discord-api-types/v10';

interface ThumbnailData extends BaseComponentData {
    url: string;
    description?: string;
    spoiler?: boolean;
}

class ThumbnailComponent
    extends BaseComponent<
        ComponentType.Thumbnail,
        ThumbnailData,
        APIThumbnailComponent
    >
    implements CanSpoiler, HasDescription, HasUrl
{
    constructor(data: ThumbnailData) {
        super(data);
    }

    get Type(): ComponentType.Thumbnail {
        return ComponentType.Thumbnail;
    }

    /**
     * The url of the thumbnail
     */
    get Url() {
        return this.data.url;
    }

    get Description() {
        return this.data.description;
    }

    get IsSpoiler() {
        return this.data.spoiler;
    }

    /**
     * Sets the thumbnail URL.
     *
     * The value can be either:
     * - A url to image resource
     * - An attachment URL in the format `attachment://<filename>`
     *
     * @example
     * thumbnailComponent.file('attachment://my_image.png')
     *
     * @param url The url of the thumbnail.
     */
    url(url: string) {
        this.data.url = url;
        return this;
    }

    description(description: string) {
        this.data.description = description;
        return this;
    }

    spoiler(spoiler: boolean = true) {
        this.data.spoiler = spoiler;
        return this;
    }

    clone(): this {
        return new ThumbnailComponent({ ...this.data }) as this;
    }

    toJSON(): APIThumbnailComponent {
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

/**
 * Create a ThumbnailComponent
 * The value can be either:
 * - A url to image resource
 * - An attachment URL in the format `attachment://<filename>`
 *
 * @example
 * thumbnailComponent.file('attachment://my_image.png')
 *
 * @param url The url of the thumbnail.
 */
export function thumbnail(url: string) {
    return new ThumbnailComponent({ url });
}

export type { ThumbnailComponent };
