export function dedent(strings: TemplateStringsArray, ...values: unknown[]): string {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const output = strings.reduce((acc, str, idx) => `${acc}${values[idx - 1] ?? ''}${str}`);

    const lines = output.split('\n');

    const indent = Math.min(
        ...lines.filter(line => line.trim() !== '').map(line => line.search(/\S|$/))
    );

    const unindentedLines = lines.map(line => line.slice(indent));

    return unindentedLines.join('\n');
}