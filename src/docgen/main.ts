import ts from 'typescript';
import path from 'path';
import { writeFileSync } from 'fs';

import {
    ClassDoc,
    classDocToString,
    FunctionDoc,
    MethodDoc,
    ParameterDocs,
    SignatureDoc,
} from './filedoc';

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
const BASE_PATH = path.join(process.cwd(), 'docs/src');

const processSignature = (signature: ts.Signature): SignatureDoc => {
    const returnType = checker.getReturnTypeOfSignature(signature);

    const docs = ts.displayPartsToString(
        signature.getDocumentationComment(checker),
    );

    const parameterDocs: ParameterDocs[] = [];

    for (const parameter of signature.getParameters()) {
        const declaration =
            parameter.valueDeclaration! as ts.ParameterDeclaration;

        const type = checker.getTypeOfSymbolAtLocation(parameter, declaration);

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

    return {
        signature: checker.signatureToString(signature),
        docs,
        parameters: parameterDocs,
        tags: signature.getJsDocTags(),
        returnType: checker.typeToTypeNode(
            returnType,
            undefined,
            ts.NodeBuilderFlags.None,
        )!,
    };
};

const processFactory = (factory: ts.FunctionDeclaration): FunctionDoc => ({
    name: factory.name!.text,
    signature: processSignature(checker.getSignatureFromDeclaration(factory)!),
});

const processClass = (
    klass: ts.ClassDeclaration,
    factory: ts.FunctionDeclaration,
) => {
    const symbol = checker.getSymbolAtLocation(klass.name!)!;
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

    const classDoc: ClassDoc = {
        name: checker.symbolToString(symbol),
        factory: processFactory(factory),
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

        classDoc.properties.push({
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

        classDoc.methods.push(methodDocs);
    }

    return classDocToString(classDoc);
};

interface SingleClassMap {
    klass: ts.ClassDeclaration;
    factory: ts.FunctionDeclaration;
    isMainOfFile?: boolean;
}

const mapping = new Map<string, SingleClassMap[]>();

const processFile = (sourceFile: ts.SourceFile) => {
    const methods: ts.FunctionDeclaration[] = [];
    const klasses: { klass: ts.ClassDeclaration; isMainOfFile?: boolean }[] =
        [];

    for (const statement of sourceFile.statements) {
        if (
            ts.isFunctionDeclaration(statement) &&
            ts.canHaveModifiers(statement)
        ) {
            if (
                !ts
                    .getModifiers(statement)
                    ?.some((m) => m.kind == ts.SyntaxKind.ExportKeyword)
            )
                continue;

            methods.push(statement);
        }

        if (!ts.isClassDeclaration(statement)) continue;

        klasses.push({
            klass: statement,
            isMainOfFile: statement.name?.text.endsWith('Component'),
        });
    }

    const fileMapping: SingleClassMap[] = [];

    for (const { klass, isMainOfFile } of klasses) {
        const classType = checker.getTypeAtLocation(klass.name!);

        for (const method of methods) {
            const signature = checker.getSignatureFromDeclaration(method);
            const returnType = checker.getReturnTypeOfSignature(signature!);

            if (returnType.symbol == classType.symbol) {
                fileMapping.push({
                    klass,
                    factory: method,
                    isMainOfFile,
                });
                break;
            }
        }
    }

    mapping.set(path.parse(sourceFile.fileName).name, fileMapping);
};

for (const sourceFile of program
    .getSourceFiles()
    .filter((i) => i.fileName.includes('src/components'))) {
    if (sourceFile.fileName.includes('base')) continue;

    processFile(sourceFile);
}

for (const [file, classMappings] of mapping) {
    for (const { klass, factory, isMainOfFile } of classMappings) {
        const content = processClass(klass, factory);

        if (isMainOfFile) {
            writeFileSync(
                path.join(BASE_PATH, 'reference', `${file}.md`),
                content,
            );
        } else {
            writeFileSync(
                path.join(BASE_PATH, 'reference', `${factory.name!.text}.md`),
                content,
            );
        }
    }
}
