import ts from 'typescript';
import path from 'path';
import { writeFileSync } from 'fs';
import { FileDoc, fileDocToString, MethodDoc, ParameterDocs } from './filedoc';

const configFile = ts.readConfigFile('tsconfig.json', ts.sys.readFile);

const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    './',
);

const program = ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options,
    configFileParsingDiagnostics: parsedConfig.errors,
});

const checker = program.getTypeChecker();
const outFile = path.join(process.cwd(), 'docs/src/test.md');

// const file = openSync(outFile, 'w');

// const emitToFile = (content: string) => {
//     writeFileSync(file, content);
// };

// const startAll = () => {
//     emitToFile(
//         '---\nlayout: reference\ntitle: ButtonComponent\n---\n\n# Symbols\n\n',
//     );
// };

// const startProperties = () => {
//     emitToFile('# Properties\n\n');
// };

// const emitTable = (properties: string[], methods: string[]) => {
//     emitToFile(
//         `<div class="overview">
//     <details open>
//         <summary>Properties</summary>
//             ${properties
//                 .map(
//                     (i) =>
//                         `<li><a href="#property-${i}"><code>${i}</code></a></li>`,
//                 )
//                 .join('\n')}
//     </details>
//     <details open>
//         <summary>Methods</summary>
//         ${methods.map((i) => `<li><a href="#method-${i}"><code>${i}</code></a></li>`).join('\n')}
//     </details>
// </div>\n\n`,
//     );
// };

// const emitPropertyDocs = (name: string, returnType: string, docs: string) => {
//     emitToFile(
//         `##  <a id="property-${name}">${name}</a>\n\n\`\`\`ts\nget ${name}(): ${returnType}\n\`\`\`\n\n${docs}\n\n<hr>\n\n`,
//     );
// };

// const startMethods = () => {
//     emitToFile('# Methods\n\n');
// };

// const emitMethodDocs = (name: string, methods: string[], docs: string) => {
//     emitToFile(
//         `## <a id="method-${name}">${name}</a>\n\n\`\`\`ts\n${methods.map((i) => `${name} ${i}`).join('\n')}\n\`\`\`\n\n${docs}\n\n<hr>\n\n`,
//     );
// };
//

const processClass = (node: ts.ClassDeclaration) => {
    const symbol = checker.getSymbolAtLocation(node.name!)!;
    const classType = checker.getDeclaredTypeOfSymbol(symbol);

    const properties: ts.Symbol[] = [];
    const methods: ts.Symbol[] = [];

    for (const property of classType.getProperties()) {
        if (property.name.startsWith('_')) continue;

        const declaration = property.valueDeclaration;
        if (!declaration || ts.isPrivateIdentifier(declaration)) continue;

        if (ts.isGetAccessorDeclaration(declaration)) {
            properties.push(property);
        } else if (ts.isMethodDeclaration(declaration)) {
            methods.push(property);
        }
    }

    properties.sort((a, b) => a.name.localeCompare(b.name));
    methods.sort((a, b) => a.name.localeCompare(b.name));

    const fileDoc: FileDoc = {
        name: checker.symbolToString(symbol),
        propertyToc: properties.map((i) => i.name),
        methodToc: methods.map((i) => i.name),
        properties: [],
        methods: [],
    };

    for (const property of properties) {
        const declaration = property.valueDeclaration!;

        const docs = ts.displayPartsToString(
            property.getDocumentationComment(checker),
        );

        const type = checker.getTypeOfSymbolAtLocation(property, declaration);

        fileDoc.properties.push({
            name: property.name,
            type: checker.typeToString(type),
            docs,
            tags: property.getJsDocTags(),
        });
    }

    for (const method of methods) {
        const declaration = method.valueDeclaration!;

        const type = checker.getTypeOfSymbolAtLocation(method, declaration);
        const signatureType = type.getCallSignatures();

        const methodDocs: MethodDoc = {
            name: method.name,
            signatures: [],
        };

        for (const signature of signatureType) {
            const returnType = checker.getReturnTypeOfSignature(signature);
            const docs = ts.displayPartsToString(
                signature.getDocumentationComment(checker),
            );

            const parameterDocs: ParameterDocs[] = [];

            for (const parameter of signature.getParameters()) {
                const declaration = parameter.valueDeclaration!;

                const type = checker.getTypeOfSymbolAtLocation(
                    parameter,
                    declaration,
                );

                const docs = ts.displayPartsToString(
                    parameter.getDocumentationComment(checker),
                );

                parameterDocs.push({
                    name: parameter.getName(),
                    type: checker.typeToString(type),
                    docs,
                });
            }

            methodDocs.signatures.push({
                signature: checker.signatureToString(signature),
                docs,
                parameters: parameterDocs,
                tags: signature.getJsDocTags(),
                returnType: checker.typeToString(returnType),
            });
        }

        fileDoc.methods.push(methodDocs);
    }

    writeFileSync(outFile, fileDocToString(fileDoc));
};

const processFile = (sourceFile: ts.SourceFile) => {
    for (const statement of sourceFile.statements) {
        if (!ts.isClassDeclaration(statement)) continue;
        if (!statement.name?.text.endsWith('Component')) continue;

        processClass(statement);
    }
};

for (const sourceFile of program
    .getSourceFiles()
    .filter((i) => i.fileName.includes('src/components'))) {
    if (sourceFile.fileName.includes('base')) continue;

    processFile(sourceFile);
    break;
}

// closeSync(file);
