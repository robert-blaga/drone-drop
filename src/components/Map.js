import React from 'react';
import Location from './Location';
import '../styles/Map.css';

const Map = ({ children, locations }) => {
  const locationTypes = ['city', 'smallBusiness', 'largeOffice', 'village', 'oilRig'];

  return (
    <div className="map">
      {locationTypes.map((type) => (
        <Location key={type} type={type} success={locations[type]} />
      ))}
      {children}
    </div>
  );
};

export default Map;