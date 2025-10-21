"use client";
import test, { getStationsList } from "@/api/utils.mjs";
import Button from "@/components/Button";
import Canvas3D from "@/components/Canvas3D";

export default function page() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Button text="click me" onClick={() => getStationsList()} />
    </div>
  );
}
