"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { borrowBook } from "@/lib/actions/book";
import { toast } from "sonner";

interface Props {
  userId: string;
  bookId: string;
  borrowEligibility: {
    isEligible: boolean;
    message: string;
  };
}

export const BorrowBook = ({ userId, bookId, borrowEligibility }: Props) => {
  const router = useRouter();
  const [borrowing, setBorrowing] = useState(false);

  const handleBorrow = async () => {
    if (!borrowEligibility.isEligible) {
      toast.error(borrowEligibility.message);
      return;
    }

    setBorrowing(true);

    try {
      const result = await borrowBook({ userId, bookId });

      if (result.success) {
        toast.success("Book borrowed successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to borrow book.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <Button
      onClick={handleBorrow}
      disabled={borrowing || !borrowEligibility.isEligible}
      className="book-overview_btn"
    >
      <Image src="/icons/book.svg" alt="book" width={20} height={20} />
      <p className="font-bebas-neue text-xl text-dark-100">
        {borrowing ? "Borrowing..." : "Borrow Book"}
      </p>
    </Button>
  );
};