"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import PinLogin from "./PinLogin";

export default function LoginSwitcher({ hasPin }: { hasPin: boolean }) {
  const [usePin, setUsePin] = useState(hasPin);
  return usePin ? <PinLogin onUsePassword={() => setUsePin(false)} /> : <LoginForm />;
}
