'use client';
import React from 'react';

const VideOne = () => {
  
  return (
    <div className="tp-hero-bottom-img-wrap">
      <div className="tp-hero-bottom-img">
        <video loop={true} muted={true} autoPlay={true} playsInline={true}>
          <source src="https://html.aqlova.com/videos/liko/liko.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default VideOne;