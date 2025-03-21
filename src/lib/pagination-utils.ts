/**
 * Calculates pagination values for a dataset
 *
 * @param items - The total number of items in the dataset
 * @param pageSize - The number of items to display per page
 * @param currentPage - The current page number (1-based)
 * @returns Object containing pagination calculations
 */
export function calculatePagination<T>(
    items: T[],
    pageSize: number,
    currentPage: number
): {
    totalPages: number;
    paginatedItems: T[];
} {
    const totalPages = Math.ceil(items.length / pageSize);
    const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

    const startIndex = (validCurrentPage - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    return {
        totalPages,
        paginatedItems
    };
}