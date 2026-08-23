"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { borrowBook } from "@/lib/actions/book";
import { useRouter } from "next/navigation";

interface BorrowButtonProps {
  userId: string;
  bookId: string;
  availableCopies: number;
  hasBorrowed: boolean;
}

export default function BorrowButton({
  userId,
  bookId,
  availableCopies,
  hasBorrowed,
}: BorrowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [borrowed, setBorrowed] = useState(hasBorrowed);
  const router = useRouter();

  const handleBorrow = () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    startTransition(async () => {
      const result = await borrowBook({ userId, bookId });

      if (result.success) {
        setBorrowed(true);
        alert("Book borrowed successfully! It is due in 14 days.");
      } else {
        alert(result.error || "Failed to borrow book.");
      }
    });
  };

  const isUnavailable = availableCopies <= 0 || borrowed;

  return (
    <Button
      onClick={handleBorrow}
      disabled={isPending || isUnavailable}
      className="w-full bg-primary text-dark-100 font-semibold py-3 hover:bg-primary/90 disabled:opacity-50"
    >
      {isPending
        ? "Processing..."
        : borrowed
        ? "Currently Borrowed"
        : availableCopies <= 0
        ? "Out of Stock"
        : "Borrow Book"}
    </Button>
  );
}