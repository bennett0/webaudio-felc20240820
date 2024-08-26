import React, { useEffect, useRef, useState } from "react";
// Example Process3: process audio with BiQuadFilterNode and ConvolverNode and variable wet/dry mix

const Process3: React.FC = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const convolverNodeRef = useRef<ConvolverNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // Default volume (50%)
  const [frequency, setFrequency] = useState(1000); // Default frequency for the low-pass filter
  const [wetDryMix, setWetDryMix] = useState(0.5); // Default wet/dry mix (50%)

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        volume,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume]);

  useEffect(() => {
    if (filterNodeRef.current) {
      filterNodeRef.current.frequency.setValueAtTime(
        frequency,
        audioCtxRef.current.currentTime
      );
    }
  }, [frequency]);

  useEffect(() => {
    if (wetGainRef.current && dryGainRef.current) {
      wetGainRef.current.gain.setValueAtTime(
        wetDryMix,
        audioCtxRef.current!.currentTime
      );
      dryGainRef.current.gain.setValueAtTime(
        1 - wetDryMix,
        audioCtxRef.current!.currentTime
      );
    }
  }, [wetDryMix]);

  const loadAndPlayAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }

    Promise.all([
      fetch("/src/assets/ooc-drums.wav").then((response) =>
        response.arrayBuffer()
      ),
      fetch("/src/assets/hothall-impulse.wav").then((response) =>
        response.arrayBuffer()
      ),
    ])
      .then(([audioData, irData]) => {
        return Promise.all([
          audioCtxRef.current!.decodeAudioData(audioData),
          audioCtxRef.current!.decodeAudioData(irData),
        ]);
      })
      .then(([audioBuffer, irBuffer]) => {
        sourceRef.current = audioCtxRef.current!.createBufferSource();
        sourceRef.current.buffer = audioBuffer;
        sourceRef.current.loop = true;

        gainNodeRef.current = audioCtxRef.current!.createGain();
        filterNodeRef.current = audioCtxRef.current!.createBiquadFilter();
        convolverNodeRef.current = audioCtxRef.current!.createConvolver();
        wetGainRef.current = audioCtxRef.current!.createGain();
        dryGainRef.current = audioCtxRef.current!.createGain();

        convolverNodeRef.current.buffer = irBuffer; // Set the impulse response buffer

        filterNodeRef.current.type = "lowpass"; // Set filter type to low-pass
        filterNodeRef.current.frequency.setValueAtTime(
          frequency,
          audioCtxRef.current!.currentTime
        ); // Set initial cutoff frequency

        gainNodeRef.current.gain.setValueAtTime(
          volume,
          audioCtxRef.current!.currentTime
        ); // Set initial volume

        wetGainRef.current.gain.setValueAtTime(
          wetDryMix,
          audioCtxRef.current!.currentTime
        ); // Set initial wet gain
        dryGainRef.current.gain.setValueAtTime(
          1 - wetDryMix,
          audioCtxRef.current!.currentTime
        ); // Set initial dry gain

        // Connect nodes: source -> filter -> [dry path -> dryGain] -> gain -> destination
        //                |                       |
        //                |-> convolver -> wetGain-|
        sourceRef.current.connect(filterNodeRef.current);
        filterNodeRef.current
          .connect(dryGainRef.current)
          .connect(gainNodeRef.current)
          .connect(audioCtxRef.current!.destination);
        filterNodeRef.current
          .connect(convolverNodeRef.current)
          .connect(wetGainRef.current)
          .connect(gainNodeRef.current);

        sourceRef.current.start();
        setIsPlaying(true);

        sourceRef.current.onended = () => {
          setIsPlaying(false);
        };
      })
      .catch((error) =>
        console.error("Error loading audio or impulse response:", error)
      );
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
      <br />
      <label>Wet/Dry Mix: </label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={wetDryMix}
        onChange={(e) => setWetDryMix(parseFloat(e.target.value))}
      />
      <span>{Math.round(wetDryMix * 100)}% Wet</span>
    </div>
  );
};

export default Process3;
