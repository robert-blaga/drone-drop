import React from 'react';
import Location from './Location';
import CreditCard from './CreditCard';
import '../styles/Map.css';

const Map = ({ locations, droppedCards, activeCards, children }) => {
  const locationTypes = ['city', 'smallBusiness', 'largeOffice', 'village', 'oilRig'];

  return (
    <div className="map">
      {locationTypes.map((type) => (
        <Location key={type} type={type} success={locations[type]} />
      ))}
      {activeCards.map((card) => (
        <CreditCard key={card.id} position={card} />
      ))}
      {droppedCards.map((card) => (
        <CreditCard key={card.id} position={card} />
      ))}
      {children}
    </div>
  );
};

export default Map;