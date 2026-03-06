import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, id, ...props }: InputProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

