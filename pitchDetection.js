const startButton = document.getElementById('startButton');
const noteName = document.getElementById('noteName');
const solfegeName = document.getElementById('solfegeName');

const solfegeMap = {
    'C': 'Do',
    'C#': 'Di',
    'D': 'Re',
    'D#': 'Ri',
    'E': 'Mi',
    'F': 'Fa',
    'F#': 'Fi',
    'G': 'Sol',
    'G#': 'Si',
    'A': 'La',
    'A#': 'Li',
    'B': 'Ti'
};

let pitchDetecting = false;

startButton.addEventListener('click', async () => {
    if (pitchDetecting) {
        pitchDetecting = false;
        startButton.textContent = 'Start Listening';
    } else {
        pitchDetecting = true;
        startButton.textContent = 'Stop Listening';
        startPitchDetection();
    }
});

async function startPitchDetection() {
    if (!pitchDetecting) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const micSource = audioContext.createMediaStreamSource(micStream);
    micSource.connect(analyser);

    const buffer = new Float32Array(analyser.fftSize);

    function detectPitch() {
        if (!pitchDetecting) {
            micStream.getTracks().forEach(track => track.stop());
            return;
        }

        analyser.getFloatTimeDomainData(buffer);
        const [pitch, clarity] = pitchy.detectPitch(buffer, audioContext.sampleRate);

        if (clarity > 0.8) {
            const note = frequencyToNote(pitch);
            const solfege = solfegeMap[note.split(/[0-9]/)[0]];
            noteName.textContent = note;
            solfegeName.textContent = solfege;
        } else {
            noteName.textContent = '-';
            solfegeName.textContent = '-';
        }

        requestAnimationFrame(detectPitch);
    }

    detectPitch();
}

function frequencyToNote(frequency) {
    const noteStrings = [
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
    ];
    const pitchIndex = Math.round(12 * (Math.log(frequency / 440) / Math.log(2)));
    const note = noteStrings[(pitchIndex % 12 + 12) % 12];
    const octave = Math.floor(pitchIndex / 12) + 4;
    return note + octave;
}
