import React from 'react';
import '../styles/Location.css';

const Location = ({ type, success }) => {
  const titles = {
    city: 'City',
    smallBusiness: 'Small business',
    largeOffice: 'Corporation',
    village: 'Remote village',
    oilRig: 'Oil rig',
  };

  return (
    <div className={`location ${type} ${success ? 'success' : ''}`}>
      <div className="location-circle">
        <div className="circle-border"></div>
        <img src={`${process.env.PUBLIC_URL}/assets/${type}.png`} alt={type} />
      </div>
      <div className={`neon-text ${type}`}>{titles[type]}</div>
    </div>
  );
};

export default Location;