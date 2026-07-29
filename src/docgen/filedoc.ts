import ts from 'typescript';
import normalize from '../utils/normalize';
import {
    block,
    comment,
    boolean,
    keyword,
    klass,
    line,
    method,
    number,
    operator,
    parameter,
    property,
    punctuation,
    string,
} from './html';

export interface PropertyDoc {
    name: string;
    type: ts.TypeNode;
    docs: string;
    tags: ts.JSDocTagInfo[];
}

export interface ParameterDocs {
    name: string;
    type: ts.TypeNode;
    docs: string;
    spread: boolean;
    initializer?: ts.Expression;
}

export interface SignatureDoc {
    signature: string;
    parameters: ParameterDocs[];
    docs: string;
    returnType: ts.TypeNode;
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
// wow
\`\`\`
`;

const KLASS_NAME = 'vxppy-code';

const entityNameToString = (type: ts.EntityName): string => {
    switch (type.kind) {
        case ts.SyntaxKind.Identifier: {
            // we can only have come here by left recursion
            return klass(type.text);
        }
        case ts.SyntaxKind.QualifiedName: {
            return `${entityNameToString(type.left)}${punctuation('.')}${type.right.text}`;
        }
    }
};

const unaryExpresionToHTML = (expr: ts.UnaryExpression) => {
    switch (expr.kind) {
    }
};

const expressionToHTML = (
    expr:
        | ts.LiteralExpression
        | ts.NullLiteral
        | ts.BooleanLiteral
        | ts.PrefixUnaryExpression,
): string => {
    switch (expr.kind) {
        case ts.SyntaxKind.StringLiteral: {
            return string(expr.text);
        }
        case ts.SyntaxKind.NumericLiteral: {
            return number(expr.text);
        }
        case ts.SyntaxKind.TrueKeyword: {
            return boolean('true');
        }
        case ts.SyntaxKind.FalseKeyword: {
            return boolean('false');
        }
        case ts.SyntaxKind.NullKeyword: {
            return boolean('null');
        }
        case ts.SyntaxKind.PrefixUnaryExpression: {
            const prefix = expr as ts.PrefixUnaryExpression;

            switch (prefix.operator) {
                case ts.SyntaxKind.MinusToken:
                    return (
                        '-' +
                        expressionToHTML(prefix.operand as ts.LiteralExpression)
                    );
                default:
                    throw new Error(
                        `Unexpected unary operator: ${ts.SyntaxKind[prefix.operator]}`,
                    );
            }
        }
    }
    return 'wow';
};

const typeToHTML = (type: ts.TypeNode): string => {
    switch (type.kind) {
        case ts.SyntaxKind.TypeReference: {
            const ref = type as ts.TypeReferenceNode;
            const base = entityNameToString(ref.typeName);

            if (!ref.typeArguments) {
                return base;
            }

            return `${base}${punctuation('<')}${ref.typeArguments.map(typeToHTML).join('')}${punctuation('>')}`;
        }
        case ts.SyntaxKind.UnionType: {
            const union = type as ts.UnionTypeNode;

            return union.types
                .map(typeToHTML)
                .join(' ' + punctuation('|') + ' ');
        }
        case ts.SyntaxKind.ArrayType: {
            const array = type as ts.ArrayTypeNode;

            return `${typeToHTML(array.elementType)}[]`;
        }
        case ts.SyntaxKind.StringKeyword: {
            return keyword('string');
        }
        case ts.SyntaxKind.NumberKeyword: {
            return keyword('number');
        }
        case ts.SyntaxKind.BooleanKeyword: {
            return keyword('boolean');
        }
        case ts.SyntaxKind.NumericLiteral: {
            break;
        }
        case ts.SyntaxKind.UndefinedKeyword: {
            return keyword('undefined');
        }
        case ts.SyntaxKind.LiteralType: {
            const lit = type as ts.LiteralTypeNode;

            return expressionToHTML(lit.literal);
        }
        case ts.SyntaxKind.TypeOperator: {
            const op = type as ts.TypeOperatorNode;
            switch (op.operator) {
                case ts.SyntaxKind.KeyOfKeyword: {
                    return `${keyword('keyof')} ${typeToHTML(op.type)}`;
                }
                case ts.SyntaxKind.ReadonlyKeyword: {
                    return `${keyword('readonly')} ${typeToHTML(op.type)}`;
                }
                case ts.SyntaxKind.UniqueKeyword: {
                    return `${keyword('unique')} ${typeToHTML(op.type)}`;
                }
            }
        }
        default: {
            console.log(ts.SyntaxKind[type.kind]);
        }
    }

    return 'how did we get here';
};

const makePropertyHTML = (prop: PropertyDoc) => {
    return block(KLASS_NAME, [
        line([
            keyword('get'),
            ' ',
            property(prop.name),
            punctuation('(): '),
            typeToHTML(prop.type),
        ]),
    ]);
};

const makeParameterToHTML = (param: ParameterDocs, isLast: boolean = false) => {
    return line([
        '    ',
        param.spread ? punctuation('...') : '',
        parameter(param.name),
        punctuation(':'),
        ' ',
        typeToHTML(param.type),
        isLast ? '' : punctuation(','),
    ]);
};

const makeFunctionHTML = (name: string, sig: SignatureDoc) => {
    if (!sig.parameters.length) {
        return block(KLASS_NAME, [
            line([
                method(name),
                punctuation('():'),
                ' ',
                typeToHTML(sig.returnType),
            ]),
        ]);
    }

    return block(KLASS_NAME, [
        line([method(name), punctuation('(')]),
        ...sig.parameters.map((i, index) =>
            makeParameterToHTML(i, index == sig.parameters.length - 1),
        ),
        line([punctuation('):'), ' ', typeToHTML(sig.returnType)]),
    ]);
};

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
        makePropertyHTML(prop),
        prop.docs,
        postpend,
    ]).join('\n\n');

    return body;
};

const mapSignature = (name: string, signature: SignatureDoc) => {
    const { prepend, postpend } = resolveTags(signature.tags);
    return normalize([
        prepend,
        makeFunctionHTML(name, signature),
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
