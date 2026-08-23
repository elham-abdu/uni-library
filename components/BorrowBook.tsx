"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { borrowBook } from "@/lib/actions/book";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BorrowBookProps {
  userId: string;
  bookId: string;
  borrowEligibility: {
    isEligible: boolean;
    message: string;
  };
}

export const BorrowBook = ({
  userId,
  bookId,
  borrowEligibility,
}: BorrowBookProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [borrowed, setBorrowed] = useState(false);

  const handleBorrow = () => {
    if (!userId) {
      toast.error("Please sign in to borrow books.", {
        description: "You need to be logged in to borrow books.",
        action: {
          label: "Sign In",
          onClick: () => router.push("/sign-in"),
        },
      });
      return;
    }

    if (!borrowEligibility.isEligible) {
      toast.error(borrowEligibility.message || "This book is not available.", {
        description: "Try checking back later when copies are available.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await borrowBook({ userId, bookId });

        if (result.success) {
          setBorrowed(true);
          toast.success("📚 Book borrowed successfully!", {
            description: "Due in 14 days. Check your email for confirmation! 📧",
            duration: 6000,
            action: {
              label: "My Profile",
              onClick: () => router.push("/my-profile"),
            },
          });
          router.refresh();
        } else {
          if (result.error?.includes("limit")) {
            toast.error("📚 Borrow Limit Reached!", {
              description: result.error,
              duration: 6000,
              action: {
                label: "My Profile",
                onClick: () => router.push("/my-profile"),
              },
            });
          } else if (result.error?.includes("already borrowed")) {
            toast.info("📖 You already have this book borrowed.", {
              description: "Check your profile to see your active borrows.",
              action: {
                label: "My Profile",
                onClick: () => router.push("/my-profile"),
              },
            });
            setBorrowed(true);
          } else {
            toast.error(result.error || "Failed to borrow book.", {
              description: "Please try again later.",
            });
          }
        }
      } catch (error) {
        console.error("Borrow error:", error);
        toast.error("An unexpected error occurred.", {
          description: "Please refresh the page and try again.",
        });
      }
    });
  };

  const isUnavailable = !borrowEligibility.isEligible || borrowed;

  return (
    <Button
      onClick={handleBorrow}
      disabled={isPending || isUnavailable}
      className="w-full bg-primary text-dark-100 font-semibold py-3 hover:bg-primary/90 disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : borrowed ? (
        "✅ Currently Borrowed"
      ) : !borrowEligibility.isEligible ? (
        "Out of Stock"
      ) : (
        "Borrow Book"
      )}
    </Button>
  );
};