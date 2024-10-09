import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/buttonmsp";
import Slider from "./slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from "./dialog";

interface SoundSettingsProps {
  soundManager: {
    setBGMVolume: (volume: number) => void;
    setSFXVolume: (volume: number) => void;
  };
}

const SoundSettings: React.FC<SoundSettingsProps> = ({ soundManager }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Function to handle opening/closing with the "O" key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "O" || event.key === "o") {
        setIsOpen((prev) => !prev); // Toggle open/close with "O"
      }

      // Toggle mute with the "M" key
      if (event.key === "M" || event.key === "m") {
        toggleMute(); // Toggle mute/unmute
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Update soundManager volumes and mute state
  useEffect(() => {
    if (soundManager) {
      soundManager.setBGMVolume(isMuted ? 0 : bgmVolume);
      soundManager.setSFXVolume(isMuted ? 0 : sfxVolume);
    }
  }, [bgmVolume, sfxVolume, isMuted, soundManager]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <div>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sound Settings</DialogTitle>
          </DialogHeader>

          {/* BGM Volume Slider */}
          <div className="flex items-center justify-between text-white">
            <label>BGM Volume</label>
            <Slider
              value={[bgmVolume]}
              onValueChange={(value) => setBgmVolume(value[0])}
              max={1}
              step={0.01}
              className="w-[60%]"
            />
          </div>

          {/* SFX Volume Slider */}
          <div className="flex items-center justify-between">
            <label>SFX Volume</label>
            <Slider
              value={[sfxVolume]}
              onValueChange={(value) => setSfxVolume(value[0])}
              max={1}
              step={0.01}
              className="w-[60%] "
            />
          </div>

          {/* Mute Toggle */}
          <Button onClick={toggleMute} className="mt-4">
            {isMuted ? (
              <VolumeX className="mr-2" />
            ) : (
              <Volume2 className="mr-2" />
            )}
            {isMuted ? "Unmute" : "Mute"}
          </Button>
        </DialogContent>
      </Dialog>
      {/* <Button onClick={() => setIsOpen(true)} className="text-white">
        Open Sound Settings
      </Button> */}
    </div>
  );
};

export default SoundSettings;
