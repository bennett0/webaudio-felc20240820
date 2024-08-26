import React, { useEffect, useRef } from 'react';

// Example Audio0: Basic playback with AudioContext using an <audio> element as the source

const Audio0: React.FC = () => {
    const audioRef = useRef(null); // Reference to the <audio> element
    const audioCtxRef = useRef(null); // Reference to the AudioContext

    useEffect(() => {
        // Step 1: Create an AudioContext
        audioCtxRef.current = new window.AudioContext();

        // Step 2: Create a MediaElementAudioSourceNode from the <audio> element
        audioRef.current = document.getElementById("audiodrums") as HTMLAudioElement;
        const source = audioCtxRef.current.createMediaElementSource(audioRef.current);

        // Step 3: Connect the source to the AudioContext's destination (speakers)
        source.connect(audioCtxRef.current.destination);

        // Optional: Add additional nodes for processing, e.g., GainNode for volume control
        // const gainNode = audioCtxRef.current.createGain();
        // source.connect(gainNode).connect(audioCtxRef.current.destination);

    }, []);

    const handlePlay = () => {
        audioRef.current.play();
        audioCtxRef.current.resume(); // Ensure AudioContext is running
    };

    const handlePause = () => {
        audioRef.current.pause();
    };

    return (
        <div>
            <button onClick={handlePlay}>Play 0</button>
            <button onClick={handlePause}>Pause</button>
        </div>
    );
};

export default Audio0;