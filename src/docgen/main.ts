import ts from 'typescript';
import path from 'path';
import { closeSync, openSync, writeFileSync } from 'fs';

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

const outFile = path.join(process.cwd(), 'docs/test.md');
const file = openSync(outFile, 'w');

const emitToFile = (content: string) => {
    writeFileSync(file, content);
};

emitToFile('<link href="shared.css" rel="stylesheet">\n\n');
const startAll = () => {
    emitToFile('# Symbols\n\n');
};

const startProperties = () => {
    emitToFile('# Properties\n\n');
};

const writeSymbol = (symbol: string) => {
    emitToFile(`[${symbol}](#${symbol})\n\n`);
};

const emitTable = (properties: string[], methods: string[]) => {
    emitToFile(
        `<div class="overview">
    <details open>
        <summary>Properties</summary>
            ${properties.map((i) => `<ul>${i}</ul>`).join('\n            ')}
    </details>
    <details open>
        <summary>Methods</summary>
        ${methods.map((i) => `<ul>${i}</ul>`).join('\n            ')}
    </details>
</div>\n\n`,
    );
};

const writeGetterDocs = (name: string, returnType: string, docs: string) => {
    emitToFile(
        `##  <a id="${name}">${name}</a>\n\`\`\`ts\nget ${name}(): ${returnType}\n\`\`\`\n\n${docs}\n\n`,
    );
};

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

    startAll();

    emitTable(
        properties.map((i) => i.name),
        methods.map((i) => i.name),
    );
    // for (const symbol of [...getters, ...methods]) {
    //     writeSymbol(symbol.name);
    // }

    startProperties();
    for (const getter of properties) {
        const declaration = getter.valueDeclaration!;

        const docs = ts.displayPartsToString(
            getter.getDocumentationComment(checker),
        );

        const getterType = checker.getTypeOfSymbolAtLocation(
            getter,
            declaration,
        );

        writeGetterDocs(getter.name, checker.typeToString(getterType), docs);
    }

    // for (const getter of methods) {
    //     console.log(`\x1b[33m${getter.name}\x1b[0m`);
    // }
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

closeSync(file);
