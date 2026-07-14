import BuildValidationError from '../error.js';

interface RequireFieldInfo {
    builder: string;
    id?: string;
    custom_id?: string;
}

export default function requireField<T>(
    field: T,
    fieldName: string,
    { builder, id, custom_id }: RequireFieldInfo,
): asserts field is NonNullable<T> {
    if (field !== undefined) return;

    throw new BuildValidationError(
        `Missing required field '${fieldName}' in ${builder}`,
        [
            `${builder}${id ? `#${id} ` : ''}${custom_id ? `(custom_id = ${JSON.stringify(custom_id)})` : ''}`,
        ],
    );
}
