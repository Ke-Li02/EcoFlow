import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
}

export default function Toast({ message, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!visible) return null;

  return <div className="toast toast-success">{message}</div>;
}

