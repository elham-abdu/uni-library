"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import BookCard from "@/components/BookCard";
import { Search, Filter, X } from "lucide-react";

interface Book {
  id: string | number;
  title: string;
  author?: string;
  genre: string;
  rating?: string;
  totalCopies?: number;
  availableCopies?: number;
  description?: string;
  coverColor: string;
  coverUrl?: string;
  summary?: string;
}

interface LibraryClientProps {
  books: Book[];
  genres: string[];
  totalPages: number;
  currentPage: number;
  searchParams: {
    search: string;
    genre: string;
    availableOnly: boolean;
    sort: string;
  };
}

const LibraryClient = ({
  books,
  genres,
  totalPages,
  currentPage,
  searchParams,
}: LibraryClientProps) => {
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.search);
  const [genre, setGenre] = useState(searchParams.genre);
  const [availableOnly, setAvailableOnly] = useState(searchParams.availableOnly);
  const [sort, setSort] = useState(searchParams.sort);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Real-time client-side filtering
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Search filter (case-insensitive, partial match)
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          (book.author && book.author.toLowerCase().includes(searchLower)) ||
          book.genre.toLowerCase().includes(searchLower)
      );
    }

    // Genre filter
    if (genre) {
      result = result.filter((book) => book.genre === genre);
    }

    // Availability filter
    if (availableOnly) {
      result = result.filter((book) => (book.availableCopies ?? 0) > 0);
    }

    // Sort
    switch (sort) {
      case "newest":
        break;
      case "oldest":
        result = [...result].reverse();
        break;
      case "highestRated":
        result = [...result].sort(
          (a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0")
        );
        break;
      case "available":
        result = [...result].sort(
          (a, b) => (b.availableCopies ?? 0) - (a.availableCopies ?? 0)
        );
        break;
      default:
        break;
    }

    return result;
  }, [books, search, genre, availableOnly, sort]);

  const clearFilters = () => {
    setSearch("");
    setGenre("");
    setAvailableOnly(false);
    setSort("newest");
    router.push("/library");
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (genre) params.set("genre", genre);
    if (availableOnly) params.set("availableOnly", "true");
    if (sort) params.set("sort", sort);
    params.set("page", page.toString());
    router.push(`/library?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Library</h1>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-200 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title, author, or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-light-200 focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-200 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-dark-200 border border-dark-300 rounded-lg text-white hover:bg-dark-300 transition-colors"
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {isFilterOpen && (
        <div className="bg-dark-200 rounded-lg p-4 mb-6 border border-dark-300">
          <div className="flex flex-wrap gap-4">
            {/* Genre Filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-light-100 text-sm block mb-1">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="text-light-100 text-sm block mb-1">Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highestRated">Highest Rated</option>
                <option value="available">Most Available</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-light-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                Available Only
              </label>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-light-200 hover:text-white transition-colors self-end"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      <p className="text-light-100 mb-4">
        Found {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
        {search && (
          <span className="text-primary ml-2">
            matching &quot;{search}&quot;
          </span>
        )}
      </p>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-light-100 text-lg">
            No books found matching your criteria.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-dark-200 rounded-lg text-white disabled:opacity-50 hover:bg-dark-300 transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === pageNum
                    ? "bg-primary text-dark-100 font-semibold"
                    : "bg-dark-200 text-white hover:bg-dark-300"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-dark-200 rounded-lg text-white disabled:opacity-50 hover:bg-dark-300 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LibraryClient;