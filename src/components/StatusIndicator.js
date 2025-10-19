import {
  CircleDot,
  CircleDotDashed,
  CircleQuestionMark,
  TriangleAlert,
} from "lucide-react";
import React from "react";

export default function StatusIndicator({ type, className, ...props }) {
  const Template = ({ textColor, text, color, symbol }) => {
    return (
      <div
        className={`flex flex-row justify-center items-center w-fit p-1 px-2 rounded-2xl ${color} ${textColor} text-sm`}
      >
        {symbol}
        <p className="ml-1 opacity-100 font-semibold">{text}</p>
      </div>
    );
  };

  const iconSize = 16;
  const strokeWidth = 2.5;
  if (type === "active") {
    return (
      <Template
        text="Active"
        textColor="text-[#24A148]"
        color="bg-[#19C332]/50"
        symbol={<CircleDot size={iconSize} strokeWidth={strokeWidth} />}
      />
    );
  } else if (type === "warning") {
    return (
      <Template
        text="Warning"
        textColor="text-[#FF832B]"
        color="bg-[#FEBC2E]/50"
        symbol={<TriangleAlert size={iconSize} strokeWidth={strokeWidth} />}
      />
    );
  } else if (type === "inactive") {
    return (
      <Template
        text="Inactive"
        textColor="text-[#DA1E28]"
        color="bg-[#FF736A]/50"
        symbol={<CircleDotDashed size={iconSize} strokeWidth={strokeWidth} />}
      />
    );
  } else {
    return (
      <Template
        text="Unknown"
        textColor="text-[#8a3ffc]"
        color="bg-[#8a3ffc]/50"
        symbol={
          <CircleQuestionMark size={iconSize} strokeWidth={strokeWidth} />
        }
      />
    );
  }
}
