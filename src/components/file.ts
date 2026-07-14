import {
    BaseComponent,
    type BaseComponentData,
    type ComponentJSON,
} from '../base.js';
import type { ComponentType } from '../componentType.js';
import requireField from '../utils/requireField.js';

interface FileData extends BaseComponentData {
    file: string;
    name?: string;
    spoiler?: boolean;
}

interface FilePayload extends ComponentJSON {
    file: string;
    name?: string;
    spoiler?: boolean;
}

class FileComponent extends BaseComponent<
    ComponentType.File,
    FileData,
    FilePayload
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

    toJSON(): FilePayload {
        requireField(this.data.file, 'file', {
            builder: 'file',
            id: this.data.id,
        });

        return {
            type: 0,
            ...this.data,
        };
    }
}

export function fileItem(file: string) {
    return new FileComponent({ file });
}

export type { FileComponent };
