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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { testSensorData } from "../../../public/test_data";
import Canvas3D from "@/components/Canvas3D";
import Button from "@/components/Button";
import {
  getLatestStationData,
  getParameterData,
  parameters,
} from "@/api/utils.mjs";
import { formatDateTime } from "@/components/formatDate";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/api/route";
import Graph from "@/components/Graph";

export default function Home() {
  // STATES
  const [selectedStationID, setSelectedStationID] = useState(null);
  const [selectedStationPosition, setSelectedStationPosition] = useState([
    0, 0,
  ]);
  const [selectedStationName, setSelectedStationName] = useState("--");
  const [selectedStationLocation, setSelectedStationLocation] = useState("");
  const [stationData, setStationData] = useState([]);
  const [lastObserved, setLastObserved] = useState("Not Available");

  const [graphData, setGraphData] = useState([]);
  const [graphDataRef, setGraphDataRef] = useState([]);
  const [graphParameterInfo, setGraphParameterInfo] = useState(null);
  const [filterGraph, setFilterGraph] = useState(5);

  const [parameterSelectedIndex, setParameterSelectedIndex] = useState(null);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isMainContentDisplayed, setIsMainContentDisplayer] = useState(false);
  const [isGraphOverlayDisplayed, setIsGraphOverlayDisplayed] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // FUNCTIONS
  const handleWeatherStationClick = () => {
    setIsMapOpen(true);
    console.log("Open Map");
  };
  const handleOnMarkerView = (id, position, stationName, location) => {
    setSelectedStationID(id);
    setSelectedStationPosition(position);
    setSelectedStationName(stationName);
    setSelectedStationLocation(location);

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
  const handleDataCellViewOnClick = async (index, data) => {
    console.log(index);
    let parameter;
    switch (index) {
      case 0:
        // console.log("Precipitation");
        parameter = "precipitation";
        break;
      case 1:
        // console.log("Temperature");
        parameter = "temperature";
        break;
      case 2:
        // console.log("Humidity");
        parameter = "humidity";
        break;
      case 3:
        // console.log("Pressure");
        parameter = "pressure";
        break;
      case 4:
        // console.log("Wind Speed");
        parameter = "wind-speed";
        break;
      case 5:
        // console.log("Wind Direction");
        parameter = "wind-direction";
        break;
    }
    const response = await getParameterData(selectedStationID, parameter);
    // console.log(response);
    setGraphData(response);
    setGraphDataRef(response);
    setGraphParameterInfo(data);
    setIsGraphOverlayDisplayed(true);
  };

  // EFFECTS
  useEffect(() => {
    if (selectedStationID) {
      setIsLoading(true);
      const fetchStationData = async () => {
        try {
          const response = await getLatestStationData(selectedStationID);
          setStationData(response);
          setLastObserved(getLatestDatetime(response));
        } catch (err) {
          console.error("Failed to fetch station data: ", err);
        }
      };
      fetchStationData();
      setIsLoading(false);
    }
  }, [selectedStationID]);

  useEffect(() => {
    if (!selectedStationID) return;

    let timeoutId;
    const handleChange = () => {
      clearTimeout(timeoutId); // clear any previous timer
      timeoutId = setTimeout(() => {
        setIsLoading(true);
        const fetchStationData = async () => {
          try {
            const response = await getLatestStationData(selectedStationID);
            setStationData(response);
            setLastObserved(getLatestDatetime(response));
          } catch (err) {
            console.error("Failed to fetch station data: ", err);
          }
        };
        fetchStationData();
        setIsLoading(false);
      }, 10000); // wait 10 seconds before calling refetch
    };

    const listeners = parameters.map((parameter) =>
      onSnapshot(
        collection(db, `stations/${selectedStationID}/${parameter}`),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (
              change.type === "modified" ||
              change.type === "added" ||
              change.type === "removed"
            ) {
              console.log("Change detected, refetching data");
              handleChange();
            }
          });
        },
      ),
    );

    return () => {
      listeners.forEach((unsub) => unsub());
      clearTimeout(timeoutId);
    };
  }, [selectedStationID]);

  useEffect(() => {
    const filteredData = dataCleanup(graphDataRef, filterGraph);
    setGraphData(filteredData);
    // console.log(graphData);
  }, [filterGraph, graphDataRef]);

  // UTILITY
  const getLatestDatetime = useCallback((response) => {
    if (selectedStationID === "001") {
      const validTimestamps = response
        .map((item) => item.datetime)
        .filter((t) => t)
        .map((t) => {
          if (typeof t.toDate === "function") {
            // Firestore Timestamp object
            return t.toDate().getTime();
          } else if (typeof t === "string") {
            // String format: "YYYY-MM-DD HH:mm:ss"
            const normalized = t.replace(" ", "T"); // convert to ISO-like format
            return new Date(normalized).getTime();
          }
          return null;
        })
        .filter((time) => !isNaN(time));

      const latestTimestamp = validTimestamps.length
        ? new Date(Math.max(...validTimestamps))
        : null;

      console.log(`latest timestamp ${latestTimestamp}`);

      const latestDateTime = latestTimestamp
        ? new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "medium",
          }).format(latestTimestamp)
        : "No Data Available";

      return latestDateTime;
    } else {
      return formatDateTime(response[0].datetime);
    }
  });
  const dataCleanup = (data, filterGraph = 5) => {
    if (!data || data.length === 0) return [];

    // Determine time field key (timestamp for 001, date for others)
    const timeKey = data[0].timestamp ? "timestamp" : "date";

    // Determine time cutoff based on filterGraph value
    const now = new Date();
    let cutoff = null;

    switch (filterGraph) {
      case 1: // 1 hour
        cutoff = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        break;
      case 2: // 24 hours
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 3: // 7 days
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 4: // 1 month (30 days)
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 5: // All data
      default:
        cutoff = null;
        break;
    }

    // Filter data (if cutoff exists)
    const filtered = cutoff
      ? data.filter((e) => new Date(e[timeKey]) >= cutoff)
      : data;

    // Map to unified format and reverse for ascending order
    return filtered.sort((a, b) => new Date(a[timeKey]) - new Date(b[timeKey]));
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
            <Button
              text="Details"
              onClick={() => handleDataCellViewOnClick(index, data)}
            />
          </div>
          <p className="text-left text-xs font-light whitespace-nowrap opacity-50">
            {formatDateTime(data.datetime)}
          </p>
        </div>
      );
    } else {
      return (
        <div
          onClick={() => handleDataCellOnClick({ data, index })}
          className={`hover:bg-accent z-50 flex h-fit w-fit min-w-full cursor-pointer flex-col rounded-xl bg-white p-2 px-4 shadow-lg/10 drop-shadow-none transition-all hover:ml-2 hover:text-white`}
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
            <Link href="/" className="ml-1 text-xs font-medium">
              Account Settings
            </Link>
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
            {selectedStationLocation} <br />
            {selectedStationPosition[0]} {selectedStationPosition[1]}
          </p>
        </div>
        <div className="flex-1 items-center justify-center text-center">
          <p className="text-xs font-semibold">Current Time</p>
          <LiveClock />
        </div>
        <div className="flex flex-1 flex-col items-end text-end">
          <StatusIndicator
            className="flex items-end"
            type={lastObserved === "Not Available" ? "unknown" : "active"}
          />
          <div className="mt-1 opacity-50">
            <p className="text-sm font-semibold">Last Observed</p>
            <p className="text-xs font-light">{lastObserved}</p>
          </div>
        </div>
      </TwinFloatingWindow>
    );
  };
  const MainContent = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    } else {
      return (
        <div className="bg-background relative flex h-full w-full flex-col gap-2 p-4">
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
    }
  };
  const GraphOverlay = () => {
    const tphInfo = {
      Sensor: "TPH Sensor BME280",
      "Operating Voltage": "1.71 - 3.6 V",
      "Operating Voltage": "-40 - 85°C",
      "Last Maintenance Check": "2025-01-01",
    };

    const vaneInfo = {
      Sensor: "RS485 Wind Vane",
      "Power Voltage": "7 - 24 V",
      "Measuring Range": "16 directions, 360°",
      "Last Maintenance Check": "2025-01-01",
    };

    const windInfo = {
      Sensor: "RS485 Anemometer",
      "Power Supply": "12V to 24V DC",
      "Operating Temperature:": "-40°C to +80°C",
      "Last Maintenance Check": "2025-01-01",
    };

    const precipInfo = {
      Sensor: "WH-SP-RG Rain Gauge",
      "Operating Temperature:": "-40 ~ + 65 ° C ",
      "Last Maintenance Check": "2025-01-01",
    };

    let info;
    switch (graphParameterInfo.data) {
      case "Temperature":
        info = tphInfo;
        break;
      case "Pressure":
        info = tphInfo;
        break;
      case "Humidity":
        info = tphInfo;
        break;
      case "Precipitation":
        info = precipInfo;
        break;
      case "Wind Speed":
        info = windInfo;
        break;
      case "Wind Direction":
        info = vaneInfo;
        break;
    }

    return (
      <Overlay handleExitClick={() => setIsGraphOverlayDisplayed(false)}>
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold">{graphParameterInfo.data}</p>
          <div className="flex flex-row items-center">
            <div className="">
              <div className="mb-4">
                <>
                  <p className="text-sm font-light">Parameter</p>
                  <p className="text-lg font-medium">
                    {graphParameterInfo.data}
                  </p>
                </>
                <>
                  <p className="text-sm font-light">Unit</p>
                  <p className="text-lg font-medium">
                    {graphParameterInfo.unit}
                  </p>
                </>
                <>
                  <p className="text-sm font-light">Station ID</p>
                  <p className="text-lg font-medium">{selectedStationID}</p>
                </>
                <>
                  <p className="text-sm font-light">Last Observed</p>
                  <p className="text-sm font-medium">
                    {formatDateTime(graphParameterInfo.datetime)}
                  </p>
                </>
              </div>
              {Object.entries(info).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <p className="text-sm font-light">{key}</p>
                  <p className="text-lg font-medium">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <FilterButtons />
              <Graph data={graphData} stationID={selectedStationID} />
            </div>
          </div>
        </div>
      </Overlay>
    );
  };

  return (
    <div className="font-sfpro flex h-svh">
      {isMapOpen && <MapOverlay />}
      <Sidebar />
      {isMainContentDisplayed && <MainContent />}
      {isGraphOverlayDisplayed && <GraphOverlay />}
      <Logos />
    </div>
  );
}
