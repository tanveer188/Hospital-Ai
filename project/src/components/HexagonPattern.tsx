import React from 'react';

type HexagonPatternProps = {
  className?: string;
};

const HexagonPattern: React.FC<HexagonPatternProps> = ({ className }) => {
  return (
    <div className={className}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(0.5) rotate(0)">
            <path d="M25,3.4 L44.4,15 L44.4,38.4 L25,50 L5.6,38.4 L5.6,15 L25,3.4 z" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  className="text-blue-400"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  );
};

export default HexagonPattern;