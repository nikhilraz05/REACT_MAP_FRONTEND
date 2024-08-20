import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Function to decode polyline encoded string
const decodePolyline = (encoded) => {
  let points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
};

// Function to reverse geocode coordinates
const reverseGeocode = async (lat, lon) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await response.json();
    return data.display_name;
  } catch (error) {
    console.error("Error fetching place name:", error);
    return "Unknown Location";
  }
};

// Component to fit map bounds to polyline
const FitBoundsToPolyline = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = positions.map(coord => [coord[0], coord[1]]);
      map.fitBounds(bounds);
    }
  }, [positions, map]);

  return null;
};

// Custom green marker icons
const greenIcon = new L.Icon({
  iconUrl: 'https://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=glyphish_location|4CAF50',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const Map = ({ routeGeometry }) => {
  const [places, setPlaces] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [polylinePositions, setPolylinePositions] = useState([]);

  useEffect(() => {
    if (routeGeometry) {
      // Decode the polyline string to get the coordinates
      const coordinates = decodePolyline(routeGeometry);
      setPolylinePositions(coordinates);  // Set the entire polyline path

      // Fetch start and end places
      const fetchPlaces = async () => {
        const startPlace = await reverseGeocode(coordinates[0][0], coordinates[0][1]);
        const endPlace = await reverseGeocode(coordinates[coordinates.length - 1][0], coordinates[coordinates.length - 1][1]);
        setPlaces([startPlace, endPlace]);

        // Set markers at the start and end coordinates
        setMarkers([coordinates[0], coordinates[coordinates.length - 1]]);
      };

      fetchPlaces();
    }
  }, [routeGeometry]);

  return (
    <MapContainer center={markers[0] || [51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {polylinePositions.length > 1 && (
        <>
          <FitBoundsToPolyline positions={polylinePositions} />
          <Polyline
            positions={polylinePositions}
            color="red"
            weight={5}
            opacity={0.7}
          />
        </>
      )}
      {markers.length === 2 && (
        <>
          <Marker position={markers[0]} icon={greenIcon}>
            <Popup>{places[0] || 'Start Location'}</Popup>
          </Marker>
          <Marker position={markers[1]} icon={greenIcon}>
            <Popup>{places[1] || 'End Location'}</Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
};

export default Map;
