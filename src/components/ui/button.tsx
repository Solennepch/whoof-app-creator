import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "gradient-signature text-white shadow-glow hover:shadow-vibrant hover:scale-[1.02] transition-smooth",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
        outline: "border-2 border-secondary bg-background text-secondary hover:bg-secondary/10 transition-smooth",
        secondary: "bg-white border-2 border-secondary text-secondary font-bold hover:bg-secondary/10 transition-smooth",
        ghost: "hover:bg-accent/10 hover:text-accent transition-smooth",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "gradient-signature text-white shadow-glow hover:shadow-vibrant hover:scale-[1.02] transition-smooth",
        disabled: "bg-muted text-muted-foreground opacity-40 cursor-not-allowed",
        // Tinder-style action buttons
        like: "bg-primary/10 text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-110 active:scale-95 transition-smooth shadow-soft",
        pass: "bg-muted/50 text-muted-foreground border-2 border-muted hover:bg-destructive/10 hover:border-destructive hover:text-destructive hover:scale-110 active:scale-95 transition-smooth",
        superlike: "gradient-signature text-white border-2 border-white/20 hover:scale-110 hover:shadow-vibrant active:scale-95 transition-smooth shadow-glow",
        premium: "bg-muted/30 text-muted-foreground/40 border-2 border-muted/30 cursor-not-allowed relative",
      },
      size: {
        default: "h-12 px-6 py-3", /* 48px height - Kit UI */
        sm: "h-9 rounded-2xl px-4",
        lg: "h-14 rounded-2xl px-8 text-base font-bold",
        icon: "h-12 w-12",
        action: "h-14 w-14 rounded-full", /* 56px - Tinder actions */
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
