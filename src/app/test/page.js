"use client";
import { useState } from "react";

export default function Test() {
  const [filterGraph, setFilterGraph] = useState(5);

  const FilterButtons = () => {
    const Button = ({ text, onClick, ind }) => {
      return (
        <div
          className={`border-primary hover:bg-secondary/50 cursor-pointer rounded-md border-1 p-1 ${ind === filterGraph ? "bg-secondary/50" : ""}`}
          onClick={onClick}
        >
          <p className="text-xs font-light">{text}</p>
        </div>
      );
    };
    return (
      <div className="flex justify-end gap-1">
        <Button ind={1} text="1h" onClick={() => setFilterGraph(1)} />
        <Button ind={2} text="24h" onClick={() => setFilterGraph(2)} />
        <Button ind={3} text="7d" onClick={() => setFilterGraph(3)} />
        <Button ind={4} text="1m" onClick={() => setFilterGraph(4)} />
        <Button ind={5} text="ALL" onClick={() => setFilterGraph(5)} />
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <FilterButtons />
    </div>
  );
}
