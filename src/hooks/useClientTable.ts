"use client";

import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

type UseClientTableOptions<T, K extends string> = {
  data: T[];
  searchKeys: (item: T) => string[];
  initialSortKey: K;
  getSortValue: (item: T, key: K) => string | number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
};

export function useClientTable<T, K extends string>({
  data,
  searchKeys,
  initialSortKey,
  getSortValue,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
}: UseClientTableOptions<T, K>) {
  const [search, setSearchState] = useState("");
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<K>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Wrapped setters — reset page in the same update (no useEffect)
  const setSearch = (value: string) => {
    setSearchState(value);
    setCurrentPage(1);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  };

  const handleSort = (key: K) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;

    return data.filter((item) =>
      searchKeys(item).some((v) => v.toLowerCase().includes(q)),
    );
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortKey, sortDirection, getSortValue]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage, pageSize]);

//   const startEntry = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endEntry = Math.min(safePage * pageSize, totalItems);

  const goToPrevious = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return {
    // state
    search,
    setSearch,
    pageSize,
    setPageSize,
    currentPage: safePage,
    sortKey,
    sortDirection,
    pageSizeOptions,

    // data
    paginatedData,
    totalItems,
    totalPages,
    // startEntry,
    endEntry,

    // actions
    handleSort,
    goToPrevious,
    goToNext,
  };
}