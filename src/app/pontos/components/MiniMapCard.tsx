// src/app/pontos/components/MiniMapCard.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

// IMPORT DINÁMICO para evitar SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);

type Props = {
  lat: number;
  lon: number;
};

export default function MiniMapCard({ lat, lon }: Props) {
  const [pinIcon, setPinIcon] = useState<any | null>(null);

  // Cargar ícono solo en el cliente
  useEffect(() => {
    async function loadIcon() {
      const L = await import("leaflet");

      const icon = L.icon({
        iconUrl: "/pin.svg",
        iconRetinaUrl: "/pin.svg",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      setPinIcon(icon);
    }

    loadIcon();
  }, []);

  // Mientras no cargó el ícono → placeholder
  if (!pinIcon) {
    return (
      <div className="h-32 w-full rounded-xl border border-zinc-800 bg-zinc-900/40" />
    );
  }

  return (
    <div className="h-32 w-full rounded-xl overflow-hidden border border-zinc-800">
      <MapContainer
        center={[lat, lon]}
        zoom={16}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 👇 Ahora SI usamos tu pin */}
        <Marker position={[lat, lon]} icon={pinIcon} />
      </MapContainer>
    </div>
  );
}
