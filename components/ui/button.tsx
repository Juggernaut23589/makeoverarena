"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-navy-900 text-cream shadow-card hover:bg-navy-800 active:scale-[0.98]",
        gold:
          "bg-gold-500 text-navy-900 font-semibold shadow-card hover:bg-gold-400 active:scale-[0.98]",
        outline:
          "border border-navy-900 bg-transparent text-navy-900 hover:bg-navy-900 hover:text-cream active:scale-[0.98]",
        "outline-gold":
          "border border-gold-500 bg-transparent text-gold-600 hover:bg-gold-500 hover:text-navy-900 active:scale-[0.98]",
        ghost:
          "bg-transparent hover:bg-navy-50 text-navy-900 active:scale-[0.98]",
        link: "text-navy-900 underline-offset-4 hover:underline p-0 h-auto",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]",
        secondary:
          "bg-muted text-muted-foreground hover:bg-muted/80 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <span
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref as React.Ref<HTMLSpanElement>}
          {...(props as React.HTMLAttributes<HTMLSpanElement>)}
        />
      );
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
