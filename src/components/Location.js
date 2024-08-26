import React from 'react';
// import SuccessIcon from './SuccessIcon';
import '../styles/Location.css';

const Location = ({ type, success }) => {
  return (
    <div className={`location ${type}`}>
      <div className="location-circle">
        <img src={`${process.env.PUBLIC_URL}/assets/${type}.png`} alt={type} />
      </div>
      {success && (
        <img 
          className="success-icon" 
          src={`${process.env.PUBLIC_URL}/assets/success.png`} 
          alt="Success" 
        />
      )}
    </div>
  );
};

export default Location;