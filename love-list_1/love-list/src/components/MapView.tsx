"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { BucketListItem } from "@/types";

// A custom emoji marker, sidestepping Leaflet's classic broken-default-icon
// bundler issue entirely (we never touch L.Icon.Default).
const heartIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:26px;line-height:26px;filter:drop-shadow(0 2px 3px rgba(58,42,52,0.35))">💗</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 24],
  popupAnchor: [0, -22],
});

export function MapView({ items }: { items: BucketListItem[] }) {
  const pins = items.filter(
    (i): i is BucketListItem & { latitude: number; longitude: number } =>
      i.status === "completed" && i.latitude != null && i.longitude != null
  );

  const center: [number, number] =
    pins.length > 0 ? [pins[0].latitude, pins[0].longitude] : [20, 0];

  return (
    <MapContainer
      center={center}
      zoom={pins.length > 0 ? 5 : 2}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((item) => (
        <Marker
          key={item.id}
          position={[item.latitude, item.longitude]}
          icon={heartIcon}
        >
          <Popup>
            <strong>{item.title}</strong>
            {item.location_name && (
              <>
                <br />
                {item.location_name}
              </>
            )}
            {item.completed_at && (
              <>
                <br />
                {new Date(item.completed_at).toLocaleDateString()}
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
