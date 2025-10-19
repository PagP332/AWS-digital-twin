import React from "react";

export default function InputField({ text, className, secret, ...props }) {
  return (
    <div className={`${className} my-3 w-full`}>
      <p className="text-left text-sm">{text}</p>
      <input
        type={secret ? "password" : "text"}
        className="opacity-70 w-full flex rounded-[6] border-border border-1 bg-background text-xs p-1"
      />
    </div>
  );
}
