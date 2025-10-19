"use client";
import FloatingWindow from "@/components/FloatingWindow";
import LiveClock from "@/components/LiveClock";
import Logos, { PAGASA } from "@/components/Logos";
// import Map from "@/components/Map";
import Overlay from "@/components/Overlay";
import StatusIndicator from "@/components/StatusIndicator";
import { CloudSun, Settings, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { testSensorData } from "../../../public/test_data";
import Canvas3D from "@/components/Canvas3D";

export default function page() {
  // STATES
  const [selectedStationID, setSelectedStationID] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isMainContentDisplayed, setIsMainContentDisplayer] = useState(false);

  // EFFECTS

  // FUNCTIONS
  const handleWeatherStationClick = () => {
    setIsMapOpen(true);
    console.log("Open Map");
  };

  const handleOnMarkerView = (e) => {
    setSelectedStationID(e);
    setIsMapOpen(false);
    setIsMainContentDisplayer(true);
    console.log("id selected");
  };

  // UI
  const Sidebar = () => {
    return (
      <div className="dark:bg-primary z-50 flex h-full w-100 rounded-r-2xl drop-shadow-2xl flex-col justify-between bg-white p-8 dark:text-white">
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
  const SideDataInfo = () => {
    return (
      <div className="inline-grid grid-cols-1 gap-2 justify-start w-1/8">
        {testSensorData.map((data, index) => {
          return <DataCell key={index} data={data} />;
        })}
      </div>
    );
  };
  const TopInfoView = () => {
    return (
      <TwinFloatingWindow className="z-50 flex-row w-full justify-between mb-1">
        <div className="flex-1 justify-center items-center">
          <p className="font-semibold text-xl mb-1">NAME</p>
          <p className="font-light text-xs opacity-50">
            LAT
            <br />
            LONG
          </p>
        </div>
        <div className="flex-1 justify-center items-center text-center">
          <p className="font-semibold text-xs">Current Time</p>
          <LiveClock />
        </div>
        <div className="flex-1 flex flex-col items-end text-end">
          <StatusIndicator className="flex items-end" type="aasdf" />
          <div className="opacity-50 mt-1">
            <p className="font-semibold text-sm">Last Observed</p>
            <p className="font-light text-xs">date time</p>
          </div>
        </div>
      </TwinFloatingWindow>
    );
  };
  const MainContent = () => {
    return (
      <div className="relative flex flex-col bg-background h-full w-full gap-2 p-4">
        <TopInfoView />
        <SideDataInfo />
        <div className="z-0 absolute top-0 left-0 w-full h-full">
          <Canvas3D />
        </div>
      </div>
    );
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
            <Map handleSelectStation={handleOnMarkerView} />
          </div>
        </div>
      </Overlay>
    );
  };
  const TwinFloatingWindow = ({ children, className, ...props }) => {
    return (
      <FloatingWindow
        className={`flex !px-10 w-fit h-fit rounded-xl shadow-lg/10 drop-shadow-none ${className}`}
        {...props}
      >
        {children}
      </FloatingWindow>
    );
  };
  const DataCell = ({ data }) => {
    console.log(data);
    return (
      <div className="flex flex-col w-full h-fit z-50 bg-white p-2 px-4 rounded-xl shadow-lg/10 drop-shadow-none">
        <p className="font-light text-xs text-left whitespace-nowrap">
          {data.data}
        </p>
        <p className="font-semibold text-s text-left whitespace-nowrap">
          {data.value}
          {data.unit}
        </p>
      </div>
    );
  };

  return (
    <div className="font-sfpro flex h-svh">
      {isMapOpen && <MapOverlay />}
      <Sidebar />
      {isMainContentDisplayed && <MainContent />}
      <Logos />
    </div>
  );
}
