import React from "react";

export default function InputField({
  text,
  className,
  secret,
  placeholder,
  value,
  onChange,
  ...props
}) {
  return (
    <div className={`${className} my-3 w-full`}>
      <p className="text-left text-sm">{text}</p>
      <input
        type={secret ? "password" : "text"}
        className="border-border bg-background flex w-full rounded-[6] border-1 p-1 text-xs opacity-70"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
