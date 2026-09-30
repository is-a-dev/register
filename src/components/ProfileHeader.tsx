"use client";

import { useRef } from "react";
import Image from "next/image";
import { loginWithGoogle } from "@/lib/firebase";
import { MapPin } from "lucide-react";

import SocialRow from "./SocialRow";

export default function ProfileHeader() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = () => {
    // Start a 1.5s timer for the long press
    timerRef.current = setTimeout(async () => {
      console.log("Long press detected, triggering login...");
      const res = await loginWithGoogle();
      if (res.success) {
        // Use window.location instead of next router to force full reload into /admin
        window.location.href = "/admin";
      }
    }, 1500);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="flex flex-row items-center gap-[22px] w-full">
      <div 
        className="relative w-[125px] h-[125px] rounded-[36px] overflow-hidden shrink-0 cursor-pointer select-none ring-1 ring-black/5 hover:ring-green-400/50 transition-all shadow-md"
        onPointerDown={handlePointerDown}
        onPointerUp={clearTimer}
        onPointerLeave={clearTimer}
        onTouchStart={handlePointerDown}
        onTouchEnd={clearTimer}
        onContextMenu={(e) => e.preventDefault()}
        title="Long press for admin access"
      >
        <Image
          src="https://avatars.githubusercontent.com/RajTewari01"
          alt="Biswadeep Tewari"
          width={125}
          height={125}
          className="object-cover w-full h-full pointer-events-none"
          priority
        />
      </div>
      <div className="flex flex-col justify-center text-left flex-1 py-1">
        <h1 className="text-[1.8rem] text-black tracking-wide leading-none mb-2 font-[family-name:var(--font-pacifico)] drop-shadow-sm">
          Biswadeep Tewari
        </h1>
        <p className="text-slate-500 text-[0.95rem] flex items-center justify-start gap-1 font-medium mb-1.5">
          <MapPin className="w-[14px] h-[14px] text-emerald-600" strokeWidth={2.5} />
          Kolkata, West Bengal
        </p>
        <SocialRow />
      </div>
    </div>
  );
}
