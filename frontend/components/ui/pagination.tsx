"use client";
import React from "react";

interface PaginationProps {
  pageIndex: number;
  pageCount: number;
  onPageChange: (newIndex: number) => void;
}

export default function Pagination({
  pageIndex,
  pageCount,
  onPageChange,
}: PaginationProps) {
  const prev = () => onPageChange(Math.max(0, pageIndex - 1));
  const next = () => onPageChange(Math.min(pageCount - 1, pageIndex + 1));

  // show a small range around current page
  const pages: number[] = [];
  const start = Math.max(0, pageIndex - 2);
  const end = Math.min(pageCount - 1, pageIndex + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t">
      <div className="text-xs text-slate-600">Page {pageIndex + 1} of {pageCount}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          disabled={pageIndex <= 0}
          className="px-2 py-1 rounded border text-sm text-slate-700 disabled:opacity-50"
        >
          Prev
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-2 py-1 rounded border text-sm ${p === pageIndex ? "bg-slate-900 text-white" : "text-slate-700"}`}
          >
            {p + 1}
          </button>
        ))}

        <button
          onClick={next}
          disabled={pageIndex >= pageCount - 1}
          className="px-2 py-1 rounded border text-sm text-slate-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
