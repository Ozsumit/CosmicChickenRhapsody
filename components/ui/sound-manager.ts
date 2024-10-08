class SoundManager {
  private context: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer } = {};
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      // Initialize AudioContext only in the browser
      this.context = new (window.AudioContext || // eslint-disable-next-line
        (window as any).webkitAudioContext)();
      this.bgmGainNode = this.context.createGain();
      this.sfxGainNode = this.context.createGain();

      // Connect the gain nodes to the context's destination
      this.bgmGainNode.connect(this.context.destination);
      this.sfxGainNode.connect(this.context.destination);
    }
  }

  async loadSound(name: string, url: string) {
    if (!this.context) return; // Ensure context exists before proceeding
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.sounds[name] = audioBuffer;
  }

  playSound(name: string) {
    if (!this.context || !this.sounds[name]) return;
    const source = this.context.createBufferSource();
    source.buffer = this.sounds[name];
    source.connect(this.sfxGainNode!);
    source.start();
  }

  playBGM(name: string) {
    if (!this.context || !this.sounds[name]) return;
    this.stopBGM();
    this.bgmSource = this.context.createBufferSource();
    this.bgmSource.buffer = this.sounds[name];
    this.bgmSource.loop = true;
    this.bgmSource.connect(this.bgmGainNode!);
    this.bgmSource.start();
  }

  stopBGM() {
    if (this.bgmSource) {
      this.bgmSource.stop();
      this.bgmSource = null;
    }
  }

  setBGMVolume(volume: number) {
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.setValueAtTime(volume, this.context!.currentTime);
    }
  }

  setSFXVolume(volume: number) {
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.setValueAtTime(volume, this.context!.currentTime);
    }
  }
}

export const soundManager =
  typeof window !== "undefined" ? new SoundManager() : null;
