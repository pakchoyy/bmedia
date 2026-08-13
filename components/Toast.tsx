"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

interface ToastProps {
  message: string;
  visible: boolean;
  variant?: "success" | "danger";
}

export default function Toast({ message, visible, variant = "success" }: ToastProps) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (!visible) return;
    const t = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(t);
  }, [visible]);

  const bg = variant === "danger" ? "bg-danger" : "bg-success";

  return (
    <div
      className={`fixed right-5 ${bg} text-white px-8 py-4 rounded-lg shadow-lg flex items-center gap-4 font-semibold z-[9999] transition-all duration-500`}
      style={{
        bottom: show ? 20 : -100,
      }}
    >
      <Icon
        name={variant === "danger" ? "xmark" : "circle-check"}
        className="text-2xl"
      />
      <span>{message}</span>
    </div>
  );
}
