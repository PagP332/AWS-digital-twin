import { X } from "lucide-react";
import React from "react";
import FloatingWindow from "./FloatingWindow";

export default function Overlay({ children, handleExitClick }) {
  return (
    <div
      className="fixed top-0 left-0 z-100 h-full w-full bg-black/50"
      onClick={handleExitClick}
    >
      <button
        className="fixed top-4 right-4 cursor-pointer"
        onClick={handleExitClick}
      >
        <X size={32} color={"white"} />
      </button>
      <div
        className="z-50 flex h-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <FloatingWindow>{children}</FloatingWindow>
      </div>
    </div>
  );
}
