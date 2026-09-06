import React from "react";

export default function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse bg-card-hover/70 rounded-md ${className}`}
      {...props}
    />
  );
}
