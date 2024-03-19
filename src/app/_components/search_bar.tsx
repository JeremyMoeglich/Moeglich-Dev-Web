import { useState } from "react";
import { CgSearch } from "react-icons/cg";
import { Input } from "~/@/components/ui/input";

export function SearchBar({
    onChange,
    onConfirm,
    search,
}: {
    onChange?: (value: string) => void;
    onConfirm?: (value: string) => void;
    search: string;
}) {
    return (
        <div className="flex p-1 gap-4 items-center bg-blue-800 shadow-lg rounded-full backdrop-blur-sm bg-opacity-40 border-[1px] border-black border-opacity-20">
            <CgSearch size={32} color="white" />
            <Input
                type="search"
                placeholder="Search"
                className="bg-slate-200 rounded-full border-none"
                value={search}
                onChange={(e) => onChange && onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && onConfirm) {
                        onConfirm(search);
                    }
                }}
            />
        </div>
    );
}
