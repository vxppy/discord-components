import { BaseComponent, type BaseComponentData } from './base.js';
import BuildValidationError from '../error.js';
import type { FlattenableArray } from '../utils/normalize.js';
import normalize from '../utils/normalize.js';
import requireField from '../utils/requireField.js';
import {
    ComponentType,
    type APIMediaGalleryComponent,
    type APIMediaGalleryItem,
} from 'discord-api-types/v10';

interface GalleryItemData {
    url: string;
    description?: string;
    spoiler?: boolean;
}

class MediaGalleryComponentItem {
    constructor(private data: GalleryItemData) {}

    description(value: string) {
        this.data.description = value;
        return this;
    }

    spoiler(state: boolean = true) {
        this.data.spoiler = state;
        return this;
    }

    clone(): MediaGalleryComponentItem {
        return new MediaGalleryComponentItem({ ...this.data });
    }

    toJSON(): APIMediaGalleryItem {
        requireField(this.data.url, 'media.url', {
            builder: 'galleryItem',
        });

        return {
            spoiler: this.data.spoiler,
            description: this.data.description,
            media: {
                url: this.data.url,
            },
        };
    }
}

interface MediaGalleryData extends BaseComponentData {
    items: MediaGalleryComponentItem[];
}

class MediaGalleryComponent extends BaseComponent<
    ComponentType.MediaGallery,
    MediaGalleryData,
    APIMediaGalleryComponent
> {
    constructor(data: MediaGalleryData) {
        super(data);
    }

    items(...components: FlattenableArray<MediaGalleryComponentItem>) {
        this.data.items = normalize(components);
        return this;
    }

    append(...components: FlattenableArray<MediaGalleryComponentItem>) {
        this.data.items.push(...normalize(components));
        return this;
    }

    clone(): this {
        return new MediaGalleryComponent({
            ...this.data,
            items: this.data.items.map((i) => i.clone()),
        }) as this;
    }

    toJSON(): APIMediaGalleryComponent {
        if (!this.data.items.length) {
            throw new BuildValidationError(
                'MediaGallery must contain at least one item',
                ['mediaGallery'],
            );
        }

        const items: APIMediaGalleryItem[] = new Array(this.data.items.length);

        for (let i = 0; i < items.length; i++) {
            try {
                items[i] = this.data.items[i]!.toJSON();
            } catch (e) {
                if (!(e instanceof BuildValidationError)) throw e;

                throw new BuildValidationError(e.reason, [
                    `mediaGallery.items[${i}]`,
                    ...e.path,
                ]);
            }
        }

        return {
            type: ComponentType.MediaGallery,
            ...this.data,
            items,
        };
    }
}

export function galleryItem(url: string) {
    return new MediaGalleryComponentItem({ url });
}

export function mediaGallery(
    ...items: FlattenableArray<MediaGalleryComponentItem>
) {
    return new MediaGalleryComponent({ items: normalize(items) });
}

export type { MediaGalleryComponentItem, MediaGalleryComponent };
