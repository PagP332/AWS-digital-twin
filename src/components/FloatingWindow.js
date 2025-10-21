import React from "react";

export default function FloatingWindow({ children, className, ...props }) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-5 px-20 bg-white rounded-[37] drop-shadow-2xl  ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
