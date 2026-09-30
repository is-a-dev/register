"use client";

import { useRef } from "react";
import Image from "next/image";
import { loginWithGoogle } from "@/lib/firebase";

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
    <div className="flex flex-col items-center gap-[18px] mb-[24px]">
      <div 
        className="relative w-[110px] h-[110px] rounded-[32px] overflow-hidden shrink-0 cursor-pointer select-none ring-2 ring-white hover:ring-green-300 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        onPointerDown={handlePointerDown}
        onPointerUp={clearTimer}
        onPointerLeave={clearTimer}
        onTouchStart={handlePointerDown}
        onTouchEnd={clearTimer}
        onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
        title="Long press for admin access"
      >
        <Image
          src="https://avatars.githubusercontent.com/RajTewari01"
          alt="Biswadeep Tewari"
          width={110}
          height={110}
          className="object-cover w-full h-full pointer-events-none"
          priority
        />
      </div>
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-[1.7rem] font-bold text-slate-900 tracking-tight leading-tight">
          Biswadeep Tewari
        </h1>
        <p className="text-slate-500 text-[0.95rem] mt-1.5 flex items-center gap-1.5 font-medium">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          Kolkata, West Bengal
        </p>
      </div>
    </div>
  );
}
