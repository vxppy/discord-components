import ts from 'typescript';
import normalize from '../utils/normalize';

export interface PropertyDoc {
    name: string;
    type: string;
    docs: string;
    tags: ts.JSDocTagInfo[];
}

export interface ParameterDocs {
    name: string;
    type: string;
    docs: string;
}

export interface SignatureDoc {
    signature: string;
    parameters: ParameterDocs[];
    docs: string;
    returnType: string;
    tags: ts.JSDocTagInfo[];
}

export interface MethodDoc {
    name: string;
    signatures: SignatureDoc[];
}

export interface FileDoc {
    name: string;
    propertyToc: string[];
    methodToc: string[];
    properties: PropertyDoc[];
    methods: MethodDoc[];
}

interface DocJSON {
    layout: 'reference';
    component: string;
    property_names: string[];
    method_names: string[];
    properties: string[];
    methods: string[];
}

const template = `---json
@{TEMPLATE}@
---

\`\`\`ts
class @{CLASS_NAME}@
\`\`\`

## Builder

\`\`\`ts
@{BUILDER_STRING}@
\`\`\`
`;

const resolveTags = (tags: ts.JSDocTagInfo[]) => {
    const prepend: string[] = [];
    const postpend: string[] = [];

    for (const tag of tags) {
        switch (tag.name) {
            case 'deprecated': {
                prepend.push(
                    `\`@deprecated\`${tag.text ? ` - ${tag.text.map((i) => i.text).join('\n')}` : ''}`,
                );
                break;
            }
            case 'example': {
                if (!tag.text) continue;
                postpend.push(
                    [
                        '`@example` - ',
                        '```ts',
                        tag.text.map((i) => i.text).join('\n'),
                        '```',
                    ].join('\n'),
                );
                break;
            }
        }
    }

    return {
        prepend: prepend.join(' \\\n'),
        postpend: postpend.join(' \\\n'),
    };
};

const mapProperty = (prop: PropertyDoc) => {
    const { prepend, postpend } = resolveTags(prop.tags);

    const body = normalize([
        prepend,
        `## <a id="property-${prop.name}">${prop.name}</a>`,
        ['```ts', `get ${prop.name}(): ${prop.type}`, '\```'].join('\n'),
        prop.docs,
        postpend,
    ]).join('\n\n');

    return body;
};

const mapSignature = (name: string, signature: SignatureDoc) => {
    const { prepend, postpend } = resolveTags(signature.tags);
    return normalize([
        prepend,
        ['```ts', `${name}${signature.signature}`, '```'].join('\n'),
        signature.docs,
        postpend,
    ]).join('\n\n');
};

const mapMethod = (method: MethodDoc) => {
    const body = normalize([
        `## <a id="method-${method.name}">${method.name}</a>\n`,
        method.signatures
            .map((signature) => mapSignature(method.name, signature))
            .join('\n'),
    ]).join('\n\n');

    return body;
};

export function fileDocToString(fileDoc: FileDoc) {
    return (
        template
            .replace(
                '@{TEMPLATE}@',
                JSON.stringify({
                    layout: 'reference',
                    component: fileDoc.name,
                    property_names: fileDoc.propertyToc,
                    method_names: fileDoc.methodToc,
                    properties: fileDoc.properties.map(mapProperty),
                    methods: fileDoc.methods.map(mapMethod),
                } satisfies DocJSON),
            )
            .replace('@{CLASS_NAME}@', fileDoc.name)
            // @ts-ignore
            .replace('@{BUILDER_STRING}@', fileDoc.builder ?? 'builder()')
    );
}
