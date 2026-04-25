"use client";
import { Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";
import { Speak, IsVoiceEnabled, SetVoiceEnabled } from "@/lib/voice";
import { Cn } from "@/lib/utils";

interface VoiceAssistButtonProps {
  text: string;
  className?: string;
  variant?: "icon" | "full";
}

export function VoiceAssistButton({ text, className, variant = "full" }: VoiceAssistButtonProps) {
  const [voiceOn, setVoiceOn] = useState(false);

  useEffect(() => {
    setVoiceOn(IsVoiceEnabled());
  }, []);

  const handleToggle = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    SetVoiceEnabled(next);
  };

  const handleSpeak = () => { Speak(text);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleSpeak}
        className={ Cn("w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center active:bg-blue-100 transition-colors", className)}
        aria-label="Play voice alert"
      >
        <Volume2 size={17} />
      </button>
    );
  }

  return (
    <div className={ Cn("flex items-center gap-2", className)}>
      <button
        onClick={handleSpeak}
        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-2xl transition-colors active:bg-blue-800"
      >
        <Volume2 size={16} />
        Play Voice Warning
      </button>
      <button
        onClick={handleToggle}
        className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
        title={voiceOn ? "Disable voice" : "Enable voice"}
      >
        {voiceOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  );
}

