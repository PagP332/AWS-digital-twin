"use client";
import test, {
  getLatestStationData,
  getParameterData,
  getStationsList,
  populateStations,
} from "@/api/utils.mjs";
import Button from "@/components/Button";
import Canvas3D from "@/components/Canvas3D";
import Graph from "@/components/Graph";
import { useState } from "react";

export default function page() {
  const [data, setData] = useState(null);

  const handleOnClick = async () => {
    const data = await getParameterData("98", "temperature");
    setData(data);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Button text="click me" onClick={handleOnClick} />
      {data && <Graph data={data} />}
    </div>
  );
}
