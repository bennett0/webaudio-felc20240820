import React, { useRef, useState, useEffect } from 'react';

// Example ToneGen1: tone generator as in ToneGen0 but with realtime controls for frequency, waveform, and volume

const ToneGen1: React.FC = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [frequency, setFrequency] = useState(440); // Default frequency (A4)
    const [waveform, setWaveform] = useState<OscillatorType>('sine'); // Default waveform
    const [volume, setVolume] = useState(0.5); // Default volume (50%)

    useEffect(() => {
        if (oscillatorRef.current && audioCtxRef.current) {
            oscillatorRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime + 1);
        }
    }, [frequency]);

    useEffect(() => {
        if (oscillatorRef.current) {
            oscillatorRef.current.type = waveform;
        }
    }, [waveform]);

    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
        }
    }, [volume]);

    const startTone = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new window.AudioContext();
        }

        oscillatorRef.current = audioCtxRef.current.createOscillator();
        gainNodeRef.current = audioCtxRef.current.createGain();

        oscillatorRef.current.type = waveform; // Set waveform type
        oscillatorRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime); // Set frequency
        gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime); // Set initial volume

        oscillatorRef.current.connect(gainNodeRef.current).connect(audioCtxRef.current.destination); // Connect oscillator -> gain -> destination

        oscillatorRef.current.start(); // Start the oscillator
        setIsPlaying(true);
    };

    const stopTone = () => {
        if (oscillatorRef.current) {
            oscillatorRef.current.stop(); // Stop the oscillator
            oscillatorRef.current.disconnect();
            oscillatorRef.current = null;
            gainNodeRef.current = null;
            setIsPlaying(false);
        }
    };

    return (
        <div>
            <label>Frequency: </label>
            <input
                type="range"
                min="20"
                max="2000"
                value={frequency}
                onChange={(e) => setFrequency(parseFloat(e.target.value))}
            />
            <span>{frequency} Hz</span>
            <br />
            <label>Waveform: </label>
            <select
                value={waveform}
                onChange={(e) => setWaveform(e.target.value as OscillatorType)}
            >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
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
            <button onClick={startTone} disabled={isPlaying}>Start Tone</button>
            <button onClick={stopTone} disabled={!isPlaying}>Stop Tone</button>
        </div>
    );
};

export default ToneGen1;