import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Status } from "@/types/project.ts";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        status: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: Status;
}

function Badge({ className, variant, status, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), status ? statusColors[status] : "", className)}
      {...props}
    />
  );
}

const statusColors: Record<Status, string> = {
  [Status.planning]: "bg-blue-500 text-blue-50",
  [Status.writing]: "bg-blue-500 text-blue-50",
  [Status.editing]: "bg-orange-500 text-orange-50",
  [Status.completed]: "bg-green-500 text-green-50",
};

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
