import React from "react"

export default function FloatingWindow({ children, className, ...props }) {
  return (
    <div className={`${className} flex flex-col items-center justify-center p-5 px-20 w-auto bg-white rounded-[37] drop-shadow-2xl h-max`} {...props}>
      {children}
    </div>
  )
}
