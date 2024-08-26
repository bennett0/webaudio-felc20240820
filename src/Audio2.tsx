import { useEffect, useRef } from 'react';

// Example Audio2: Multiple sources with AudioContext using <audio> and BufferSourceNode

const Audio2 = () => {
    const audioCtxRef = useRef(null); // Reference to the AudioContext
    const audioElementRef = useRef(null); // Reference to the <audio> element
    const sourceRef1 = useRef(null); // Reference to the MediaElementAudioSourceNode (from <audio>)
    const sourceRef2 = useRef<AudioBufferSourceNode | undefined>(null); // Reference to the BufferSourceNode (loaded via fetch)
    const bufferRef = useRef(null); // Reference to the decoded AudioBuffer

    useEffect(() => {
        // Step 1: Create an AudioContext
        audioCtxRef.current = new window.AudioContext();

        // Step 2: Create a MediaElementAudioSourceNode from the <audio> element
        audioElementRef.current = document.getElementById("audiodrums") as HTMLAudioElement;
        sourceRef1.current = audioCtxRef.current.createMediaElementSource(audioElementRef.current);

        // Step 3: Fetch and decode the second audio file
        fetch('/src/assets/ooc-vox.wav')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioCtxRef.current.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                bufferRef.current = audioBuffer; // Store the decoded buffer for later use
            })
            .catch(error => console.error('Error loading audio:', error));
    }, []);

    const handlePlay = () => {
        // Step 4: Create a BufferSource node for the second audio file
        sourceRef2.current = audioCtxRef.current.createBufferSource();
        sourceRef2.current.buffer = bufferRef.current;

        // Step 5: Connect both sources to the AudioContext's destination (speakers)
        sourceRef1.current.connect(audioCtxRef.current.destination);
        sourceRef2.current.connect(audioCtxRef.current.destination);

        // Enable looping for both sources
        audioElementRef.current.loop = true; // Loop the <audio> element
        sourceRef2.current.loop = true; // Loop the buffer source

        // Start playback of both sources
        audioElementRef.current.play(); // Play the <audio> element
        sourceRef2.current.start(0); // Play the buffer source
    };

    const handlePause = () => {
        // Pause the <audio> element
        audioElementRef.current.pause();

        // Stop the buffer source playback
        if (sourceRef2.current) {
            sourceRef2.current.stop();
        }
    };

    return (
        <div>
            <button onClick={handlePlay}>Play Both</button>
            <button onClick={handlePause}>Pause Both</button>
        </div>
    );
};

export default Audio2;