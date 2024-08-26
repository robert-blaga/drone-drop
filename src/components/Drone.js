import React from 'react';
import '../styles/Drone.css';

const Drone = ({ position }) => {
  return (
    <div className="drone" style={{ left: position.x, top: position.y }}>
      <img src={`${process.env.PUBLIC_URL}/assets/drone.png`} alt="Drone" />
    </div>
  );
};

export default Drone;