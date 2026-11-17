// Apollo errors may arrive prefixed ("GraphQL error: ...") or as the bare server message.
export const getErrorMessage = (error: unknown): string => {
    const message: string = error instanceof Error ? error.message : String(error ?? '');
    const separator: number = message.indexOf(':');
    return (separator >= 0 ? message.slice(separator + 1) : message).trim();
};
