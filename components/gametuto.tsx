import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface GameTutorialProps {
  onClose: () => void;
}

const GameTutorial: React.FC<GameTutorialProps> = ({ onClose }) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [canClose, setCanClose] = useState<boolean>(false);

  // Handle countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[51] flex flex-col items-center justify-center">
      {/* Close button, but disabled for 5 seconds */}
      <button
        className={`absolute top-6 right-6 text-gray-300 transition-colors ${
          canClose ? "hover:text-gray-100" : "cursor-not-allowed"
        }`}
        onClick={canClose ? onClose : undefined} // Only close after 5 seconds
        disabled={!canClose}
      >
        <X size={28} />
      </button>

      <div className="bg-black/40 backdrop-blur-md p-8 rounded-xl shadow-lg max-w-[36rem] w-full mx-4 text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">
          Welcome to Cosmic Chicken!
        </h2>

        <ul className="list-none space-y-4 text-gray-300 text-lg">
          <li className="flex items-center space-x-2">
            <span className="font-bold text-white">•</span>
            <span>
              Move your chicken using{" "}
              <span className="font-semibold">WASD</span> or arrow keys
            </span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="font-bold text-white">•</span>
            <span>
              Attack enemies by pressing{" "}
              <span className="font-semibold">Space</span> or{" "}
              <span className="font-semibold">E</span>
            </span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="font-bold text-white">•</span>
            <span>
              Shoot enemies by pressing{" "}
              <span className="font-semibold">Shift </span>
              or
              <span className="font-semibold"> X</span>
            </span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="font-bold text-white">•</span>
            <span>Collect hearts to regain health and stars for power-ups</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="font-bold text-white">•</span>
            <span>
              Use special powers with{" "}
              <span className="font-semibold">1, 2, 3</span> or{" "}
              <span className="font-semibold">Q, F, R</span>
            </span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="font-bold text-white">•</span>
            <span>Survive waves of enemies and achieve the highest score!</span>
          </li>
        </ul>

        {/* Countdown button */}
        <button
          className={`mt-8 px-6 py-3 w-48 rounded-full shadow-lg transition-all duration-300 ${
            canClose
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
          }`}
          onClick={canClose ? onClose : undefined} // Only allow closing after 5 seconds
          disabled={!canClose}
        >
          {canClose ? "Got it!" : `Wait ${countdown}s`}
        </button>
      </div>
    </div>
  );
};

export default GameTutorial;
