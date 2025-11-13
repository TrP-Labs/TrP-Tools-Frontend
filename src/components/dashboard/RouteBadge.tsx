"use client";

import React from "react";

interface RouteBadgeProps {
  label: string;
  color: string;
  size?: "md" | "lg";
}

const MAX_RECT_LABEL_LENGTH = 10;

const RouteBadge: React.FC<RouteBadgeProps> = ({ label, color, size = "md" }) => {
  const trimmed = label.trim();
  const display = trimmed.slice(0, MAX_RECT_LABEL_LENGTH).toUpperCase() || "RO";
  const isCircle = display.length <= 2;

  const circleClass =
    size === "lg"
      ? "min-w-[96px] min-h-[96px] text-2xl"
      : "min-w-[72px] min-h-[72px] text-lg";
  const rectanglePadding = size === "lg" ? "px-6 py-3 text-xl" : "px-4 py-2 text-base";

  return (
    <div
      className={[
        "font-semibold uppercase tracking-wide inline-flex items-center justify-center text-center select-none bg-white text-black shadow-sm whitespace-nowrap",
        isCircle ? `rounded-full ${circleClass}` : `rounded-2xl ${rectanglePadding} min-w-[6rem] max-w-[10ch]`,
      ].join(" ")}
      style={{
        border: `10px solid ${color || "#000000"}`,
        padding: isCircle ? "15px" : undefined,
        aspectRatio: isCircle ? "1 / 1" : undefined,
      }}
    >
      <span className="truncate">{display}</span>
    </div>
  );
};

export default RouteBadge;
