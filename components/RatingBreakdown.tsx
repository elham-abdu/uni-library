"use client";

import React from "react";
import { Star } from "lucide-react";

interface RatingBreakdownProps {
  breakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    total: number;
    average: number;
  };
}

const RatingBreakdown = ({ breakdown }: RatingBreakdownProps) => {
  if (breakdown.total === 0) {
    return (
      <div className="bg-dark-200 border border-dark-300 rounded-2xl p-6">
        <p className="text-light-100 text-center">
          No ratings yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dark-200 border border-dark-300 rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Average display */}
        <div className="text-center md:text-left md:border-r md:border-dark-300 md:pr-6">
          <p className="text-6xl font-bold text-white mb-2">
            {breakdown.average.toFixed(1)}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(breakdown.average)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-dark-400"
                }`}
              />
            ))}
          </div>
          <p className="text-light-100 text-sm">
            {breakdown.total} rating{breakdown.total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Bars */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star as 1 | 2 | 3 | 4 | 5];
            const percentage =
              breakdown.total > 0 ? (count / breakdown.total) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 flex-shrink-0">
                  <span className="text-light-100 text-sm font-medium">
                    {star}
                  </span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-dark-400 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right flex-shrink-0">
                  <span className="text-light-100 text-sm font-medium">
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RatingBreakdown;