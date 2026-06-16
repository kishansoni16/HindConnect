import React, { useState, useEffect } from 'react';

export default function StatsCounter({ target, duration = 1200, suffix = '', decimals = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = progress * target;
      
      setCount(decimals > 0 ? parseFloat(currentVal.toFixed(decimals)) : Math.floor(currentVal));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [target, duration, decimals]);

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  );
}
