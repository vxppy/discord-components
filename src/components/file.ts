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

    clone(): this {
        return new FileComponent({ ...this.data }) as this;
    }

    spoiler(state: boolean = true) {
        this.data.spoiler = state;
        return this;
    }

    name(value: string) {
        this.data.name = value;
        return this;
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
