import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: string;
}

export default function Badge({ children, color = "#888" }: BadgeProps) {
  return (
    <span
      className="badge"
      style={{ background: `${color}18`, color }}
    >
      {children}
    </span>
  );
}
