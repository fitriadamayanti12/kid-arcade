// lib/aiGameGenerator.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi genAI di sini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function generateGameFromPrompt(prompt: string) {
  try {
    // Gunakan model yang tersedia (gemini-1.5-flash lebih stabil)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const systemPrompt = `Kamu adalah pembuat game edukasi untuk anak usia 6 tahun.
Buat game HTML/CSS/JS lengkap dengan spesifikasi:
- Desain warna cerah, ramah anak
- Ukuran responsif untuk mobile
- Minimal 3 soal dengan variasi
- Animasi yang menyenangkan
- Feedback suara (dengan Web Audio API)

${prompt}

Output HANYA kode HTML lengkap, tanpa penjelasan tambahan.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('AI Game Generator Error:', error);
    return getFallbackGameHTML();
  }
}

// Fallback jika AI error
function getFallbackGameHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Comic Neue', cursive;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 20px;
    }
    .game-container {
      background: white;
      border-radius: 30px;
      padding: 20px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    h1 {
      text-align: center;
      color: #667eea;
      font-size: 1.8rem;
    }
    .question {
      background: #f0f0f0;
      padding: 20px;
      border-radius: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 20px 0;
    }
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 15px;
      border-radius: 15px;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
    .score {
      text-align: center;
      font-size: 1.2rem;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="game-container">
    <h1>🎮 Game Seru</h1>
    <div class="question" id="question">Loading...</div>
    <div class="options" id="options"></div>
    <div class="score" id="score">Skor: 0</div>
  </div>
  <script>
    let score = 0;
    let currentQuestion = 0;
    
    const questions = [
      { text: "Hewan apa yang suka mengeong?", options: ["Kucing", "Anjing", "Burung", "Ikan"], correct: 0 },
      { text: "Apa warna pisang?", options: ["Merah", "Kuning", "Hijau", "Biru"], correct: 1 },
      { text: "Hewan apa yang bisa terbang?", options: ["Kucing", "Anjing", "Burung", "Ikan"], correct: 2 }
    ];
    
    function loadQuestion() {
      const q = questions[currentQuestion];
      document.getElementById('question').innerHTML = q.text;
      const optionsDiv = document.getElementById('options');
      optionsDiv.innerHTML = '';
      q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.innerHTML = opt;
        btn.onclick = () => checkAnswer(i);
        optionsDiv.appendChild(btn);
      });
    }
    
    function checkAnswer(selected) {
      if (selected === questions[currentQuestion].correct) {
        score += 10;
        document.getElementById('score').innerHTML = 'Skor: ' + score;
        alert('✅ Benar!');
      } else {
        alert('❌ Coba lagi!');
      }
      currentQuestion++;
      if (currentQuestion < questions.length) {
        loadQuestion();
      } else {
        alert('🎉 Selesai! Skor akhir: ' + score);
      }
    }
    
    loadQuestion();
  </script>
</body>
</html>
  `;
}