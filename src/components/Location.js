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
    <div className={`location ${type}`}>
      <div className="location-circle">
        {/* Existing SVG or other content */}
        <img src={`${process.env.PUBLIC_URL}/assets/${type}.png`} alt={type} />
      </div>
      <div className={`neon-text ${type}`}>{titles[type]}</div> {/* Changed from <a> to <div> */}
    </div>
  );
};

export default Location;