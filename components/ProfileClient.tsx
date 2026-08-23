"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { returnBook } from "@/lib/actions/borrow";

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
  totalCopies?: number;
  availableCopies?: number;
  description?: string;
  videoUrl?: string;
  summary?: string;
  createdAt?: Date | null;
}

interface ProfileClientProps {
  borrowedBooks: BorrowedBook[];
  userId: string;
}

const MAX_BORROW_LIMIT = 3;

const ProfileClient = ({ borrowedBooks, userId }: ProfileClientProps) => {
  const router = useRouter();
  const [returningBookId, setReturningBookId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

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

  const activeBooks = borrowedBooks.filter((book) => book.status === "BORROWED");
  const historyBooks = borrowedBooks.filter((book) => book.status === "RETURNED");
  const activeCount = activeBooks.length;
  const remainingSlots = MAX_BORROW_LIMIT - activeCount;

  const displayBooks = activeTab === "active" ? activeBooks : historyBooks;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{activeCount}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Active Borrows</h2>
              <p className="text-light-100">
                You have {activeCount} book{activeCount !== 1 ? "s" : ""} borrowed
              </p>
            </div>
          </div>
        </div>

        <div className="bg-dark-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              remainingSlots > 0 ? "bg-green-500/20" : "bg-red-500/20"
            }`}>
              <span className={`text-2xl font-bold ${
                remainingSlots > 0 ? "text-green-500" : "text-red-500"
              }`}>
                {remainingSlots}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Borrow Limit</h2>
              <p className={`${
                remainingSlots > 0 ? "text-light-100" : "text-red-500"
              }`}>
                {remainingSlots > 0 
                  ? `You can borrow ${remainingSlots} more book${remainingSlots !== 1 ? "s" : ""}`
                  : "You've reached the maximum borrow limit!"}
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

      {/* Book List */}
      {displayBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-light-100 text-lg">
            {activeTab === "active" 
              ? "You haven't borrowed any books yet."
              : "You haven't returned any books yet."}
          </p>
          {activeTab === "active" && (
            <button
              onClick={() => router.push("/")}
              className="mt-4 text-primary hover:underline"
            >
              Browse Books →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBooks.map((book) => {
            const daysLeft = calculateDaysLeft(book.dueDate);
            const isOverdue = daysLeft < 0;
            const isDueSoon = daysLeft >= 0 && daysLeft <= 3;

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
                  <p className="text-light-200 text-xs mt-1">{book.genre}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      {activeTab === "active" ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-green-500">
                            ✅ Returned
                          </span>
                          <p className="text-xs text-light-200">
                            Returned: {book.returnDate ? new Date(book.returnDate).toLocaleDateString() : "N/A"}
                          </p>
                        </>
                      )}
                    </div>
                    {activeTab === "active" && (
                      <button
                        onClick={() => handleReturn(book.borrowId)}
                        disabled={returningBookId === book.borrowId}
                        className="px-4 py-2 bg-primary text-dark-100 font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                      >
                        {returningBookId === book.borrowId ? (
                          "Returning..."
                        ) : (
                          "Return"
                        )}
                      </button>
                    )}
                  </div>

                  {activeTab === "active" && isOverdue && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                      <p className="text-red-500 text-xs">
                        ⚠️ This book is overdue! Please return it as soon as possible.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileClient;