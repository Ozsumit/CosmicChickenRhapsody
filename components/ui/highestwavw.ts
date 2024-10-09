import { useState, useEffect } from "react";

const safeParseInt = (value: string | null, fallback: number): number => {
    if (value === null) return fallback;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  };
  
  export const useHighestWave = (initialWave: number = 0) => {
    const [highestWave, setHighestWave] = useState(initialWave);
  
    useEffect(() => {
      // Load the highest wave from localStorage
      const savedHighestWave = safeParseInt(localStorage.getItem('highestWave'), initialWave);
      setHighestWave(savedHighestWave);
    }, [initialWave]);
  
    const updateHighestWave = (currentWave: number) => {
      if (currentWave > highestWave) {
        setHighestWave(currentWave);
        localStorage.setItem('highestWave', currentWave.toString());
      }
    };
  
    return { highestWave, updateHighestWave };
  };