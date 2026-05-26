import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  variant?: "default" | "ai" | "hub";
};

const InterestSection = ({
  children,
  className,
  id,
  variant = "default",
}: Props) => (
  <section
    id={id}
    className={cn(
      "rounded-2xl p-2 shadow-soft",
      variant === "ai" &&
        "border border-primary/15 bg-gradient-to-b from-primary/[0.09] via-card to-card ring-1 ring-primary/5",
      variant === "hub" &&
        "gradient-card border border-primary/10 ring-1 ring-primary/5",
      variant === "default" &&
        "border border-border/50 bg-card/95 backdrop-blur-sm",
      className,
    )}
  >
    {children}
  </section>
);

export default InterestSection;
