import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

export default function Card({ children, className, padding = "md", ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "bg-surface rounded-lg shadow-card",
        padding === "sm" && "p-4",
        padding === "md" && "p-5",
        padding === "lg" && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
