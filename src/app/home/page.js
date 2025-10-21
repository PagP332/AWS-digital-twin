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
import Button from "@/components/Button";

export default function page() {
  // STATES
  const [selectedStationID, setSelectedStationID] = useState(null);
  const [selectedStationPosition, setSelectedStationPosition] = useState([
    0, 0,
  ]);
  const [selectedStationName, setSelectedStationName] = useState("--");
  const [stationData, setStationData] = useState(testSensorData);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isMainContentDisplayed, setIsMainContentDisplayer] = useState(false);

  const [parameterSelectedIndex, setParameterSelectedIndex] = useState(null);

  // EFFECTS

  // FUNCTIONS
  const handleWeatherStationClick = () => {
    setIsMapOpen(true);
    console.log("Open Map");
  };

  const handleOnMarkerView = (id, position, stationName) => {
    setSelectedStationID(id);
    setSelectedStationPosition(position);
    setSelectedStationName(stationName);

    setIsMapOpen(false);
    setIsMainContentDisplayer(true);
  };

  const handleDataCellOnClick = ({ index }) => {
    // console.log(data.data);
    // console.log(index);
    setParameterSelectedIndex(index);
  };

  const handleCanvasParameterSelect = (index) => {
    if (parameterSelectedIndex === index) {
      setParameterSelectedIndex(null);
    } else {
      setParameterSelectedIndex(index);
    }
  };

  // COMPONENTS
  const SidebarTabs = ({ children, className, ...props }) => {
    return (
      <button
        className={`hover:bg-secondary flex w-fit cursor-pointer flex-row items-center rounded-xl p-1 transition-all hover:pl-2 hover:text-white hover:shadow-lg ${className}`}
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
          <div className="mb-4 flex flex-row items-center justify-start">
            <CloudSun size={28} strokeWidth={1} />
            <p className="text-l font-light">Automatic Weather Station</p>
          </div>
          <p className="text-center">Please Select a Weather Station</p>
          <div className="border-secondary h-[75vh] w-[60vw] overflow-hidden rounded-xl border-2">
            <Map handleSelectStation={handleOnMarkerView} />
          </div>
        </div>
      </Overlay>
    );
  };
  const TwinFloatingWindow = ({ children, className, ...props }) => {
    return (
      <FloatingWindow
        className={`flex h-fit w-fit rounded-xl !px-10 shadow-lg/10 drop-shadow-none ${className}`}
        {...props}
      >
        {children}
      </FloatingWindow>
    );
  };
  const DataCell = ({ data, index }) => {
    // console.log(data);
    if (parameterSelectedIndex === index) {
      // console.log("parameter selected");
      return (
        <div
          onClick={() => setParameterSelectedIndex(null)}
          className={`z-50 ml-2 flex h-fit w-fit cursor-pointer flex-col rounded-xl bg-white p-2 px-4 shadow-lg/10 drop-shadow-none`}
        >
          <p className="text-s text-left font-light whitespace-nowrap">
            {data.data}
          </p>
          <div className="flex flex-row items-center justify-between gap-10">
            <p
              className="flex text-left text-xl font-semibold whitespace-nowrap"
            >
              {data.value}
              {data.unit}
            </p>
            <Button text="Details" />
          </div>
          <p className="text-left text-xs font-light whitespace-nowrap opacity-50">
            {data.time || "Not Available"}
          </p>
        </div>
      );
    } else {
      return (
        <div
          onClick={() => handleDataCellOnClick({ data, index })}
          className={`hover:bg-accent z-50 flex h-fit w-full cursor-pointer flex-col rounded-xl bg-white p-2 px-4 shadow-lg/10 drop-shadow-none transition-all hover:ml-2 hover:text-white`}
        >
          <p className="text-left text-xs font-light whitespace-nowrap">
            {data.data}
          </p>
          <p className="text-s text-left font-semibold whitespace-nowrap">
            {data.value}
            {data.unit}
          </p>
        </div>
      );
    }
  };

  // UI
  const Sidebar = () => {
    return (
      <div className="z-50 flex h-full w-100 flex-col justify-between rounded-r-2xl bg-white p-8 drop-shadow-2xl">
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
      <div className="inline-grid w-1/8 grid-cols-1 justify-start gap-2">
        {stationData.map((data, index) => {
          return <DataCell key={index} data={data} index={index} />;
        })}
      </div>
    );
  };
  const TopInfoView = () => {
    return (
      <TwinFloatingWindow className="z-50 mb-1 w-full flex-row justify-between">
        <div className="flex-1 items-center justify-center">
          <p className="mb-1 text-xl font-semibold">{selectedStationName}</p>
          <p className="text-xs font-light opacity-50">
            {selectedStationPosition[0]}
            <br />
            {selectedStationPosition[1]}
          </p>
        </div>
        <div className="flex-1 items-center justify-center text-center">
          <p className="text-xs font-semibold">Current Time</p>
          <LiveClock />
        </div>
        <div className="flex flex-1 flex-col items-end text-end">
          <StatusIndicator className="flex items-end" type="active" />
          <div className="mt-1 opacity-50">
            <p className="text-sm font-semibold">Last Observed</p>
            <p className="text-xs font-light">date time</p>
          </div>
        </div>
      </TwinFloatingWindow>
    );
  };
  const MainContent = () => {
    return (
      <div
        className="bg-background relative flex h-full w-full flex-col gap-2 p-4"
      >
        <TopInfoView />
        <SideDataInfo />
        <div className="absolute top-0 left-0 z-0 h-full w-full">
          <Canvas3D
            parameterSelectedIndexProp={parameterSelectedIndex}
            handleCanvasParameterSelect={handleCanvasParameterSelect}
          />
        </div>
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
