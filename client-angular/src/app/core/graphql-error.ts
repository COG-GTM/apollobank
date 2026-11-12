/** Mirrors the React client's `(error as Error).message.split(':')[1]` handling of GraphQL errors. */
export const graphqlErrorMessage = (error: unknown): string => {
    const message = (error as Error)?.message ?? '';
    const parts = message.split(':');
    return (parts.length > 1 ? parts[1] : message).trim();
};
