import { useState, useRef } from 'react';

const phrasesByLevel = {
  beginner: [
    { text: 'Bonjour', audio: '/audio/bonjour.mp3' },
    { text: 'Merci', audio: '/audio/merci.mp3' }
  ],
  intermediate: [
    { text: 'Comment ça va ?', audio: '/audio/comment-ca-va.mp3' },
    { text: 'Je suis étudiant', audio: '/audio/je-suis-etudiant.mp3' }
  ],
  advanced: [
    { text: 'J’aimerais réserver une table pour deux', audio: '/audio/reserver-une-table.mp3' },
    { text: 'Il fait un temps magnifique aujourd’hui', audio: '/audio/temps-magnifique.mp3' }
  ]
};

function App() {
  const levels = Object.keys(phrasesByLevel);
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [selectedPhrase, setSelectedPhrase] = useState(phrasesByLevel['beginner'][0]);

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    setSelectedPhrase(phrasesByLevel[level][0]);
  };

  const playNative = () => {
    const audio = new Audio(selectedPhrase.audio);
    audio.play();
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const playRecording = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AccentCoach 🇫🇷</h1>

      <label>
        Difficulty:&nbsp;
        <select value={selectedLevel} onChange={(e) => handleLevelChange(e.target.value)}>
          {levels.map(level => (
            <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
          ))}
        </select>
      </label>

      <br /><br />

      <label>
        Choose a phrase:&nbsp;
        <select
          value={selectedPhrase.text}
          onChange={(e) =>
            setSelectedPhrase(
              phrasesByLevel[selectedLevel].find(p => p.text === e.target.value)
            )
          }
        >
          {phrasesByLevel[selectedLevel].map((phrase, idx) => (
            <option key={idx} value={phrase.text}>
              {phrase.text}
            </option>
          ))}
        </select>
      </label>

      <br /><br />
      <button onClick={playNative}>▶️ Play Native Audio</button>

      <br /><br />
      <button onClick={startRecording} disabled={recording}>
        🎙 Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        ⏹ Stop Recording
      </button>
      <button onClick={playRecording} disabled={!audioBlob}>
        🔁 Play Your Recording
      </button>
    </div>
  );
}

export default App;