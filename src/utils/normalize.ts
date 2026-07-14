type FalseValue = undefined | null | false | '' | void;

export type FlattenableArray<T> = (T | FalseValue | (T | FalseValue)[])[];

export default function normalize<T>(x: FlattenableArray<T>) {
    return x.flat().filter(Boolean) as T[];
}
