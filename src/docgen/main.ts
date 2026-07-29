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
const BASE_PATH = path.join(process.cwd(), 'docs/src/components');

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
            type: checker.typeToTypeNode(
                type,
                undefined,
                ts.NodeBuilderFlags.None,
            )!,
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
                const declaration =
                    parameter.valueDeclaration! as ts.ParameterDeclaration;

                const type = checker.getTypeOfSymbolAtLocation(
                    parameter,
                    declaration,
                );

                const docs = ts.displayPartsToString(
                    parameter.getDocumentationComment(checker),
                );

                parameterDocs.push({
                    name: parameter.getName(),
                    type: checker.typeToTypeNode(
                        type,
                        undefined,
                        ts.NodeBuilderFlags.None,
                    )!,
                    docs,
                    initializer: declaration.initializer,
                    spread: Boolean(declaration.dotDotDotToken),
                });
            }

            methodDocs.signatures.push({
                signature: checker.signatureToString(signature),
                docs,
                parameters: parameterDocs,
                tags: signature.getJsDocTags(),
                returnType: checker.typeToTypeNode(
                    returnType,
                    undefined,
                    ts.NodeBuilderFlags.None,
                )!,
            });
        }

        fileDoc.methods.push(methodDocs);
    }

    return fileDocToString(fileDoc);
};

const processFile = (sourceFile: ts.SourceFile) => {
    for (const statement of sourceFile.statements) {
        if (!ts.isClassDeclaration(statement)) continue;
        if (!statement.name?.text.endsWith('Component')) continue;

        const content = processClass(statement);

        writeFileSync(
            path.join(BASE_PATH, `${path.parse(sourceFile.fileName).name}.md`),
            content,
        );
    }
};

for (const sourceFile of program
    .getSourceFiles()
    .filter((i) => i.fileName.includes('src/components'))) {
    if (sourceFile.fileName.includes('base')) continue;

    processFile(sourceFile);
}

// closeSync(file);
