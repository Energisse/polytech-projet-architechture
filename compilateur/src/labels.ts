export function checkLabel(label: string): boolean {
    return /^[a-zA-Z][a-zA-Z0-9]*$/.test(label);
}