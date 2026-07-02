import { useRef, useState, useEffect } from 'react';
import './VoiceRecorder.css';

export default function VoiceRecorder({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      mediaRef.current?.stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        onRecorded?.(file);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError('Нет доступа к микрофону');
    }
  }

  function stop() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="voice-recorder">
      <span className="voice-label">Голосовое сообщение</span>
      {!recording ? (
        <button type="button" className="btn-secondary" onClick={start}>
          🎤 Записать
        </button>
      ) : (
        <button type="button" className="btn-danger" onClick={stop}>
          ⏹ Остановить
        </button>
      )}
      {error && <p className="voice-error">{error}</p>}
    </div>
  );
}
