"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  addToReadingList,
  removeFromReadingList,
} from "@/lib/actions/reading-list";
import { Bookmark, BookOpen, Check, ChevronDown, X } from "lucide-react";

type ReadingListStatus = "WANT_TO_READ" | "CURRENTLY_READING" | "FINISHED";

interface ReadingListButtonProps {
  userId: string;
  bookId: string;
  currentStatus?: ReadingListStatus | null;
}

const ReadingListButton = ({
  userId,
  bookId,
  currentStatus = null,
}: ReadingListButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ReadingListStatus | null>(currentStatus);
  const [isOpen, setIsOpen] = useState(false);

  const statusConfig: Record<
    ReadingListStatus,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    WANT_TO_READ: {
      label: "Want to Read",
      icon: <Bookmark className="w-4 h-4" />,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
    CURRENTLY_READING: {
      label: "Currently Reading",
      icon: <BookOpen className="w-4 h-4" />,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    },
    FINISHED: {
      label: "Finished",
      icon: <Check className="w-4 h-4" />,
      color: "text-green-400 bg-green-500/10 border-green-500/30",
    },
  };

  const handleSelect = (newStatus: ReadingListStatus) => {
    if (!userId) {
      toast.error("Please sign in first.");
      router.push("/sign-in");
      return;
    }

    startTransition(async () => {
      const result = await addToReadingList({
        userId,
        bookId,
        status: newStatus,
      });

      if (result.success) {
        setStatus(newStatus);
        setIsOpen(false);
        toast.success(`Added to ${statusConfig[newStatus].label}!`, {
          icon: statusConfig[newStatus].icon,
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update reading list.");
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeFromReadingList({ userId, bookId });

      if (result.success) {
        setStatus(null);
        setIsOpen(false);
        toast.success("Removed from reading list.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove.");
      }
    });
  };

  // Not in any list yet
  if (!status) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-3 bg-dark-200 border border-dark-300 rounded-xl text-light-100 hover:bg-dark-300 hover:text-white transition-colors disabled:opacity-50 w-full"
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-sm font-medium">Add to Reading List</span>
          <ChevronDown
            className={`w-4 h-4 ml-auto transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-dark-300 border border-dark-400 rounded-xl shadow-2xl z-50 overflow-hidden">
            {(Object.keys(statusConfig) as ReadingListStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                disabled={isPending}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-light-100 hover:text-white hover:bg-dark-400 transition-colors disabled:opacity-50"
              >
                <div
                  className={`p-1.5 rounded-lg ${statusConfig[s].color} border`}
                >
                  {statusConfig[s].icon}
                </div>
                <span className="text-sm font-medium">
                  {statusConfig[s].label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Already in a list
  const config = statusConfig[status];
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border w-full transition-colors disabled:opacity-50 ${config.color}`}
      >
        {config.icon}
        <span className="text-sm font-medium">{config.label}</span>
        <ChevronDown
          className={`w-4 h-4 ml-auto transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-300 border border-dark-400 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Other status options */}
          {(Object.keys(statusConfig) as ReadingListStatus[])
            .filter((s) => s !== status)
            .map((s) => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                disabled={isPending}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-light-100 hover:text-white hover:bg-dark-400 transition-colors disabled:opacity-50"
              >
                <div
                  className={`p-1.5 rounded-lg ${statusConfig[s].color} border`}
                >
                  {statusConfig[s].icon}
                </div>
                <span className="text-sm font-medium">
                  Move to {statusConfig[s].label}
                </span>
              </button>
            ))}

          {/* Remove option */}
          <div className="border-t border-dark-400">
            <button
              onClick={handleRemove}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
                <X className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Remove from List</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingListButton;