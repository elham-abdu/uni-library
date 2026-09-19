"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  addToReadingList,
  removeFromReadingList,
} from "@/lib/actions/reading-list";
import {
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  X,
  Library,
} from "lucide-react";

type ReadingListStatus = "WANT_TO_READ" | "CURRENTLY_READING" | "FINISHED";

interface ReadingListBook {
  id: string;
  bookId: string;
  title: string;
  author: string;
  genre: string;
  coverUrl: string;
  coverColor: string;
  rating: string;
  availableCopies: number;
  description: string;
  status: ReadingListStatus;
  notes: string | null;
  addedAt: Date;
}

interface Stats {
  wantToRead: number;
  currentlyReading: number;
  finished: number;
  total: number;
}

interface ReadingListsClientProps {
  allBooks: ReadingListBook[];
  userId: string;
  stats: Stats;
}

const ReadingListsClient = ({
  allBooks,
  userId,
  stats,
}: ReadingListsClientProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<ReadingListStatus | "ALL">("ALL");
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  const statusConfig: Record<
    ReadingListStatus,
    { label: string; icon: React.ReactNode; color: string; bg: string }
  > = {
    WANT_TO_READ: {
      label: "Want to Read",
      icon: <Bookmark className="w-4 h-4" />,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
    },
    CURRENTLY_READING: {
      label: "Currently Reading",
      icon: <BookOpen className="w-4 h-4" />,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/30",
    },
    FINISHED: {
      label: "Finished",
      icon: <Check className="w-4 h-4" />,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/30",
    },
  };

  const filteredBooks =
    activeTab === "ALL"
      ? allBooks
      : allBooks.filter((b) => b.status === activeTab);

  const handleStatusChange = (bookId: string, newStatus: ReadingListStatus) => {
    startTransition(async () => {
      const result = await addToReadingList({
        userId,
        bookId,
        status: newStatus,
      });

      if (result.success) {
        toast.success(`Moved to ${statusConfig[newStatus].label}!`);
        setMenuOpenFor(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update.");
      }
    });
  };

  const handleRemove = (bookId: string) => {
    startTransition(async () => {
      const result = await removeFromReadingList({ userId, bookId });

      if (result.success) {
        toast.success("Removed from list.");
        setMenuOpenFor(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove.");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Library className="w-8 h-8 text-primary" />
            My Reading Lists
          </h1>
          <p className="text-light-100 mt-1">
            Track books you want to read, are reading, and finished
          </p>
        </div>
        <button
          onClick={() => router.push("/my-profile")}
          className="text-light-200 hover:text-white transition-colors"
        >
          ← Back to Profile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`p-4 rounded-xl border transition-all text-left ${
            activeTab === "ALL"
              ? "bg-primary/10 border-primary"
              : "bg-dark-200 border-dark-300 hover:border-dark-400"
          }`}
        >
          <p className="text-light-100 text-sm mb-1">All Books</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </button>

        <button
          onClick={() => setActiveTab("WANT_TO_READ")}
          className={`p-4 rounded-xl border transition-all text-left ${
            activeTab === "WANT_TO_READ"
              ? "bg-blue-500/10 border-blue-500"
              : "bg-dark-200 border-dark-300 hover:border-dark-400"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="w-4 h-4 text-blue-400" />
            <p className="text-light-100 text-sm">Want to Read</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.wantToRead}</p>
        </button>

        <button
          onClick={() => setActiveTab("CURRENTLY_READING")}
          className={`p-4 rounded-xl border transition-all text-left ${
            activeTab === "CURRENTLY_READING"
              ? "bg-purple-500/10 border-purple-500"
              : "bg-dark-200 border-dark-300 hover:border-dark-400"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <p className="text-light-100 text-sm">Reading</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.currentlyReading}
          </p>
        </button>

        <button
          onClick={() => setActiveTab("FINISHED")}
          className={`p-4 rounded-xl border transition-all text-left ${
            activeTab === "FINISHED"
              ? "bg-green-500/10 border-green-500"
              : "bg-dark-200 border-dark-300 hover:border-dark-400"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-4 h-4 text-green-400" />
            <p className="text-light-100 text-sm">Finished</p>
          </div>
          <p className="text-2xl font-bold text-white">{stats.finished}</p>
        </button>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
            <Library className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No books in this list yet
          </h2>
          <p className="text-light-100 mb-6">
            Start adding books to organize your reading
          </p>
          <button
            onClick={() => router.push("/library")}
            className="px-6 py-3 bg-primary text-dark-100 font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const config = statusConfig[book.status];

            return (
              <div
                key={book.id}
                className="bg-dark-200 rounded-xl overflow-hidden border border-dark-300 hover:border-primary/50 transition-all duration-200 group"
              >
                {/* Cover */}
                <Link href={`/books/${book.bookId}`}>
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={book.coverUrl || "/images/placeholder-book.jpg"}
                      alt={book.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: book.coverColor + "20" }}
                    />
                    {/* Status badge */}
                    <div
                      className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-sm ${config.bg}`}
                    >
                      <span className={config.color}>{config.icon}</span>
                      <span
                        className={`text-xs font-medium ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link href={`/books/${book.bookId}`}>
                    <h3 className="font-semibold text-white text-lg line-clamp-1 hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-light-100 text-sm">{book.author}</p>
                  <p className="text-light-200 text-xs mt-1 line-clamp-1">
                    {book.genre}
                  </p>

                  <div className="flex items-center justify-between mt-3 mb-3">
                    <span className="flex items-center gap-1 text-yellow-400 text-sm">
                      ⭐ {book.rating}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        book.availableCopies > 0
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {book.availableCopies > 0
                        ? `${book.availableCopies} available`
                        : "Out of stock"}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {/* Move status */}
                    <div className="relative flex-1">
                      <button
                        onClick={() =>
                          setMenuOpenFor(
                            menuOpenFor === book.id ? null : book.id
                          )
                        }
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-light-100 hover:text-white hover:bg-dark-400 transition-colors disabled:opacity-50 text-sm"
                      >
                        Move
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            menuOpenFor === book.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {menuOpenFor === book.id && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-dark-300 border border-dark-400 rounded-lg shadow-2xl z-50 overflow-hidden">
                          {(
                            Object.keys(statusConfig) as ReadingListStatus[]
                          )
                            .filter((s) => s !== book.status)
                            .map((s) => (
                              <button
                                key={s}
                                onClick={() =>
                                  handleStatusChange(book.bookId, s)
                                }
                                disabled={isPending}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-light-100 hover:text-white hover:bg-dark-400 transition-colors text-sm disabled:opacity-50"
                              >
                                <span
                                  className={statusConfig[s].color}
                                >
                                  {statusConfig[s].icon}
                                </span>
                                {statusConfig[s].label}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(book.bookId)}
                      disabled={isPending}
                      className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      title="Remove from list"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReadingListsClient;