"use client";
import FloatingWindow from "@/components/FloatingWindow";
import Logos, { PAGASA } from "@/components/Logos";
// import Map from "@/components/Map";
import Overlay from "@/components/Overlay";
import { CloudSun, Settings, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

export default function page() {
  // STATES
  const [selectedStationID, setSelectedStationID] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // EFFECTS
  useEffect(() => {
    if (isMapOpen) {
      setIsMapOpen(false);
    }
  }, [selectedStationID]);

  // FUNCTIONS
  const handleWeatherStationClick = () => {
    setIsMapOpen(true);
    console.log("Open Map");
  };

  // COMPONENTS
  const SidebarTabs = ({ children, className, ...props }) => {
    return (
      <button
        className={`hover:bg-secondary hover:shadow-lg flex w-fit cursor-pointer flex-row items-center rounded-xl p-1 transition-all hover:pl-2 hover:text-white ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };
  const Sidebar = () => {
    return (
      <div className="dark:bg-primary flex h-full w-100 rounded-r-2xl drop-shadow-2xl flex-col justify-between bg-white p-8 dark:text-white">
        <div>
          <div className="mb-15 flex items-center justify-center">
            <FloatingWindow className="!bg-background flex-row gap-4 shadow-lg/30 drop-shadow-none">
              <PAGASA size={24} />
              <p className="text-xl font-semibold">Home</p>
            </FloatingWindow>
          </div>
          <p className="my-2 text-xs opacity-50">GENERAL</p>
          <SidebarTabs onClick={handleWeatherStationClick}>
            <CloudSun size={28} />
            <p className="text-l font-medium">Automatic Weather Station</p>
          </SidebarTabs>
        </div>

        <div>
          <SidebarTabs>
            <Settings size={14} />
            <p className="ml-1 text-xs font-medium">Account Settings</p>
          </SidebarTabs>
          <div className="flex flex-col gap-1">
            <p className="mt-4 mb-2 text-xs opacity-50">LEARN MORE</p>
            <p className="text-xs font-medium">About Us</p>
            <Link
              className="w-fit text-xs font-medium"
              target="_blank"
              href="https://www.panahon.gov.ph"
            >
              PAGASA PANaHON
            </Link>
            <Link
              className="w-fit text-xs font-medium"
              target="_blank"
              href="https://bagong.pagasa.dost.gov.ph/automated-weather-station"
            >
              Bagong PAGASA
            </Link>
          </div>
          <div className="border-background mt-4 w-full border-t-1 pt-4 text-center">
            <p className="text-xs opacity-50">©2025</p>
          </div>
        </div>
      </div>
    );
  };
  const MapOverlay = () => {
    const Map = useMemo(
      () =>
        dynamic(() => import("@/components/Map"), {
          loading: () => <p>A map is loading</p>,
          ssr: false,
        }),
      [],
    );

    return (
      <Overlay handleExitClick={() => setIsMapOpen(!isMapOpen)}>
        <div className="flex flex-col">
          <div className="flex flex-row justify-start items-center mb-4">
            <CloudSun size={28} strokeWidth={1} />
            <p className="text-l font-light">Automatic Weather Station</p>
          </div>
          <p className="text-center">Please Select a Weather Station</p>
          <div className="border-2 border-secondary h-[75vh] w-[60vw] rounded-xl overflow-hidden">
            <Map handleSelectStation={(e) => setSelectedStationID(e)} />
          </div>
        </div>
      </Overlay>
    );
  };

  return (
    <div className="font-inter flex h-svh">
      {isMapOpen && <MapOverlay />}
      <Sidebar />

      {/* // MAIN CONTENT */}
      <div className="flex bg-background h-full w-full justify-center items-center">
        DIGITWIN
      </div>

      <Logos />
    </div>
  );
}
