import {
    BaseComponent,
    type BaseComponentData,
    type CanSpoiler,
    type HasDescription,
    type HasUrl,
    type PartList,
} from './base.js';
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

class MediaGalleryComponentItem implements CanSpoiler, HasDescription, HasUrl {
    constructor(private data: GalleryItemData) {}

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
     * Sets the gallery item URL.
     *
     * The value can be either:
     * - A url to image resource
     * - An attachment URL in the format `attachment://<filename>`
     *
     * @example
     * mediaGalleryItem.file('attachment://my_image.png')
     *
     * @param url The url of the gallery item.
     */
    url(url: string) {
        this.data.url = url;
        return this;
    }

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

class MediaGalleryComponent
    extends BaseComponent<
        ComponentType.MediaGallery,
        MediaGalleryData,
        APIMediaGalleryComponent
    >
    implements PartList<MediaGalleryComponentItem>
{
    constructor(data: MediaGalleryData) {
        super(data);
    }

    get Type(): ComponentType.MediaGallery {
        return ComponentType.MediaGallery;
    }

    /**
     * The gallery items in the media display
     */
    get GalleryItems(): readonly MediaGalleryComponentItem[] {
        return [...this.data.items];
    }

    first(): MediaGalleryComponentItem | undefined {
        return this.data.items[0];
    }

    last(): MediaGalleryComponentItem | undefined {
        return this.data.items[this.data.items.length - 1];
    }

    at(index: number): MediaGalleryComponentItem | undefined {
        return this.data.items.at(index);
    }

    push(...parts: FlattenableArray<MediaGalleryComponentItem>): this {
        this.data.items.push(...normalize(parts));
        return this;
    }

    shift(): MediaGalleryComponentItem | undefined {
        return this.data.items.shift();
    }

    unshift(...parts: FlattenableArray<MediaGalleryComponentItem>): this {
        this.data.items.unshift(...normalize(parts));
        return this;
    }

    pop(): MediaGalleryComponentItem | undefined {
        return this.data.items.pop();
    }

    insert(
        index: number,
        ...parts: FlattenableArray<MediaGalleryComponentItem>
    ): this {
        this.data.items.splice(index, 0, ...normalize(parts));
        return this;
    }

    remove(...parts: MediaGalleryComponentItem[]): this {
        this.data.items.filter((i) => parts.includes(i));
        return this;
    }

    removeAt(index: number, count: number = 1): MediaGalleryComponentItem[] {
        return this.data.items.splice(index, count);
    }

    splice(
        index: number,
        count: number,
        ...parts: FlattenableArray<MediaGalleryComponentItem>
    ): MediaGalleryComponentItem[] {
        return this.data.items.splice(index, count, ...normalize(parts));
    }

    items(...items: FlattenableArray<MediaGalleryComponentItem>): this {
        this.data.items = normalize(items);
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

/**
 * Create MediaGalleryComponentItem
 * The value can be either:
 * - A url to image resource
 * - An attachment URL in the format `attachment://<filename>`
 *
 * @example
 * mediaGalleryItem.file('attachment://my_image.png')
 *
 * @param url The url of the gallery item.
 */
export function galleryItem(url: string) {
    return new MediaGalleryComponentItem({ url });
}

/**
 * Creates a MediaGalleryComponent
 * @param items The gallery items you to add
 */
export function mediaGallery(
    ...items: FlattenableArray<MediaGalleryComponentItem>
) {
    return new MediaGalleryComponent({ items: normalize(items) });
}

export type { MediaGalleryComponentItem, MediaGalleryComponent };
