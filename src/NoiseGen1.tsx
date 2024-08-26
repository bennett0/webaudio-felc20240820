import React, { useEffect, useRef, useState } from "react";

// Example NoiseGen1: generate audio via AudioBufferSourceNode with generated noise buffers

const NoiseGen1: React.FC = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.05); // Default volume (5%)
  const gainNodeRef = useRef<GainNode | null>(null);
  const [noiseType, setNoiseType] = useState("white"); // Default noise type

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        volume,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume]);

  const generateNoiseBuffer = (type: string): AudioBuffer => {
    const sampleRate = 44100; // Standard sample rate
    const bufferSize = sampleRate * 2.0; // 2 seconds of noise
    const buffer = audioCtxRef.current!.createBuffer(1, bufferSize, sampleRate);
    const output = buffer.getChannelData(0);


    switch (type) {
      case "white":
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        break;
      case "pink": {
        let b0 = 0,
          b1 = 0,
          b2 = 0,
          b3 = 0,
          b4 = 0,
          b5 = 0,
          b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11; // (roughly) compensate for gain
          b6 = white * 0.115926;
        }
        break;
      }
      case "brown": {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // (roughly) compensate for gain
        }
        break;
      }
      default:
        throw new Error("Unknown noise type");
    }

    return buffer;
  };

  const startNoise = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }

    const noiseBuffer = generateNoiseBuffer(noiseType);

    noiseNodeRef.current = audioCtxRef.current.createBufferSource();
    noiseNodeRef.current.buffer = noiseBuffer;
    //noiseNodeRef.current.loop = true; // Loop the noise

    gainNodeRef.current = audioCtxRef.current.createGain();
    gainNodeRef.current.gain.setValueAtTime(
      volume,
      audioCtxRef.current.currentTime
    );

    noiseNodeRef.current
      .connect(gainNodeRef.current)
      .connect(audioCtxRef.current.destination);

    noiseNodeRef.current.start();
    setIsPlaying(true);
  };

  const stopNoise = () => {
    if (noiseNodeRef.current) {
      noiseNodeRef.current.stop();
      noiseNodeRef.current.disconnect();
      noiseNodeRef.current = null;
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <label>Noise Type: </label>
      <select
        value={noiseType}
        onChange={(e) => setNoiseType(e.target.value)}
        disabled={isPlaying}
      >
        <option value="white">White Noise</option>
        <option value="pink">Pink Noise</option>
        <option value="brown">Brown Noise</option>
      </select>
      <br />
      <label>Volume: </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
      />
      <span>{Math.round(volume * 100)}%</span>
      <br />
      <button onClick={startNoise} disabled={isPlaying}>
        Start Noise
      </button>
      <button onClick={stopNoise} disabled={!isPlaying}>
        Stop Noise
      </button>
    </div>
  );
};

export default NoiseGen1;
