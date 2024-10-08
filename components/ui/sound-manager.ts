class SoundManager {
  private context: AudioContext;
  private sounds: { [key: string]: AudioBuffer } = {};
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmGainNode: GainNode; // For controlling BGM volume
  private sfxGainNode: GainNode; // For controlling SFX volume

  constructor() {
    this.context = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.bgmGainNode = this.context.createGain(); // Gain node for BGM
    this.sfxGainNode = this.context.createGain(); // Gain node for SFX

    // Connect the gain nodes to the context's destination
    this.bgmGainNode.connect(this.context.destination);
    this.sfxGainNode.connect(this.context.destination);
  }

  async loadSound(name: string, url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.sounds[name] = audioBuffer;
  }

  playSound(name: string) {
    if (this.sounds[name]) {
      const source = this.context.createBufferSource();
      source.buffer = this.sounds[name];
      // Connect to the sfx gain node instead of directly to the destination
      source.connect(this.sfxGainNode);
      source.start();
    }
  }

  playBGM(name: string) {
    if (this.sounds[name]) {
      this.stopBGM();
      this.bgmSource = this.context.createBufferSource();
      this.bgmSource.buffer = this.sounds[name];
      this.bgmSource.loop = true;
      // Connect to the BGM gain node instead of directly to the destination
      this.bgmSource.connect(this.bgmGainNode);
      this.bgmSource.start();
    }
  }

  stopBGM() {
    if (this.bgmSource) {
      this.bgmSource.stop();
      this.bgmSource = null;
    }
  }

  // Method to set the BGM volume
  setBGMVolume(volume: number) {
    this.bgmGainNode.gain.setValueAtTime(volume, this.context.currentTime);
  }

  // Method to set the SFX volume
  setSFXVolume(volume: number) {
    this.sfxGainNode.gain.setValueAtTime(volume, this.context.currentTime);
  }
}

export const soundManager = new SoundManager();
