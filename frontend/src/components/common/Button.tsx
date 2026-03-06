import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function Button({ loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button disabled={loading || disabled} {...props}>
      {loading ? 'Loading…' : children}
    </button>
  );
}

