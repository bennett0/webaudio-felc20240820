import React, { useEffect, useRef, useState } from "react";
// Example Process1: process audio with GainNode and BiquadFilterNode

const Process1: React.FC = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // Default volume (50%)
  const [frequency, setFrequency] = useState(1000); // Default frequency for the low-pass filter

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        volume,
        audioCtxRef.current!.currentTime
      );
    }
  }, [volume]);

  useEffect(() => {
    if (filterNodeRef.current) {
      filterNodeRef.current.frequency.setValueAtTime(
        frequency,
        audioCtxRef.current!.currentTime
      );
    }
  }, [frequency]);

  const loadAndPlayAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }

    fetch("/src/assets/ooc-drums.wav")
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => audioCtxRef.current!.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        sourceRef.current = audioCtxRef.current!.createBufferSource();
        sourceRef.current.buffer = audioBuffer;

        gainNodeRef.current = audioCtxRef.current!.createGain();
        filterNodeRef.current = audioCtxRef.current!.createBiquadFilter();

        filterNodeRef.current.type = "lowpass"; // Set filter type to low-pass
        filterNodeRef.current.frequency.setValueAtTime(
          frequency,
          audioCtxRef.current!.currentTime
        ); // Set initial cutoff frequency

        gainNodeRef.current.gain.setValueAtTime(
          volume,
          audioCtxRef.current!.currentTime
        ); // Set initial volume

        // Connect nodes: source -> filter -> gain -> destination
        sourceRef.current
          .connect(filterNodeRef.current)
          .connect(gainNodeRef.current)
          .connect(audioCtxRef.current!.destination);

        sourceRef.current.start();
        setIsPlaying(true);

        sourceRef.current.onended = () => {
          setIsPlaying(false);
        };
      })
      .catch((error) => console.error("Error loading audio:", error));
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <button onClick={loadAndPlayAudio} disabled={isPlaying}>
        Play
      </button>
      <button onClick={stopAudio} disabled={!isPlaying}>
        Stop
      </button>
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
      <label>Low-Pass Filter Frequency: </label>
      <input
        type="range"
        min="100"
        max="5000"
        value={frequency}
        onChange={(e) => setFrequency(parseFloat(e.target.value))}
      />
      <span>{frequency} Hz</span>
    </div>
  );
};

export default Process1;
