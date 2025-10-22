"use client";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import FloatingWindow from "./FloatingWindow";
import { CloudSun } from "lucide-react";
import Button from "./Button";
import { getStationsList } from "@/api/utils.mjs";
// import fs from "fs";

export default function Map({ handleSelectStation }) {
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const orangeIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const defaultIcon = new L.Icon.Default();

  useEffect(() => {
    const fallbackFunction = () => {
      fetch("/stations.json") // file located in /public/aws_stations.json
        .then((res) => res.json())
        .then((data) => {
          const formatted = data.map((station) => ({
            id: station.site_id,
            position: station.coordinates,
            stationName: station.site_name,
            location: station.location || "Location Not Available",
          }));
          setStations(formatted);
        })
        .catch(console.error);
    };

    const asyncFunction = async () => {
      setIsLoading(true);
      try {
        const stationData = await getStationsList();

        const formatted = stationData.map((station) => ({
          id: station.id,
          position: station.coordinates,
          stationName: station.site_name,
          location: station.location || "Location Not Available",
        }));
        setStations(formatted);
      } catch (err) {
        console.error("Could not fetch station list: ", err);
        fallbackFunction();
      }
      setIsLoading(false);
    };

    asyncFunction();
  }, []);

  const onMarkerView = (marker) => {
    console.log("Marker Clicked");
    handleSelectStation(
      marker.id,
      marker.position,
      marker.stationName,
      marker.location,
    );
  };

  const MapMarkers = () => {
    return stations.map((marker, idx) => {
      const icon = marker.id === "001" ? orangeIcon : defaultIcon;

      return (
        <Marker key={idx} position={marker.position} icon={icon}>
          <Popup className="relative">
            <div className="bg-background border-border font-sfpro absolute -top-14 left-0 z-100 w-60 rounded-xl border-1 p-4 text-black">
              <div className="space-y-1">
                <div className="flex flex-row items-center gap-2">
                  <CloudSun size={22} />
                  <p className="ml-5 font-medium">{marker.stationName}</p>
                </div>
                <p className="text-xs font-light">
                  {`${marker.position[0]}, ${marker.position[1]}`}
                </p>
                <p className="font-light">{marker.location}</p>
              </div>
              <div className="flex justify-center">
                <Button
                  text="View"
                  onClick={() => onMarkerView(marker)}
                  className="!bg-accent"
                />
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  } else {
    return (
      <MapContainer
        center={[14.614, 121.0608]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapMarkers />
      </MapContainer>
    );
  }
}
