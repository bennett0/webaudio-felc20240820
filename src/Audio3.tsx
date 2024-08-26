import React, { useEffect, useRef, useState } from 'react';

// Example Audio3: "Live" mixing of multiple synchronized tracks

const Audio3: React.FC = () => {
    const audioCtxRef = useRef<AudioContext | null>(null); // Reference to the AudioContext
    const sourceRefs = useRef<(AudioBufferSourceNode | null)[]>([]); // Array to hold references to BufferSource nodes
    const gainNodeRefs = useRef<(GainNode | null)[]>([]); // Array to hold references to GainNodes
    const bufferRefs = useRef<(AudioBuffer | null)[]>([]); // Array to hold references to decoded AudioBuffers
    const [volumes, setVolumes] = useState<number[]>([1, 1, 1, 1]); // State to hold the volume for each track

    useEffect(() => {
        // Step 1: Create an AudioContext
        audioCtxRef.current = new window.AudioContext();

        // URLs for the 4 audio tracks
        const audioUrls = [
            '/src/assets/ooc-bass.wav',
            '/src/assets/ooc-drums.wav',
            '/src/assets/ooc-keys.wav',
            '/src/assets/ooc-vox.wav',
        ];

        // Fetch and decode all audio files
        audioUrls.forEach((url, index) => {
            fetch(url)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => {
                    if (audioCtxRef.current) {
                        return audioCtxRef.current.decodeAudioData(arrayBuffer);
                    }
                    throw new Error('AudioContext is not initialized');
                })
                .then(audioBuffer => {
                    bufferRefs.current[index] = audioBuffer; // Store the decoded buffer
                })
                .catch(error => console.error('Error loading audio:', error));
        });
    }, []);

    const handlePlay = () => {
        if (!audioCtxRef.current) return;

        // Step 2: Create BufferSource nodes and GainNodes for each track
        bufferRefs.current.forEach((buffer, index) => {
            if (!buffer) return;

            const source = audioCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.loop = true; // Set audio to loop

            const gainNode = audioCtxRef.current.createGain();
            gainNode.gain.value = volumes[index]; // Set initial gain (volume) from state

            source.connect(gainNode).connect(audioCtxRef.current.destination); // Connect source -> gain -> destination

            source.start(0); // Start playback

            sourceRefs.current[index] = source; // Store the source node reference
            gainNodeRefs.current[index] = gainNode; // Store the gain node reference
        });
    };

    const handleStop = () => {
        // Stop all tracks
        sourceRefs.current.forEach(source => {
            if (source) source.stop();
        });
    };

    const handleVolumeChange = (index: number, value: number) => {
        const newVolumes = [...volumes];
        newVolumes[index] = value;
        setVolumes(newVolumes);

        // Update gain value in the corresponding GainNode
        if (gainNodeRefs.current[index]) {
            gainNodeRefs.current[index].gain.value = value;
        }
    };

    return (
        <div>
            <button onClick={handlePlay}>Play All</button>
            <button onClick={handleStop}>Stop All</button>
            <div>
                {volumes.map((volume, index) => (
                    <div key={index}>
                        <label>Track {index + 1} Volume: </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => handleVolumeChange(index, parseFloat(e.target.value))}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Audio3;