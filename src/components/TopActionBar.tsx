"use client";

import { useEffect, useState } from "react";

export default function TopActionBar() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    const textToCopy = url || window.location.href;

    // Helper for non-secure HTTP contexts where navigator.clipboard is undefined
    const fallbackCopy = (text: string) => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        alert("Link copied to clipboard (fallback)!");
      } catch (e) {
        console.error("Fallback copy failed", e);
      }
    };

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Biswadeep Tewari - Link Tree",
          url: textToCopy,
        });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        alert("Link copied to clipboard!");
      } else {
        fallbackCopy(textToCopy);
      }
    } catch (err: any) {
      console.error("Error sharing:", err);
      // Native share might throw AbortError if user closes the sheet, don't fallback on abort
      if (err.name !== 'AbortError') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(textToCopy);
            alert("Link copied to clipboard!");
          } catch (e) {
            fallbackCopy(textToCopy);
          }
        } else {
          fallbackCopy(textToCopy);
        }
      }
    }
  };

  return (
    <div className="w-full flex justify-end items-center mb-8 relative z-20">
      <button 
        onClick={handleShare}
        title="Share"
        className="w-[42px] h-[42px] glass-panel !rounded-full flex items-center justify-center hover:bg-green-50 transition-colors cursor-pointer text-slate-700 hover:text-green-700"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
      </button>
    </div>
  );
}
