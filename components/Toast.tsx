"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (!visible) return;
    const t = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div
      className="fixed right-5 bg-success text-white px-8 py-4 rounded-lg shadow-lg flex items-center gap-4 font-semibold z-[9999] transition-all duration-500"
      style={{
        bottom: show ? 20 : -100,
      }}
    >
      <Icon name="circle-check" className="text-2xl" />
      <span>{message}</span>
    </div>
  );
}
