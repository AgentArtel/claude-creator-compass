import React from "react";

export function MockData({ children }: { children: React.ReactNode }) {
  return <span className="italic opacity-75">{children}</span>;
}
