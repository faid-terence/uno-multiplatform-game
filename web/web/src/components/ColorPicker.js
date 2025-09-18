import React from 'react';
import { COLORS } from '../constants/gameConstants';

const ColorPicker = ({ onSelectColor, onClose }) => {
  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <div className="color-picker">
        <h3>Choose a color</h3>
        <div className="color-options">
          {COLORS.map(color => (
            <div
              key={color}
              className={`color-option ${color.toLowerCase()}`}
              onClick={() => onSelectColor(color)}
              style={{ background: color.toLowerCase() }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ColorPicker;