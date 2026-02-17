"use client";
import {
  createAlert,
  diagnoseData,
  getAlertsList,
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
  const alertsList = [
    {
      id: 1,
      read: false,
      type: "anomaly",
      resolved: false,
      sensor: "",
      station_id: "001",
      timestamp: "2024-06-01 12:00:00",
      data: {
        temperature: 85,
        humidity: 70,
        pressure: 1015,
        windSpeed: 0,
        windDirection: 277,
        precipitation: 0,
      },
    },
  ];

  return (
    <div className="font-sfpro flex h-svh w-screen items-center justify-center">
      <Button text="test" onClick={() => diagnoseData(alertsList[0].data)} />
    </div>
  );
}
