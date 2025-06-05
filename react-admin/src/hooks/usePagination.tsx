import { useState } from "react";
import { sortColumn } from "../configs/config";
import { sortDirection } from "../configs/config";
import { perPage } from "../configs/config";
export interface IPagination {
    page: number;
    limit?: number;
    sort_direction?: string;
    sort_column?: string;
}

export const usePagination = ({
    page,
    sort_direction = sortDirection,
    sort_column = sortColumn,
}: IPagination) => {
    const [filter, setFilter] = useState<IPagination>({
        page: page,
        limit: perPage,
        sort_direction: sort_direction,
        sort_column: sort_column,
    });

    const handlePageChange = (page: number) => {
        setFilter((prev) => {
            return { ...prev, page };
        });
    };

    const handleLimitChange = (limit: number) => {
        setFilter((prev) => {
            return { ...prev, limit };
        });
    };

    return {
        filter,
        handlePageChange,
        handleLimitChange,
    };
};
