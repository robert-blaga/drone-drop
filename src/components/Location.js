import React from 'react';
// import SuccessIcon from './SuccessIcon';
import '../styles/Location.css';

const Location = ({ type, success }) => {
  return (
    <div className={`location ${type}`}>
      <div className={`location-circle ${success ? 'success' : ''}`}>
        <img src={`${process.env.PUBLIC_URL}/assets/${type}.png`} alt={type} />
      </div>
    </div>
  );
};

export default Location;