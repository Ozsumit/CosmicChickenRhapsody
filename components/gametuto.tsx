import React from "react";
import { X } from "lucide-react";

interface GameTutorialProps {
  onClose: () => void;
}

const GameTutorial: React.FC<GameTutorialProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/80 text-white p-4 z-50 flex flex-col items-center justify-center">
      <button className="absolute top-4 right-4 text-white" onClick={onClose}>
        <X size={24} />
      </button>
      <h2 className="text-2xl font-bold mb-4">Welcome to Cosmic Chicken!</h2>
      <ul className="list-disc list-inside space-y-2 max-w-md">
        <li>Move your chicken using WASD or arrow keys</li>
        <li>Attack enemies by pressing Space or E</li>
        <li>Collect hearts to regain health and stars for power-ups</li>
        <li>Use special powers with 1, 2, 3 or Q, F, R keys</li>
        <li>Survive waves of enemies and achieve the highest score!</li>
      </ul>
      <button
        className="mt-8 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition"
        onClick={onClose}
      >
        Got it!
      </button>
    </div>
  );
};

export default GameTutorial;
