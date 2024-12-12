let recorder, audioBlob;

// Lấy các phần tử DOM
const startBtn = document.getElementById('startRecording');
const stopBtn = document.getElementById('stopRecording');
const submitBtn = document.getElementById('submitAudio');
const responseParagraph = document.getElementById('response');

// Sự kiện bắt đầu ghi âm
startBtn.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    const audioChunks = [];

    recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    recorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        stopBtn.disabled = true;
        submitBtn.disabled = false;
    };

    recorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
});

// Sự kiện dừng ghi âm
stopBtn.addEventListener('click', () => {
    recorder.stop();
    startBtn.disabled = false;
});

// Sự kiện gửi âm thanh tới API
submitBtn.addEventListener('click', async () => {
    // Chuyển đổi Blob sang Base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);

    reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1]; // Lấy phần dữ liệu Base64

        // Gửi yêu cầu tới API
        const response = await fetch(
            "https://asia-southeast2-tinytunespronunciationtesting.cloudfunctions.net/evaluatePronunciation",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    audio: base64Audio,
                    transcript: "sample text", // Thay "sample text" bằng đoạn transcript chuẩn.
                }),
            }
        );

        const result = await response.json();
        responseParagraph.textContent = `API Response: ${JSON.stringify(result)}`;
    };
});

