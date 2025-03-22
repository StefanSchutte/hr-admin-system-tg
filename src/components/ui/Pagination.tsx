import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationProps } from "~/types/types";

/**
 * Pagination Component
 * A reusable pagination control that renders previous/next buttons and page numbers.
 * It handles complex pagination logic like showing limited page numbers for large datasets.
 * @param {PaginationProps} props - Component props
 * @returns {JSX.Element | null} Rendered component or null if there are no pages
 */
export default function Pagination({
                                       currentPage,
                                       totalPages,
                                       onPageChange
                                   }: PaginationProps) {
    if (totalPages <= 0) {
        return null;
    }

    /**
     * Navigates to the next page
     */
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    /**
     * Navigates to the previous page
     */
    const goToPrevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    return (
        <div className="flex items-center justify-center space-x-2">
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={goToPrevPage}
                className="border-slate-300 hover:bg-slate-100"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-1">Previous</span>
            </Button>

            <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 3 + i;
                        if (pageNum > totalPages) {
                            pageNum = totalPages - (4 - i);
                        }
                    }

                    return (
                        <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            className={
                                pageNum === currentPage
                                    ? "bg-emerald-700 hover:bg-emerald-600"
                                    : "border-slate-300 hover:bg-slate-100"
                            }
                            onClick={() => onPageChange(pageNum)}
                        >
                            {pageNum}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={goToNextPage}
                className="border-slate-300 hover:bg-slate-100"
            >
                <span className="mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}