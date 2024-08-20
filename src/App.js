import React, { useState } from 'react';
import SearchBox from './components/SearchBox';
import Map from './components/Map';

const App = () => {
  const [routeGeometry, setRouteGeometry] = useState(null);

  const handleRouteFetched = (geometry) => {
    setRouteGeometry(geometry);
  };

  return (
    <div>
      <SearchBox onRouteFetched={handleRouteFetched} />
      {routeGeometry && <Map routeGeometry={routeGeometry} />}
    </div>
  );
};

export default App;
