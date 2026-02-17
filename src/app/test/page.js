"use client";
import {
  createAlert,
  diagnoseData,
  getAlertsList,
  getOtherData,
  predictData,
  pushTest,
  toggleAlert,
} from "@/api/utils.mjs";
import Button from "@/components/Button";
import { useState } from "react";
import Canvas3D from "../../components/Canvas3D";
import Overlay from "@/components/Overlay";
import { TriangleAlert, Dot, X } from "lucide-react";
import React from "react";
import { generateUUID } from "@/utils/predict";
import InputField from "@/components/InputField";
import FloatingWindow from "@/components/FloatingWindow";

export default function Test() {
  return (
    <div className="font-sfpro flex h-svh w-screen items-center justify-center">
      <Button text="test" onClick={async () => await getOtherData("001")} />
    </div>
  );
}
