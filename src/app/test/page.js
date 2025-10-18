"use client";
import { CloudSun } from "lucide-react";
// import Map from "@/components/Map";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";

export default function page() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    [],
  );

  const marker = {
    position: [14.614, 121.0608],
    stationName: "Science Garden",
    location: "Science Garden, Quezon City",
  };

  return (
    <div className="h-screen w-screen rounded-xl overflow-hidden">
      <Map />
    </div>
  );
}
