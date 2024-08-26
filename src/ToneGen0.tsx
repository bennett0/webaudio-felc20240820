import React, { useRef, useState } from 'react';

// Example ToneGen0: very basic tone generator with OscillatorNode

const ToneGen0: React.FC = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [frequency, setFrequency] = useState(440); // Default frequency (A4)
    const [waveform, setWaveform] = useState<OscillatorType>('sine'); // Default waveform

    const startTone = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new window.AudioContext();
        }
        oscillatorRef.current = audioCtxRef.current.createOscillator();
        oscillatorRef.current.type = waveform; // Set waveform type
        oscillatorRef.current.frequency.setValueAtTime(frequency, audioCtxRef.current.currentTime); // Set frequency
        oscillatorRef.current.connect(audioCtxRef.current.destination); // Connect to output
        oscillatorRef.current.start(); // Start the oscillator
        setIsPlaying(true);
    };

    const stopTone = () => {
        if (oscillatorRef.current) {
            oscillatorRef.current.stop(); // Stop the oscillator
            oscillatorRef.current.disconnect();
            oscillatorRef.current = null;
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
                disabled={isPlaying}
            />
            <span>{frequency} Hz</span>
            <br />
            <label>Waveform: </label>
            <select
                value={waveform}
                onChange={(e) => setWaveform(e.target.value as OscillatorType)}
                disabled={isPlaying}
            >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
            </select>
            <br />
            <button onClick={startTone} disabled={isPlaying}>Start Tone</button>
            <button onClick={stopTone} disabled={!isPlaying}>Stop Tone</button>
        </div>
    );
};

export default ToneGen0;