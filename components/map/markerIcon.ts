import L from "leaflet";

// Leaflet's standaard marker-iconbestanden lossen niet correct op onder
// bundlers zoals Next.js; verwijzen naar de CDN-versie is de gangbare fix.
// Dit bestand raakt `leaflet` aan en mag dus alleen geïmporteerd worden door
// componenten die zelf al achter een dynamic(..., { ssr: false }) zitten.
export const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
