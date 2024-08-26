import React, { useState, useEffect, useRef } from 'react';

// Example Audio1: Basic playback with AudioContext using BufferSourceNode (with a decoded AudioBuffer loaded via fetch)

const Audio1: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false); // State to track play/pause
    const audioCtxRef = useRef<AudioContext | undefined>(undefined); // Reference to the AudioContext
    const sourceRef = useRef<AudioBufferSourceNode | undefined>(undefined); // Reference to the AudioBufferSourceNode
    const bufferRef = useRef<AudioBuffer | undefined>(undefined); // Reference to the decoded AudioBuffer

    useEffect(() => {
        // Step 1: Create an AudioContext
        audioCtxRef.current = new window.AudioContext();

        // Step 2: Fetch and decode the audio file
        fetch('/src/assets/ooc-bass.wav')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioCtxRef.current?.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                bufferRef.current = audioBuffer; // Store the decoded buffer for later use
            })
            .catch(error => console.error('Error loading audio:', error));
    }, []);

    const handlePlay = () => {
        // Step 3: Create a BufferSource node and set its buffer to the decoded audio data
        sourceRef.current = audioCtxRef.current.createBufferSource();
        sourceRef.current.buffer = bufferRef.current;

        // Connect the source to the AudioContext's destination (speakers)
        sourceRef.current.connect(audioCtxRef.current.destination);

        // Start playback
        sourceRef.current.start(0);
        setIsPlaying(true);

        // Stop playback when the audio ends
        sourceRef.current.onended = () => {
            setIsPlaying(false);
        };
    };

    const handlePause = () => {
        if (sourceRef.current) {
            sourceRef.current.stop(); // Stop playback
            setIsPlaying(false);
        }
    };

    return (
        <div>
            <button onClick={handlePlay} disabled={isPlaying}>Play</button>
            <button onClick={handlePause} disabled={!isPlaying}>Pause</button>
        </div>
    );
};

export default Audio1;