import React from "react";

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  className = "",
  min = 0,
  max = 1,
  step = 0.01,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseFloat(e.target.value)]);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={`slider ${className}`} // Add your custom slider styles here
    />
  );
};

export default Slider;
