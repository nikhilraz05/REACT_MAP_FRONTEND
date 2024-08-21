import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import startIcons from '../assets/start.png';
import endIcons from '../assets/end.jpeg';
import bikeIconImage from '../assets/bike1.jpg'; // Add your bike icon image here

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

const startIcon = new L.Icon({
  iconUrl: startIcons,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const endIcon = new L.Icon({
  iconUrl: endIcons,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const bikeIcon = new L.Icon({
  iconUrl: bikeIconImage,
  iconSize: [10, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

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

const Map = ({ routeGeometry }) => {
  const [markers, setMarkers] = useState([]);
  const [polylinePositions, setPolylinePositions] = useState([]);
  const [bikePosition, setBikePosition] = useState(null);

  useEffect(() => {
    if (routeGeometry) {
      const coordinates = decodePolyline(routeGeometry);
      setPolylinePositions(coordinates);
      setMarkers([coordinates[0], coordinates[coordinates.length - 1]]);
      setBikePosition(coordinates[0]); // Initially place the bike at the start
    }
  }, [routeGeometry]);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('bikeLocationUpdate', (location) => {
      setBikePosition([location.lat, location.lon]);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <MapContainer center={bikePosition || [51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
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
          <Marker position={markers[0]} icon={startIcon}>
            <Popup>Start Location</Popup>
          </Marker>
          <Marker position={markers[1]} icon={endIcon}>
            <Popup>End Location</Popup>
          </Marker>
        </>
      )}
      {bikePosition && (
        <Marker position={bikePosition} icon={bikeIcon}>
          <Popup>Bike Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;
