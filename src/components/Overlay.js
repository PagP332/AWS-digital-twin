import { X } from "lucide-react";
import React from "react";
import FloatingWindow from "./FloatingWindow";

export default function Overlay({ children, handleExitClick }) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-100">
      <button
        className="fixed top-4 right-4 cursor-pointer"
        onClick={handleExitClick}
      >
        <X size={32} color={"white"} />
      </button>
      <div className="flex justify-center items-center h-full">
        <FloatingWindow>{children}</FloatingWindow>
      </div>
    </div>
  );
}
