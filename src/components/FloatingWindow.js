import React from "react";

export default function FloatingWindow({ children, className, ...props }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[37] bg-white p-5 px-20 drop-shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
