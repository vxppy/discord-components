export default class BuildValidationError extends Error {
    constructor(
        readonly reason: string,
        readonly path: string[],
    ) {
        super();
    }

    override get message() {
        return `${[
            this.reason,
            '',
            'Component path:',
            `    ${this.path.join(' > ')}`,
        ].join('\n')}\n`;
    }
}
