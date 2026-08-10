"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

export default function GoogleAddressMap({ onPlaceSelected }) {
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) throw new Error("Falta la clave de Google Maps");

        setOptions({ key: apiKey, v: "weekly", language: "es", region: "CL" });

        const [{ Map }, { PlaceAutocompleteElement }] = await Promise.all([
          importLibrary("maps"),
          importLibrary("places"),
        ]);

        if (!active || !mapRef.current || !autocompleteRef.current) return;

        const map = new Map(mapRef.current, {
          center: { lat: -35.4264, lng: -71.6554 },
          zoom: 7,
          mapTypeControl: true,
          streetViewControl: false,
        });

        const autocomplete = new PlaceAutocompleteElement();
        autocomplete.placeholder = "Busca una dirección o lugar en Chile";
        autocomplete.includedRegionCodes = ["cl"];
        autocomplete.style.width = "100%";
        autocompleteRef.current.replaceChildren(autocomplete);

        autocomplete.addEventListener("gmp-select", async (event) => {
          const place = event.placePrediction.toPlace();

          await place.fetchFields({
            fields: ["id", "displayName", "formattedAddress", "location"],
          });

          if (!place.location) return;

          const latitud = place.location.lat();
          const longitud = place.location.lng();

          markerRef.current?.setMap(null);
          markerRef.current = new google.maps.Marker({
            map,
            position: { lat: latitud, lng: longitud },
            draggable: true,
          });

          map.panTo({ lat: latitud, lng: longitud });
          map.setZoom(16);

          onPlaceSelected({
            direccion: place.formattedAddress || place.displayName || "",
            latitud,
            longitud,
            google_place_id: place.id || null,
          });

          markerRef.current.addListener("dragend", () => {
            const position = markerRef.current.getPosition();
            if (!position) return;

            onPlaceSelected({
              direccion: place.formattedAddress || place.displayName || "",
              latitud: position.lat(),
              longitud: position.lng(),
              google_place_id: place.id || null,
            });
          });
        });
      } catch (err) {
        console.error(err);
        if (active) {
          setError("No se pudo cargar Google Maps. Revisa la clave y las APIs habilitadas.");
        }
      }
    }

    init();

    return () => {
      active = false;
      markerRef.current?.setMap(null);
    };
  }, [onPlaceSelected]);

  return (
    <div>
      <div ref={autocompleteRef} style={{ minHeight: 56, padding: 6, border: "1px solid #d6d8d3", borderRadius: 12, background: "#fff" }} />
      <div ref={mapRef} style={{ width: "100%", height: 360, marginTop: 14, borderRadius: 16, overflow: "hidden", background: "#e8ece9" }} />
      {error && <p style={{ padding: 12, borderRadius: 10, background: "#fff1f0", color: "#a1271b" }}>{error}</p>}
    </div>
  );
}