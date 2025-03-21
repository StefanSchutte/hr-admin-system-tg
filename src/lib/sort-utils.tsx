import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import type { Dispatch, SetStateAction } from "react";

/**
 * Creates a sort indicator element based on the current sort state.
 * @param currentSortField - The field currently being sorted
 * @param thisSortField - The field this indicator represents
 * @param sortDirection - The current sort direction ('asc' or 'desc')
 * @returns JSX Element with the appropriate sort indicator
 */
export function renderSortIndicator(
    currentSortField: string,
    thisSortField: string,
    sortDirection: 'asc' | 'desc'
): ReactNode {
    return (
        <div className="w-4 flex justify-center">
            {currentSortField === thisSortField ? (
                sortDirection === 'asc' ? (
                    <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronUp className="h-4 w-4" />
                )
            ) : (
                <ChevronUp className="h-4 w-4 text-gray-400 opacity-50" />
            )}
        </div>
    );
}

/**
 * Generic sort handler for table columns.
 * Toggles direction if the same field is clicked, otherwise sets a new field with ascending direction.
 * @param field - The field that was clicked
 * @param currentSortField - The field currently being sorted
 * @param setSortField - Function to update the sort field
 * @param sortDirection - The current sort direction ('asc' or 'desc')
 * @param setSortDirection - Function to update the sort direction
 */
export function handleSort<T extends string>(
    field: T,
    currentSortField: T,
    setSortField: Dispatch<SetStateAction<T>>,
    sortDirection: 'asc' | 'desc',
    setSortDirection: Dispatch<SetStateAction<'asc' | 'desc'>>
): void {
    if (currentSortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
        setSortField(field);
        setSortDirection('asc');
    }
}