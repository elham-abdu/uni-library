"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { placeHold, cancelHold } from "@/lib/actions/hold";
import { Bookmark, Clock, X } from "lucide-react";

interface HoldButtonProps {
  userId: string;
  bookId: string;
  availableCopies: number;
  existingHold?: {
    id: string;
    queuePosition: number;
  } | null;
}

const HoldButton = ({
  userId,
  bookId,
  availableCopies,
  existingHold,
}: HoldButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hold, setHold] = useState(existingHold);
  const [isHolding, setIsHolding] = useState(false);

  const handlePlaceHold = () => {
    if (!userId) {
      toast.error("Please sign in to place a hold.");
      router.push("/sign-in");
      return;
    }

    startTransition(async () => {
      const result = await placeHold({ userId, bookId });

      if (result.success) {
        setIsHolding(true);
        toast.success(result.message || "Hold placed successfully! 📚", {
          description: "We'll email you when the book is available.",
          duration: 5000,
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to place hold.");
      }
    });
  };

  const handleCancelHold = () => {
    if (!hold) return;

    startTransition(async () => {
      const result = await cancelHold({ holdId: hold.id, userId });

      if (result.success) {
        setHold(null);
        setIsHolding(false);
        toast.success("Hold cancelled successfully.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel hold.");
      }
    });
  };

  // If book is available, don't show hold button
  if (availableCopies > 0) {
    return null;
  }

  // If user has an active hold, show queue info + cancel button
  if (hold || isHolding) {
    return (
      <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <p className="text-white font-semibold">
              You&apos;re in the queue!
            </p>
            <p className="text-light-100 text-sm">
              Position #{hold?.queuePosition ?? "..."} in line
            </p>
          </div>
        </div>
        <p className="text-light-200 text-xs mb-3">
          We&apos;ll email you when the book becomes available.
        </p>
        <button
          onClick={handleCancelHold}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <X className="w-4 h-4" />
          {isPending ? "Cancelling..." : "Cancel Hold"}
        </button>
      </div>
    );
  }

  // If book is unavailable, show "Place Hold" button
  return (
    <button
      onClick={handlePlaceHold}
      disabled={isPending}
      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-colors disabled:opacity-50 font-semibold"
    >
      <Bookmark className="w-5 h-5" />
      {isPending ? "Placing Hold..." : "Place Hold"}
    </button>
  );
};

export default HoldButton;