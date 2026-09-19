"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { returnBook } from "@/lib/actions/borrow";
import { renewBook } from "@/lib/actions/renewal";
import { cancelHold } from "@/lib/actions/hold";
import { Bookmark, Clock, X, RefreshCw } from "lucide-react";

interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverColor: string;
  coverUrl: string;
  borrowId: string;
  borrowDate: Date;
  dueDate: string;
  status: string;
  returnDate?: string | null;
  renewalCount?: number;
  totalCopies?: number;
  availableCopies?: number;
  description?: string;
  videoUrl?: string;
  summary?: string;
  createdAt?: Date | null;
}

interface Hold {
  id: string;
  bookId: string;
  title: string;
  author: string;
  genre: string;
  coverUrl: string;
  coverColor: string;
  queuePosition: number;
  placedAt: Date;
  status: string;
}

interface ProfileClientProps {
  borrowedBooks: BorrowedBook[];
  userId: string;
  holds: Hold[];
}

const MAX_BORROW_LIMIT = 3;
const MAX_RENEWALS = 2;

const ProfileClient = ({
  borrowedBooks,
  userId,
  holds,
}: ProfileClientProps) => {
  const router = useRouter();
  const [returningBookId, setReturningBookId] = useState<string | null>(null);
  const [renewingBookId, setRenewingBookId] = useState<string | null>(null);
  const [cancellingHoldId, setCancellingHoldId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"active" | "holds" | "history">(
    "active"
  );

  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleReturn = async (borrowId: string) => {
    setReturningBookId(borrowId);
    try {
      const result = await returnBook({ borrowId, userId });
      if (result.success) {
        toast.success("📚 Book returned successfully!", {
          description: "Thank you for returning the book.",
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to return book.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setReturningBookId(null);
    }
  };

  const handleRenew = async (borrowId: string) => {
    setRenewingBookId(borrowId);
    try {
      const result = await renewBook({ borrowId, userId });
      if (result.success) {
        toast.success("🔄 Book renewed!", {
          description: result.message || "Due date extended by 14 days.",
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to renew book.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setRenewingBookId(null);
    }
  };

  const handleCancelHold = (holdId: string) => {
    setCancellingHoldId(holdId);
    startTransition(async () => {
      try {
        const result = await cancelHold({ holdId, userId });
        if (result.success) {
          toast.success("Hold cancelled successfully.");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to cancel hold.");
        }
      } catch {
        toast.error("An unexpected error occurred.");
      } finally {
        setCancellingHoldId(null);
      }
    });
  };

  const activeBooks = borrowedBooks.filter((book) => book.status === "BORROWED");
  const historyBooks = borrowedBooks.filter(
    (book) => book.status === "RETURNED"
  );
  const activeCount = activeBooks.length;
  const remainingSlots = MAX_BORROW_LIMIT - activeCount;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {activeCount}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Active Borrows
              </h2>
              <p className="text-light-100 text-sm">
                {activeCount} book{activeCount !== 1 ? "s" : ""} borrowed
              </p>
            </div>
          </div>
        </div>

        <div className="bg-dark-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-400">
                {holds.length}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Active Holds</h2>
              <p className="text-light-100 text-sm">
                {holds.length} book{holds.length !== 1 ? "s" : ""} in queue
              </p>
            </div>
          </div>
        </div>

        <div className="bg-dark-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                remainingSlots > 0 ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              <span
                className={`text-2xl font-bold ${
                  remainingSlots > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {remainingSlots}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Borrow Limit</h2>
              <p
                className={`text-sm ${
                  remainingSlots > 0 ? "text-light-100" : "text-red-500"
                }`}
              >
                {remainingSlots > 0
                  ? `${remainingSlots} more available`
                  : "Maximum reached!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-dark-300">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "text-primary border-b-2 border-primary"
              : "text-light-100 hover:text-white"
          }`}
        >
          Active Borrows ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab("holds")}
          className={`pb-3 px-4 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "holds"
              ? "text-primary border-b-2 border-primary"
              : "text-light-100 hover:text-white"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Holds ({holds.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "text-primary border-b-2 border-primary"
              : "text-light-100 hover:text-white"
          }`}
        >
          History ({historyBooks.length})
        </button>
      </div>

      {/* =================== ACTIVE TAB =================== */}
      {activeTab === "active" && (
        <>
          {activeBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-light-100 text-lg">
                You haven&apos;t borrowed any books yet.
              </p>
              <button
                onClick={() => router.push("/library")}
                className="mt-4 text-primary hover:underline"
              >
                Browse Books →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBooks.map((book) => {
                const daysLeft = calculateDaysLeft(book.dueDate);
                const isOverdue = daysLeft < 0;
                const isDueSoon = daysLeft >= 0 && daysLeft <= 3;
                const renewalCount = book.renewalCount ?? 0;
                const canRenewBook = !isOverdue && renewalCount < MAX_RENEWALS;

                return (
                  <div
                    key={book.borrowId}
                    className="bg-dark-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-48">
                      <Image
                        src={book.coverUrl || "/images/placeholder-book.jpg"}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white text-lg truncate">
                        {book.title}
                      </h3>
                      <p className="text-light-100 text-sm">{book.author}</p>
                      <p className="text-light-200 text-xs mt-1">
                        {book.genre}
                      </p>

                      <div className="mt-3">
                        <span
                          className={`text-sm font-medium ${
                            isOverdue
                              ? "text-red-500"
                              : isDueSoon
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {isOverdue
                            ? `Overdue by ${Math.abs(daysLeft)} days`
                            : `${daysLeft} days left`}
                        </span>
                        <p className="text-xs text-light-200">
                          Due: {new Date(book.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      {renewalCount > 0 && (
                        <p className="text-light-200 text-xs mt-2">
                          🔄 Renewed {renewalCount} time
                          {renewalCount > 1 ? "s" : ""}
                          {canRenewBook &&
                            ` • ${MAX_RENEWALS - renewalCount} left`}
                        </p>
                      )}

                      <div className="flex gap-2 mt-3">
                        {canRenewBook && (
                          <button
                            onClick={() => handleRenew(book.borrowId)}
                            disabled={
                              renewingBookId === book.borrowId ||
                              returningBookId === book.borrowId
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50 text-sm font-medium"
                          >
                            <RefreshCw
                              className={`w-4 h-4 ${
                                renewingBookId === book.borrowId
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                            {renewingBookId === book.borrowId
                              ? "Renewing..."
                              : "Renew"}
                          </button>
                        )}

                        <button
                          onClick={() => handleReturn(book.borrowId)}
                          disabled={
                            returningBookId === book.borrowId ||
                            renewingBookId === book.borrowId
                          }
                          className={`${
                            canRenewBook ? "flex-1" : "w-full"
                          } px-3 py-2 bg-primary text-dark-100 font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm`}
                        >
                          {returningBookId === book.borrowId
                            ? "Returning..."
                            : "Return"}
                        </button>
                      </div>

                      {isOverdue && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                          <p className="text-red-500 text-xs">
                            ⚠️ Overdue books cannot be renewed. Please return it.
                          </p>
                        </div>
                      )}

                      {!isOverdue &&
                        !canRenewBook &&
                        renewalCount >= MAX_RENEWALS && (
                          <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                            <p className="text-yellow-500 text-xs">
                              🔄 Maximum renewals reached (2/2)
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* =================== HOLDS TAB =================== */}
      {activeTab === "holds" && (
        <>
          {holds.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-light-200 mx-auto mb-4" />
              <p className="text-light-100 text-lg">
                You don&apos;t have any holds yet.
              </p>
              <button
                onClick={() => router.push("/library")}
                className="mt-4 text-primary hover:underline"
              >
                Browse Books →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {holds.map((hold) => (
                <div
                  key={hold.id}
                  className="bg-dark-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={hold.coverUrl || "/images/placeholder-book.jpg"}
                      alt={hold.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-lg truncate">
                      {hold.title}
                    </h3>
                    <p className="text-light-100 text-sm">{hold.author}</p>
                    <p className="text-light-200 text-xs mt-1">{hold.genre}</p>

                    <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-primary font-semibold text-sm">
                          Position #{hold.queuePosition} in queue
                        </span>
                      </div>
                      <p className="text-light-200 text-xs">
                        Reserved on{" "}
                        {new Date(hold.placedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCancelHold(hold.id)}
                      disabled={cancellingHoldId === hold.id || isPending}
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      {cancellingHoldId === hold.id
                        ? "Cancelling..."
                        : "Cancel Hold"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* =================== HISTORY TAB =================== */}
      {activeTab === "history" && (
        <>
          {historyBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-light-100 text-lg">
                You haven&apos;t returned any books yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyBooks.map((book) => (
                <div
                  key={book.borrowId}
                  className="bg-dark-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow opacity-90"
                >
                  <div className="relative h-48">
                    <Image
                      src={book.coverUrl || "/images/placeholder-book.jpg"}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-lg truncate">
                      {book.title}
                    </h3>
                    <p className="text-light-100 text-sm">{book.author}</p>
                    <p className="text-light-200 text-xs mt-1">{book.genre}</p>

                    <div className="mt-3">
                      <span className="text-sm font-medium text-green-500">
                        ✅ Returned
                      </span>
                      <p className="text-xs text-light-200">
                        Returned:{" "}
                        {book.returnDate
                          ? new Date(book.returnDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                      {(book.renewalCount ?? 0) > 0 && (
                        <p className="text-xs text-light-200 mt-1">
                          🔄 Renewed {book.renewalCount} time
                          {(book.renewalCount ?? 0) > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileClient;