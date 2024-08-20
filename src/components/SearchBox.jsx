import React, { useState } from 'react';
import axios from 'axios';

const SearchBox = ({ onRouteFetched }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleFetchRoute = async () => {
    if (!start || !end) {
      console.error('Both start and end locations are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/directions', {
        start: start.trim(),
        end: end.trim()
      });

      const routeGeometry = response.data.coordinates;  // Extract the encoded polyline
      onRouteFetched(routeGeometry);  // Pass the encoded polyline to the parent component
    } catch (error) {
      console.error('Error fetching route:', error.message);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Start location"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />
      <input
        type="text"
        placeholder="End location"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />
      <button onClick={handleFetchRoute}>Get Route</button>
    </div>
  );
};

export default SearchBox;
