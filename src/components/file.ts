import { BaseComponent, type BaseComponentData } from './base.js';
import requireField from '../utils/requireField.js';
import type { APIFileComponent } from 'discord-api-types/v10';
import { ComponentType } from 'discord-api-types/v9';

interface FileData extends BaseComponentData {
    file: string;
    name?: string;
    spoiler?: boolean;
}

class FileComponent extends BaseComponent<
    ComponentType.File,
    FileData,
    APIFileComponent
> {
    constructor(data: FileData) {
        super(data);
    }

    get Type(): ComponentType.File {
        return ComponentType.File;
    }

    get File() {
        return this.data.file;
    }

    get Name() {
        return this.data.name;
    }

    get Spoiler() {
        return this.data.spoiler;
    }

    file(url: string) {
        this.data.file = url;
    }

    spoiler(state: boolean = true) {
        this.data.spoiler = state;
        return this;
    }

    name(value: string) {
        this.data.name = value;
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

export function fileItem(file: string) {
    return new FileComponent({ file });
}

export type { FileComponent };
