import React from "react";
import { GraduationCap } from "lucide-react";

interface LoadingProps {
  fullPage?: boolean;
  message?: string;
}

export default function Loading({ fullPage = false, message = "Retrieving system records..." }: LoadingProps) {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center select-none font-sans">
      <div className="relative flex items-center justify-center">
        {/* Animated outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        {/* Absolute center logo */}
        <div className="absolute w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md">
          <GraduationCap className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold tracking-tight text-foreground">{message}</p>
        <p className="text-[11px] text-muted-foreground animate-pulse">Connecting to gateway server...</p>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background transition-colors duration-300">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}
