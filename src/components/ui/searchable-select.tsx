"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { cn } from "~/lib/utils";
import type { SearchableSelectProps } from "~/types/types"

/**
 * SearchableSelect Component
 * A reusable dropdown component with search functionality for easier selection in large lists.
 * @param props - Component properties
 * @param props.value - Currently selected value
 * @param props.onChangeAction - Callback function when value changes
 * @param props.options - Array of options with value and label properties
 * @param props.placeholder - Placeholder text to display when no item is selected
 * @param props.className - Optional additional CSS classes
 * @param props.disabled - Whether the component is disabled
 */
export function SearchableSelect({
                                     value,
                                     onChangeAction,
                                     options,
                                     placeholder = "Select an option",
                                     className,
                                     disabled = false,
                                 }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /** Find the selected option for display*/
    const selectedOption = options.find((option) => option.value === value);

    /** Filter options based on search query */
    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /** Handle clicking outside the dropdown to close it */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /** Focus the search input when dropdown opens */
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    /** Handle selecting an option */
    const handleSelectOption = (optionValue: string) => {
        onChangeAction(optionValue);
        setIsOpen(false);
        setSearchQuery("");
    };

    /** Toggle dropdown open/closed */
    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            setSearchQuery("");
        }
    };

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <div
                className={cn(
                    "flex items-center justify-between w-full rounded-md border border-input bg-white px-3 py-2 text-sm h-10",
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                    className
                )}
                onClick={toggleDropdown}
            >
        <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
                <ChevronDown className={cn("h-4 w-4 opacity-50", isOpen && "rotate-180 transform")} />
            </div>

            {isOpen && (
                <div className="absolute mt-1 z-50 w-full bg-white rounded-md border border-input shadow-md">

                    <div className="flex items-center border-b p-2">
                        <Search className="h-4 w-4 mr-2 text-slate-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="p-1 rounded-full hover:bg-slate-100"
                            >
                                <X className="h-3 w-3 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="text-center py-2 text-sm text-slate-500">No results found</div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer",
                                        option.value === value
                                            ? "bg-slate-100 text-slate-900 font-medium"
                                            : "hover:bg-slate-50"
                                    )}
                                    onClick={() => handleSelectOption(option.value)}
                                >
                                    <div className="w-4 mr-2 flex-shrink-0">
                                        {option.value === value && <Check className="h-4 w-4" />}
                                    </div>
                                    <span className="truncate">{option.label}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}