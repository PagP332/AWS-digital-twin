"use client";
import {
  createAlert,
  diagnoseData,
  getAlertsList,
  getOtherData,
  parameters,
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
import { db } from "@/api/route";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import LiveClock from "@/components/LiveClock";

export default function Test() {
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [pressure, setPressure] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [windDirection, setWindDirection] = useState("");
  const [precipitation, setPrecipitation] = useState("");

  const formatDateTime = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  const sendData = async (parameter, data) => {
    // console.log(serverTimestamp());
    const docRef = collection(db, `stations/001/${parameter}`);
    const res = await addDoc(docRef, {
      value: data,
      timestamp: formatDateTime(new Date()),
    });
    console.log(res);
  };

  const submit = async (e) => {
    e.preventDefault();
    await sendData("temperature", Number(temperature));
    await sendData("humidity", Number(humidity));
    await sendData("pressure", Number(pressure));
    await sendData("wind-speed", Number(windSpeed));
    await sendData("wind-direction", Number(windDirection));
    await sendData("precipitation", Number(precipitation));
  };

  return (
    <div className="font-sfpro flex h-svh w-screen flex-col items-center justify-center">
      <LiveClock />
      <form className="flex flex-col gap-2" onSubmit={submit}>
        <InputField
          text="Temperature"
          placeholder={"Temperature"}
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
        />
        <InputField
          text="Humidity"
          placeholder={"Temperature"}
          value={humidity}
          onChange={(e) => setHumidity(e.target.value)}
        />
        <InputField
          text="Pressure"
          placeholder={"Temperature"}
          value={pressure}
          onChange={(e) => setPressure(e.target.value)}
        />
        <InputField
          text="Wind Speed"
          placeholder={"Temperature"}
          value={windSpeed}
          onChange={(e) => setWindSpeed(e.target.value)}
        />
        <InputField
          text="Wind Direction"
          placeholder={"Temperature"}
          value={windDirection}
          onChange={(e) => setWindDirection(e.target.value)}
        />
        <InputField
          text="Precipitation"
          placeholder={"Temperature"}
          value={precipitation}
          onChange={(e) => setPrecipitation(e.target.value)}
        />
        <Button text="test" onClick={async () => await submit()} />
      </form>
    </div>
  );
}
