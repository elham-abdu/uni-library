"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  showValue?: boolean;
}

const StarRating = ({
  value,
  onChange,
  size = "md",
  readonly = false,
  showValue = false,
}: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onMouseLeave={() => !readonly && setHoverValue(0)}
          className={`transition-transform ${
            !readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"
          }`}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`${sizes[size]} transition-colors ${
              star <= displayValue
                ? "fill-yellow-400 text-yellow-400"
                : "text-dark-400"
            }`}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-light-100 text-sm font-medium">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;