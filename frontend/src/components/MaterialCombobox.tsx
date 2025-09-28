"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material {
    id: number;
    materialId: string;
    description: string;
    type: string;
    currentStock: number;
    unitOfMeasure: string;
    unitPrice: number;
    status: string;
}

interface MaterialComboboxProps {
    materials: Material[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    name?: string;
    id?: string;
    required?: boolean;
}

export default function MaterialCombobox({
    materials,
    value,
    onChange,
    placeholder = "Select or enter Material ID",
    disabled = false,
    name,
    id,
    required = false,
}: MaterialComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter materials based on search term
    const filteredMaterials = materials.filter(
        (material) =>
            material.materialId
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            material.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update search term when value changes externally
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        onChange(newValue);
        setIsOpen(true);
    };

    const handleSelectMaterial = (material: Material) => {
        setSearchTerm(material.materialId);
        onChange(material.materialId);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                inputRef.current?.focus();
            }
        }
    };

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "raw":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
            case "semi_finished":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "finished":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "consumable":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    name={name}
                    id={id}
                    required={required}
                    className="pr-10"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleDropdown}
                    disabled={disabled}
                >
                    {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </Button>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                    {filteredMaterials.length > 0 ? (
                        <div className="py-1">
                            {filteredMaterials.map((material) => (
                                <button
                                    key={material.id}
                                    type="button"
                                    className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none flex items-center justify-between"
                                    onClick={() =>
                                        handleSelectMaterial(material)
                                    }
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-foreground">
                                                {material.materialId}
                                            </div>
                                            <div className="text-sm text-muted-foreground truncate">
                                                {material.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Badge
                                            className={cn(
                                                "text-xs",
                                                getTypeColor(material.type)
                                            )}
                                        >
                                            {material.type}
                                        </Badge>
                                        <div className="text-xs text-muted-foreground">
                                            {material.currentStock}{" "}
                                            {material.unitOfMeasure}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            {searchTerm.trim() ? (
                                <>
                                    No materials found matching "{searchTerm}".
                                    <br />
                                    <span className="text-xs">
                                        You can still use this as a custom
                                        Material ID.
                                    </span>
                                </>
                            ) : (
                                "Start typing to search materials or enter a custom Material ID"
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
