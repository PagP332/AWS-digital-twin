"use client"
import React from "react"

const Button = ({ text, onClick, className, ...props }) => {
  return (
    <button
      className={`${className} text-white cursor-pointer my-2 rounded-[6] px-5 py-2 bg-secondary text-xs hover:opacity-90 transition-all`}
      onClick={onClick}
      {...props}
    >
      {text}
    </button>
  )
}

export default Button
