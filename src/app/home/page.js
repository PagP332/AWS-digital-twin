"use client";
import FloatingWindow from "@/components/FloatingWindow";
import LiveClock from "@/components/LiveClock";
import Logos, { PAGASA } from "@/components/Logos";
// import Map from "@/components/Map";
import Overlay from "@/components/Overlay";
import StatusIndicator from "@/components/StatusIndicator";
import {
  CloudSun,
  Settings,
  X,
  Dot,
  TriangleAlert,
  CircleQuestionMark,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Canvas3D from "@/components/Canvas3D";
import Button from "@/components/Button";
import {
  diagnoseData,
  getAlertsList,
  getLatestStationData,
  getOtherData,
  getParameterData,
  modelStatusCheck,
  parameters,
  readAlert,
  setAlertSensor,
  toggleResolveAlert,
} from "@/api/utils.mjs";
import { formatDateTime } from "@/components/formatDate";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/api/route";
import Graph from "@/components/Graph";
import { SyncLoader } from "react-spinners";
import { handlePredictData } from "@/utils/predict";
import Image from "next/image";
import FilterContainer from "@/components/FilterContainer";

export default function Home() {
  // STATES
  const [selectedStationID, setSelectedStationID] = useState(null);
  const [selectedStationPosition, setSelectedStationPosition] = useState([
    0, 0,
  ]);
  const [selectedStationName, setSelectedStationName] = useState("--");
  const [selectedStationLocation, setSelectedStationLocation] = useState("");
  const [stationData, setStationData] = useState([]);
  const [stationOtherData, setStationOtherData] = useState([]);
  const [lastObserved, setLastObserved] = useState("Not Available");

  const [alertsList, setAlertsList] = useState([]);
  const [unreadAlerts, setUnreadAlerts] = useState(false);
  // const [alertsDetailsData, setAlertsDetailsData] = useState(null);
  const [selectedAlertId, setSelectedAlertId] = useState(null);

  const [graphData, setGraphData] = useState([]);
  const [graphDataRef, setGraphDataRef] = useState([]);
  const [graphParameterInfo, setGraphParameterInfo] = useState(null);
  const [filterGraph, setFilterGraph] = useState(5);
  const [fromFilterValue, setFromFilterValue] = useState(new Date());
  const [toFilterValue, setToFilterValue] = useState(new Date());

  const [parameterSelectedIndex, setParameterSelectedIndex] = useState(null);

  const [modelStatus, setModelStatus] = useState(false);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isMainContentDisplayed, setIsMainContentDisplayer] = useState(false);
  const [isGraphOverlayDisplayed, setIsGraphOverlayDisplayed] = useState(false);
  const [isNotificationOverlayDisplayed, setIsNotificationOverlayDisplayed] =
    useState(false);
  const [isNewAlertDisplayed, setIsNewAlertDisplayed] = useState(false);
  const [isAlertsDetailsDisplayed, setIsAlertsDetailsDisplayed] =
    useState(false);
  const [isOtherDataDisplayed, setIsOtherDataDisplayed] = useState(false);
  const [isShowAllCells, setIsShowAllCells] = useState(false);
  const [isInstructionsDisplayed, setIsInstructionsDisplayed] = useState(false);
  const [isFilterWindowDisplayed, setIsFilterWindowDisplayed] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
      case 6:
        parameter = "voltage";
        break;
      case 7:
        parameter = "dht-temp";
        break;
      case 8:
        parameter = "dht-hum";
        break;
    }
    const response = await getParameterData(selectedStationID, parameter);
    // console.log(response);
    setGraphData(response);
    setGraphDataRef(response);
    setGraphParameterInfo(data);
    setIsGraphOverlayDisplayed(true);
  };
  const handleDiagnoseAlert = async (alertID, data) => {
    console.log(`Diagnosing alert id ${alertID}...`);
    try {
      const res = await diagnoseData(data);
      // console.log("Diagnose result: ", res.data.anomalies);
      await setAlertSensor(alertID, res.data.anomalies);
    } catch (e) {
      console.error("Failed to diagnose alert: ", e);
      return;
    }
  };
  const handleOnFilterChange = () => {
    const filteredData = dataCleanup(graphDataRef, filterGraph);
    setGraphData(filteredData);
  }

  // UTILITY
  const getLatestDatetime = useCallback(
    (response) => {
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
    },
    [selectedStationID],
  );
  const toDateObj = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value?.toDate === "function") return value.toDate(); // Firestore Timestamp
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };
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
      case 6:
      default:
        cutoff = null;
        break;
    }

    // // Filter data (if cutoff exists)
    // const filtered = cutoff
    //   ? data.filter((e) => new Date(e[timeKey]) >= cutoff)
    //   : data;

    // // Map to unified format and reverse for ascending order
    // return filtered.sort((a, b) => new Date(a[timeKey]) - new Date(b[timeKey]));
    let start = toDateObj(fromFilterValue);
    let end = toDateObj(toFilterValue);

    if (start && end && start > end) [start, end] = [end, start];

    return data
      .filter((e) => {
        const itemDate = toDateObj(e[timeKey]);
        if (!itemDate) return false;

        // Preset filters for 1-5
        if (filterGraph !== 6) {
          return cutoff ? itemDate >= cutoff : true;
        }

        // Custom date range only for filterGraph = 6
        const inFrom = start ? itemDate >= start : true;
        const inTo = end ? itemDate <= end : true;
        return inFrom && inTo;
      })
      .sort((a, b) => toDateObj(a[timeKey]) - toDateObj(b[timeKey]));
  };
  const uniqueSensors = useMemo(() => {
    const set = new Set();
    (alertsList || []).forEach((a) => {
      if (a?.resolved) return;
      const sensors = Array.isArray(a.sensor) ? a.sensor : [];
      sensors.forEach((s) => {
        if (typeof s === "string" && s.length) set.add(s);
      });
    });
    return Array.from(set); // e.g., ["temperature", "humidity", ...]
  }, [alertsList]);

  // EFFECTS
  useEffect(() => {
    if (selectedStationID) {
      setIsLoading(true);
      const fetchStationData = async () => {
        try {
          const response = await getLatestStationData(selectedStationID);
          const latestTime = await getLatestDatetime(response);
          const otherData = await getOtherData(selectedStationID);

          setStationOtherData(otherData);
          setStationData(response);
          setLastObserved(latestTime);
          if (selectedStationID === "001")
            handlePredictData(response, selectedStationID);
        } catch (err) {
          console.error("Failed to fetch station data: ", err);
        }
      };
      fetchStationData();
      setIsLoading(false);
    }
  }, [selectedStationID, getLatestDatetime]);

  useEffect(() => {
    if (!selectedStationID) return;

    let timeoutId;
    const handleChange = () => {
      setIsUpdating(true);
      clearTimeout(timeoutId); // clear any previous timer
      timeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          console.log("Change detected, Refetching data...");
          const response = await getLatestStationData(selectedStationID);
          const latestTime = await getLatestDatetime(response);
          const otherData = await getOtherData(selectedStationID);

          setStationOtherData(otherData);
          setStationData(response);
          setLastObserved(latestTime);
          if (selectedStationID === "001")
            handlePredictData(response, selectedStationID);
        } catch (err) {
          console.error("Failed to fetch station data: ", err);
        } finally {
          setIsLoading(false);
          setIsUpdating(false);
        }
      }, 5000); // wait 10 seconds before calling refetch
    };

    const initialFlags = new Map();

    const listeners = parameters.map(
      (parameter) => {
        initialFlags.set(parameter, true);
        const colRef = collection(
          db,
          `stations/${selectedStationID}/${parameter}`,
        );

        const q = query(colRef, orderBy("timestamp", "desc"), limit(1));

        return onSnapshot(q, (snapshot) => {
          if (initialFlags.get(parameter)) {
            initialFlags.set(parameter, false);
            return;
          }

          const changed = snapshot
            .docChanges()
            .some(
              (change) =>
                change.type === "added" ||
                change.type === "modified" ||
                change.type === "removed",
            );

          if (changed) {
            handleChange();
          }
        });
      },
      // onSnapshot(
      //   collection(db, `stations/${selectedStationID}/${parameter}`),
      //   (snapshot) => {
      //     snapshot.docChanges().forEach((change) => {
      //       if (
      //         change.type === "modified" ||
      //         change.type === "added" ||
      //         change.type === "removed"
      //       ) {
      //         console.log("Change detected, refetching data");
      //         handleChange();
      //       }
      //     });
      //   },
      // ),
    );

    return () => {
      listeners.forEach((unsub) => unsub());
      clearTimeout(timeoutId);
    };
  }, [selectedStationID, getLatestDatetime]);

  useEffect(() => {
    if (!selectedStationID) return;

    (async () => {
      try {
        const alertRes = await getAlertsList(selectedStationID);
        setAlertsList(alertRes);
        // console.log(alertRes);
      } catch (err) {
        console.error("Failed to fetch alerts: ", err);
      }
    })();
  }, [selectedStationID]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    handleOnFilterChange()
    // console.log(graphData);
  }, [filterGraph, graphDataRef]);

  useEffect(() => {
    let c = false;

    const check = async () => {
      try {
        const res = await modelStatusCheck();
        if (!c) setModelStatus(res);
      } catch (e) {
        console.error("Failed to fetch model status: ", e);
      }
    };

    check();
    const interval = setInterval(check, 10000);

    return () => {
      c = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (unreadAlerts) {
      setIsNewAlertDisplayed(true);
    }
  }, [unreadAlerts]);

  useEffect(() => {
    setUnreadAlerts(alertsList.some((a) => a.read === false));
  }, [alertsList]);

  useEffect(() => {
    const alertsRef = collection(db, "alerts");
    const unsub = onSnapshot(alertsRef, (snap) => {
      const updatedMessages = snap
        .docChanges()
        .filter((c) => c.type !== "removed")
        .map((c) => ({ id: c.doc.id, ...c.doc.data() }));

      if (updatedMessages.length === 0) return;
      // console.log("Alerts updated:", updatedMessages);
      setAlertsList((prev) => {
        const byId = new Map((prev || []).map((a) => [a.id, a]));
        const newItems = [];

        for (const msg of updatedMessages) {
          if (byId.has(msg.id)) {
            byId.set(msg.id, msg); // replace existing
          } else {
            newItems.push(msg); // queue for append
            byId.set(msg.id, msg);
          }
        }

        return [...(prev || []).map((a) => byId.get(a.id)), ...newItems];
      });
    });

    return () => unsub();
  }, []);

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
  const DataCell = ({ data, index, dataContext, details }) => {
    let value, unit, parameter;
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
        parameter = "windSpeed";
        break;
      case 5:
        // console.log("Wind Direction");
        parameter = "windDirection";
        break;
    }

    const isAnomaly = uniqueSensors.includes(parameter);

    if (data.data === "Wind Direction") {
      const windSpeed =
        dataContext.find((d) => d.data === "Wind Speed")?.value || 0;
      // console.log(dataContext);
      // console.log("wind speed for direction: ", windSpeed);
      if (windSpeed === 0) {
        value = "--";
        unit = "";
      } else {
        value = Number(data.value).toFixed(4);
        unit = data.unit;
      }
    } else {
      value = data.value.toFixed(4);
      unit = data.unit;
    }
    if (parameterSelectedIndex === index || isShowAllCells) {
      // console.log("parameter selected");
      return (
        <div
          onClick={() => setParameterSelectedIndex(null)}
          className={`z-50 ml-2 flex h-fit w-fit cursor-pointer flex-col rounded-xl bg-white p-2 px-4 shadow-lg/10 drop-shadow-none`}
        >
          <p
            className={`text-s text-left font-light whitespace-nowrap ${isAnomaly ? "text-red-500" : ""}`}
          >
            {data.data}
          </p>
          {isAnomaly ? (
            <p
              className={`text-left text-xs font-light whitespace-nowrap ${isAnomaly ? "text-red-500" : ""}`}
            >
              Abnormal
            </p>
          ) : (
            <p className={"text-left text-xs font-light whitespace-nowrap"}>
              Normal
            </p>
          )}
          <div className="flex flex-row items-center justify-between gap-10">
            <p
              className={`flex text-left text-xl font-semibold whitespace-nowrap ${isAnomaly ? "text-red-500" : ""}`}
            >
              {value}
              {unit}
            </p>

            {details && (
              <Button
                text="Details"
                onClick={() => handleDataCellViewOnClick(index, data)}
              />
            )}
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
          <p
            className={`text-left text-xs font-light whitespace-nowrap ${isAnomaly ? "text-red-500" : ""}`}
          >
            {data.data}
          </p>
          <p
            className={`text-s text-left font-semibold whitespace-nowrap ${isAnomaly ? "text-red-500" : ""}`}
          >
            {value}
            {unit}
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
    const FilterWindow = () => {
      const [localFromFilterValue, setLocalFromFilterValue] =
        useState(fromFilterValue);
      const [localToFilterValue, setLocalToFilterValue] =
        useState(toFilterValue);

      return (
        <Overlay handleExitClick={() => setIsFilterWindowDisplayed(false)}>
          <div className="items-bg-center mb-2 flex w-full flex-col justify-center gap-0">
            <p className="text-sm font-semibold">Filter data from</p>
            <FilterContainer
              value={localFromFilterValue}
              onChange={setLocalFromFilterValue}
            />
            <p className="text-sm font-semibold">to</p>
            <FilterContainer
              value={localToFilterValue}
              onChange={setLocalToFilterValue}
            />
          </div>
          <Button
            text="Apply"
            onClick={() => {
              setFromFilterValue(localFromFilterValue);
              setToFilterValue(localToFilterValue);
              setIsFilterWindowDisplayed(false);
              if (filterGraph === 6) {
                handleOnFilterChange()
              } else {
                setFilterGraph(6);
              }
            }}
          />
        </Overlay>
      );
    };
    return (
      <div>
        <div className="relative flex justify-end gap-1">
          <Button ind={1} text="1h" onClick={() => setFilterGraph(1)} />
          <Button ind={2} text="24h" onClick={() => setFilterGraph(2)} />
          <Button ind={3} text="7d" onClick={() => setFilterGraph(3)} />
          <Button ind={4} text="1m" onClick={() => setFilterGraph(4)} />
          <Button ind={5} text="ALL" onClick={() => setFilterGraph(5)} />
          <Button
            ind={6}
            text="▼"
            onClick={() => setIsFilterWindowDisplayed((prev) => !prev)}
          />
        </div>
        {isFilterWindowDisplayed && <FilterWindow />}
      </div>
    );
  };
  const AlertButton = () => {
    return (
      <Button
        text={"Alerts"}
        onClick={() => setIsNotificationOverlayDisplayed(true)}
        className={`!text-2xl !font-semibold ${unreadAlerts ? "!bg-accent" : "!bg-white !text-black"}`}
      />
    );
  };
  const Instructions = () => {
    return (
      <Overlay handleExitClick={() => setIsInstructionsDisplayed(false)}>
        <div>
          <Image
            src="/instructions.png"
            alt="instructions"
            width={453}
            height={356}
          />
        </div>
      </Overlay>
    );
  };

  // UI
  const Sidebar = () => {
    return (
      <div className="z-50 flex h-full w-100 flex-col justify-between rounded-r-2xl bg-white p-8 drop-shadow-2xl">
        <div>
          <div className="mb-15 flex items-center justify-center">
            <FloatingWindow className="!bg-background flex-row gap-4 shadow-lg/30 drop-shadow-none">
              <Image
                src="/logo_black.png"
                alt="project awsome logo"
                width={62}
                height={32}
              />
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
          <div className="mb-5 flex flex-row gap-1">
            <p className="text-xs">Model Status: </p>
            {modelStatus ? (
              <p className="text-xs text-[#24A148]"> Active</p>
            ) : (
              <p className="text-xs text-[#DA1E28]"> Inactive</p>
            )}
          </div>
          <SidebarTabs>
            <Settings size={14} />
            <Link href="/" className="ml-1 text-xs font-medium">
              Account Settings
            </Link>
          </SidebarTabs>
          <div className="flex flex-col gap-1">
            <p className="mt-4 mb-2 text-xs opacity-50">LEARN MORE</p>
            <Link
              className="w-fit text-xs font-medium"
              target="_blank"
              href="https://aws-instruction.appwrite.network/#about"
            >
              About Us
            </Link>
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
          return (
            <DataCell
              key={index}
              data={data}
              index={index}
              dataContext={stationData}
              details={true}
            />
          );
        })}
        <div
          onClick={() => setIsOtherDataDisplayed((prev) => !prev)}
          className={`hover:bg-accent z-50 my-3 flex h-fit w-fit min-w-full cursor-pointer flex-col rounded-xl bg-white p-2 px-4 shadow-lg/10 drop-shadow-none transition-all hover:ml-2 hover:text-white`}
        >
          <p className="text-center text-xs font-light whitespace-nowrap">
            Other Data
          </p>
        </div>
        {isOtherDataDisplayed &&
          stationOtherData.map((data, index) => {
            return (
              <DataCell
                key={index + 6}
                data={data}
                index={index + 6}
                dataContext={stationOtherData}
                details={true}
              />
            );
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
          <p className="text-sm font-light">Last Observed</p>
          <p className="text-2xl font-semibold">{lastObserved}</p>
          <div
            className="cursor-pointer"
            onClick={() => setIsInstructionsDisplayed(true)}
          >
            <CircleQuestionMark size={18} className="inline-block opacity-50" />
          </div>
        </div>
        <div className="flex flex-1 flex-col items-end text-end">
          <StatusIndicator
            className="flex items-end"
            type={lastObserved === "Not Available" ? "unknown" : "active"}
          />
          <div className="mt-1 opacity-50">
            <p className="text-xs font-semibold">Current Time</p>
            <LiveClock />
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
              stationID={selectedStationID}
              sensors={uniqueSensors}
            />
          </div>
          {isUpdating && (
            <div className="absolute bottom-5 left-5 z-80 inline-flex items-center gap-2">
              <SyncLoader color="#514fbc" size={5} />
              <p className="text-sm font-semibold text-[#514fbc]">
                Updating...
              </p>
            </div>
          )}
          <div className="absolute top-50 right-5 z-80 inline-flex flex-col items-center gap-2">
            <div className="relative">
              {unreadAlerts && (
                <span className="absolute -top-8 -left-10 z-1">
                  <Dot size={80} color="red" />
                </span>
              )}
              <AlertButton />
            </div>
            <Button
              text="Show All"
              className={"!border-2"}
              onClick={() => setIsShowAllCells((prev) => !prev)}
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
      "Operating Temperature": "-40 - 85°C",
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

    const voltageInfo = {
      Sensor: "MLE00960 Voltage Detection Sensor Module 25V",
      "Input Voltage range": "DC0 to 25 V",
      "Voltage detection range:": "DC 0.02445 V to 25 V",
      "Last Maintenance Check": "2025-01-01",
    };

    const dhtInfo = {
      Sensor: "DHT22",
      "Operating Voltage": "3 to 5V power",
      "Humidity Readings": "Good for 0-100% with 2-5% accuracy",
      "Temperature Readings": "Good for -40 to 80°C with ±0.5°C accuracy",
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
      case "Battery Voltage":
        info = voltageInfo;
        break;
      case "Internal Temperature":
        info = dhtInfo;
        break;
      case "Internal Humidity":
        info = dhtInfo;
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
  const NotificationsOverlay = () => {
    const NotificationTab = ({ alert, index }) => {
      // console.log(alert);
      const { id, data, read, type, resolved, sensor, station_id, timestamp } =
        alert;

      const handleDetailsClick = async () => {
        await readAlert(id, read);
        setSelectedAlertId(id);
        setIsAlertsDetailsDisplayed(true);
      };

      return (
        <div
          className={`relative flex flex-col items-start justify-center gap-2 rounded-lg bg-gray-200 p-3 transition-all hover:mr-3 hover:bg-gray-300 ${!read ? "ml-3" : ""}`}
        >
          {!read ? (
            <span className="absolute -top-9 -right-9">
              <Dot size={80} color="red" />
            </span>
          ) : null}
          <div className="z-1 flex flex-row items-center justify-between">
            <TriangleAlert size={20} color="#514fbc" />
            <p className="text-accent mr-10 ml-2 text-xl font-semibold">
              Abnormal Behavior Detected
            </p>
            <Button text="Details" onClick={handleDetailsClick} />
          </div>
          <div className="flex flex-row gap-5">
            <p className="text-sm font-light">{`Station #${station_id}`}</p>
            <p className="text-sm font-light">{timestamp}</p>
          </div>
        </div>
      );
    };
    const AlertTab = () => {
      const alertDetailsData = alertsList.find((a) => a.id === selectedAlertId);
      if (!alertDetailsData) return null;
      const { id, data, resolved, station_id, timestamp, sensor } =
        alertDetailsData;

      return (
        <div>
          <FloatingWindow>
            <p className="text-xl font-semibold">Alert</p>
            <div>
              <div className="z-1 flex flex-row items-center justify-between">
                <TriangleAlert size={20} color="#514fbc" />
                <p className="text-accent mr-10 ml-2 text-xl font-semibold">
                  Abnormal Behavior Detected
                </p>
              </div>
              <p className="font-light">{`Station #${station_id}`}</p>
              <p className="font-light">{timestamp}</p>
              <div className="flex items-center justify-between">
                <p className="font-light opacity-50">
                  {resolved ? "Resolved" : "Unresolved"}
                </p>
                <Button
                  text="Resolve"
                  onClick={() => toggleResolveAlert(id, resolved)}
                />
              </div>
              <div className="mt-8 mb-4 flex flex-col gap-2">
                <div
                  className={`gap-1 ${sensor.includes("precipitation") ? "font-bold text-[#DA1E28]" : ""}`}
                >
                  <p className="font-light">Precipitation</p>
                  <p className="text-lg font-medium">
                    {data.precipitation === 999999 ? "--" : data.precipitation}
                  </p>
                </div>
                <div
                  className={`gap-1 ${sensor.includes("temperature") ? "font-bold text-[#DA1E28]" : ""}`}
                >
                  <p className="font-light">Temperature</p>
                  <p className="text-lg font-medium">
                    {data.temperature === 999999 ? "--" : data.temperature}
                  </p>
                </div>
                <div
                  className={`gap-1 ${sensor.includes("humidity") ? "font-bold text-[#DA1E28]" : ""}`}
                >
                  <p className="font-light">Humidity</p>
                  <p className="text-lg font-medium">
                    {data.humidity === 999999 ? "--" : data.humidity}
                  </p>
                </div>
                <div
                  className={`gap-1 ${sensor.includes("pressure") ? "font-bold text-[#DA1E28]" : ""}`}
                >
                  <p className="font-light">Pressure</p>
                  <p className="text-lg font-medium">
                    {data.pressure === 999999 ? "--" : data.pressure}
                  </p>
                </div>
                <div
                  className={`gap-1 ${sensor.includes("windSpeed") ? "font-bold text-[#DA1E28]" : ""}`}
                >
                  <p className="font-light">Wind Speed</p>
                  <p className="text-lg font-medium">
                    {data.windSpeed === 999999 ? "--" : data.windSpeed}
                  </p>
                </div>
                <div
                  className={`gap-1 ${sensor.includes("windDirection") ? "font-bold text-[#DA1E28]" : ""}`}
                >
                  <p className="font-light">Wind Direction</p>
                  <p className="text-lg font-medium">
                    {data.windDirection === 999999 ? "--" : data.windDirection}
                  </p>
                </div>
              </div>
              <div className="flex justify-stretch">
                <Button
                  text="Diagnose"
                  onClick={() => handleDiagnoseAlert(id, data)}
                />
              </div>
            </div>
          </FloatingWindow>
        </div>
      );
    };
    const CustomOverlay = ({ children, handleExitClick }) => {
      return (
        <div
          className="fixed top-0 left-0 z-100 h-full w-full bg-black/50 p-4"
          onClick={handleExitClick}
        >
          <button
            className="fixed top-4 right-4 cursor-pointer"
            onClick={handleExitClick}
          >
            <X size={32} color={"white"} />
          </button>
          <div
            className={"z-50 mr-30 flex items-start justify-end gap-5"}
            onClick={(e) => e.stopPropagation()}
          >
            {isAlertsDetailsDisplayed && <AlertTab />}
            <FloatingWindow>{children}</FloatingWindow>
          </div>
        </div>
      );
    };
    return (
      <CustomOverlay
        handleExitClick={() => setIsNotificationOverlayDisplayed(false)}
      >
        <div className="-my-10 flex h-lvh w-full flex-col items-center justify-start gap-2 p-5">
          <p className="my-5 text-xl font-bold">Notifications</p>
          <div className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto px-5 pb-5">
            {alertsList.length !== 0 ? (
              alertsList.map((alert) => (
                <NotificationTab key={alert.id} alert={alert} />
              ))
            ) : (
              <p className="font-light opacity-50">
                You currently have no alerts
              </p>
            )}
          </div>
        </div>
      </CustomOverlay>
    );
  };
  const AlertNotification = () => {
    return (
      <Overlay handleExitClick={() => setIsNewAlertDisplayed(false)}>
        <div className="flex flex-col items-center justify-center">
          <p>Abnormal behaviour detected, please check for new alerts</p>
          <Button text="OK" onClick={() => setIsNewAlertDisplayed(false)} />
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
      {isNotificationOverlayDisplayed && <NotificationsOverlay />}
      {isNewAlertDisplayed && <AlertNotification />}
      {isInstructionsDisplayed && <Instructions />}
      <Logos />
    </div>
  );
}
