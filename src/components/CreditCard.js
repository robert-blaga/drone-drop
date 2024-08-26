import React from 'react';
import '../styles/CreditCard.css';

const CreditCard = ({ position }) => {
  if (!position) {
    return null;
  }

  return (
    <div className="credit-card" style={{ left: position.x, top: position.y }}>
      <img src={`${process.env.PUBLIC_URL}/assets/creditCard.png`} alt="Credit Card" />
    </div>
  );
};

export default CreditCard;