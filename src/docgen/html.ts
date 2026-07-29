const wrap = (klass: string, text: string) => {
    return `<span class="${klass}">${text}</span>`;
};

export const line = (parts: string[]) => {
    return wrap('line', parts.join(''));
};

export const block = (klass: string, lines: string[]) =>
    `<pre class="${klass}"><code>${lines.join('\n')}</code></pre>`;

export const keyword = (text: string) => wrap('keyword', text);
export const property = (text: string) => wrap('property', text);
export const punctuation = (text: string) => wrap('punctuation', text);
export const method = (text: string) => wrap('method', text);
export const parameter = (text: string) => wrap('parameter', text);
export const enim = (text: string) => wrap('enum', text);
export const other = (text: string) => wrap('other', text);
export const number = (text: string) => wrap('number', text);
export const boolean = (text: string) => wrap('boolean', text);
export const string = (text: string) => wrap('string', text);
export const comment = (text: string) => wrap('comment', text);
export const klass = (text: string) => wrap('class', text);
export const operator = (text: string) => wrap('operator', text);
