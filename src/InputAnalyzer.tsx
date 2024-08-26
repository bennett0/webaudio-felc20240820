import React, { useEffect, useRef, useState } from 'react';
// Example InputAnalyzer: capture audio from mic and visualize frequency and waveform

const InputAnalyzer: React.FC = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [recording, setRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (stream && audioCtxRef.current && analyserRef.current) {
            const source = audioCtxRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            visualizeAudio();
        }
    }, [stream]);

    const startRecording = async () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext)();
        }
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(stream);

        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
            setRecordedChunks((prev) => [...prev, event.data]);
        };
        mediaRecorderRef.current.start();
        setRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            setAudioURL(URL.createObjectURL(blob));
            setRecording(false);
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const visualizeAudio = () => {
      const canvas = canvasRef.current!;
      const canvasCtx = canvas.getContext('2d')!;
      analyserRef.current!.fftSize = 2048;
      const bufferLength = analyserRef.current!.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const timeDomainData = new Uint8Array(bufferLength);

      const draw = () => {
          requestAnimationFrame(draw);
          analyserRef.current!.getByteFrequencyData(dataArray);
          analyserRef.current!.getByteTimeDomainData(timeDomainData);

          canvasCtx.fillStyle = 'rgb(255, 255, 255)';
          canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw frequency domain (spectrum)
          canvasCtx.lineWidth = 2;
          canvasCtx.strokeStyle = 'rgb(0, 0, 255)';
          canvasCtx.beginPath();
          const barWidth = (canvas.width / bufferLength) * 5;
          let barHeight;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
              barHeight = dataArray[i] / 2;

              canvasCtx.fillStyle = `rgb(${barHeight + 100},50,50)`;
              canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

              x += barWidth + 1;
          }

          // Draw time domain (waveform)
          canvasCtx.lineWidth = 2;
          canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
          canvasCtx.beginPath();

          const sliceWidth = canvas.width * 1.0 / bufferLength;
          x = 0;

          for (let i = 0; i < bufferLength; i++) {
              const v = timeDomainData[i] / 128.0;
              const y = v * canvas.height / 2;

              if (i === 0) {
                  canvasCtx.moveTo(x, y);
              } else {
                  canvasCtx.lineTo(x, y);
              }

              x += sliceWidth;
          }

          canvasCtx.lineTo(canvas.width, canvas.height / 2);
          canvasCtx.stroke();
      };

      draw();
  };

    return (
        <div>
            <button onClick={startRecording} disabled={recording}>Start Recording</button>
            <button onClick={stopRecording} disabled={!recording}>Stop Recording</button>
            <br />
            {audioURL && (
                <div>
                    <audio controls src={audioURL}></audio>
                </div>
            )}
            <canvas ref={canvasRef} width="600" height="200"></canvas>
        </div>
    );
};

export default InputAnalyzer;