import React from 'react';
import '../../background.css';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="plasma-background">
      <div className="plasma-layer-base"></div>
      <div className="plasma-blob plasma-blob-1"></div>
      <div className="plasma-blob plasma-blob-2"></div>
      <div className="plasma-blob plasma-blob-3"></div>
      <div className="plasma-blob plasma-blob-4"></div>
      <div className="plasma-blob plasma-blob-5"></div>
      <div className="plasma-blob plasma-blob-6"></div>
      <div className="plasma-grid"></div>
    </div>
  );
};

export default AnimatedBackground;
