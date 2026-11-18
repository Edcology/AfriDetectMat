"use client";

import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";

function useSpeech() {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
    setSpeaking(true);
  };

  return { speaking, speak };
}

/** Reads a short passage aloud — used on the readings and next-visit cards. */
export function SpeakButton({ text, label = "Listen" }: { text: string; label?: string }) {
  const { speaking, speak } = useSpeech();

  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-pressed={speaking}
      aria-label={speaking ? "Stop reading" : `${label} — read this card aloud`}
      className={`inline-flex h-[33px] items-center gap-2 rounded-[8px] border px-4 text-[12px] transition-colors ${
        speaking ? "border-brand-accent bg-brand-mist text-brand-deep" : "border-line text-ink-soft hover:text-ink"
      }`}
    >
      <PlayCircle size={14} /> {speaking ? "Stop" : label}
    </button>
  );
}

/** Puts the caret in the message box — the "New message" affordance. */
export function FocusComposerButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => {
        const input = document.querySelector<HTMLInputElement>("#composer-input");
        input?.scrollIntoView({ behavior: "smooth", block: "center" });
        input?.focus();
      }}
      className="inline-flex h-[42px] items-center gap-2 rounded-[8px] bg-brand px-4 text-[14px] font-medium text-white hover:bg-[#093f3b]"
    >
      {children}
    </button>
  );
}
