import {
    BaseComponent,
    type BaseComponentData,
    type CanSpoiler,
} from './base.js';
import requireField from '../utils/requireField.js';
import type { APIFileComponent } from 'discord-api-types/v10';
import { ComponentType } from 'discord-api-types/v9';
import BuildValidationError from '../error.js';

interface FileData extends BaseComponentData {
    file: string;
    name?: string;
    spoiler?: boolean;
}

class FileComponent
    extends BaseComponent<ComponentType.File, FileData, APIFileComponent>
    implements CanSpoiler
{
    constructor(data: FileData) {
        super(data);
    }

    get Type(): ComponentType.File {
        return ComponentType.File;
    }

    /**
     * The url of the file
     */
    get File() {
        return this.data.file;
    }

    /**
     * The name of the file
     */
    get Name() {
        return this.data.name;
    }

    get IsSpoiler() {
        return this.data.spoiler;
    }

    /**
     * Sets the file URL.
     *
     * The value can be either:
     * - A filename, such as `my_image.png`
     * - An attachment URL in the format `attachment://<filename>`
     *
     * @example
     * fileComponent.file('attachment://my_image.png')
     *
     * @param url The file URL or filename.
     */
    file(url: string) {
        if (url.includes('://')) {
            if (!url.startsWith('attachment://'))
                throw new BuildValidationError(
                    'File url must begin with attachment://',
                    ['file.name'],
                );
        } else {
            this.data.file = `attachment://${url}`;
        }
        return this;
    }

    spoiler(spoiler: boolean = true) {
        this.data.spoiler = spoiler;
        return this;
    }

    /**
     * Sets the name of the file
     * @param name Name of the file
     */
    name(name: string) {
        this.data.name = name;
        return this;
    }

    clone(): this {
        return new FileComponent({ ...this.data }) as this;
    }

    toJSON(): APIFileComponent {
        requireField(this.data.file, 'file', {
            builder: 'file',
            id: this.data.id,
        });

        return {
            type: ComponentType.File,
            name: this.data.name,
            spoiler: this.data.spoiler,
            file: {
                url: this.data.file,
            },
        };
    }
}

/**
 * Creates a new FileComponent
 *
 * The file can be either:
 * - A filename, such as `my_image.png`
 * - An attachment URL in the format `attachment://<filename>`
 *
 * @example
 * fileComponent.file('attachment://my_image.png')
 *
 * @param url The file URL or filename.
 */
export function fileItem(file: string) {
    return new FileComponent({ file });
}

export type { FileComponent };
