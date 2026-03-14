import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white hover:bg-accent/90',
        secondary:
          'bg-bg-elevated text-text-secondary border border-border hover:border-border-focus hover:text-text-primary',
        danger: 'bg-danger text-white hover:bg-danger/90',
        ghost:
          'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-sm',
        md: 'h-10 px-4 text-sm rounded-sm',
        lg: 'h-12 px-6 text-base rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Button = forwardRef(
  ({ className, variant, size, isLoading, icon: Icon, children, ...props }, ref) => {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : Icon ? (
          <Icon className="h-4 w-4" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
