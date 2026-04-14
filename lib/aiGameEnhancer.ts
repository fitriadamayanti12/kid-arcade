// lib/aiGameEnhancer.ts

const CSS_URL = '/styles/ai-game-iframe.css';

// Toast script
const getToastScript = () => `
<script>
  function showToast(message, isCorrect = true) {
    const existingToast = document.getElementById('game-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.id = 'game-toast';
    toast.innerHTML = \`
      <div style="
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: \${isCorrect ? '#48bb78' : '#f56565'};
        color: white;
        padding: 16px 32px;
        border-radius: 60px;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        animation: slideUp 0.3s ease-out;
        font-family: 'Comic Neue', cursive;
        white-space: nowrap;
      ">
        \${isCorrect ? '✅ ' + message : '❌ ' + message}
      </div>
    \`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
  window.alert = function(message) { showToast(message, true); };
<\/script>
`;

export function enhanceGameHTML(html: string): string {
  let enhanced = html;
  
  // Tambah viewport
  if (!enhanced.includes('viewport')) {
    enhanced = enhanced.replace('<head>', '<head><meta name="viewport" content="width=device-width, initial-scale=1.0">');
  }
  
  // Hapus style bawaan yang mungkin bermasalah
  enhanced = enhanced.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Tambah link CSS eksternal
  if (enhanced.includes('</head>')) {
    enhanced = enhanced.replace('</head>', `<link rel="stylesheet" href="${CSS_URL}"></head>`);
  }
  
  // Bungkus dengan container jika perlu
  if (!enhanced.includes('game-container')) {
    enhanced = enhanced.replace('<body>', '<body><div class="game-container">');
    enhanced = enhanced.replace('</body>', '</div></body>');
  }
  
  // Tambah toast script
  if (enhanced.includes('</body>')) {
    enhanced = enhanced.replace('</body>', getToastScript() + '</body>');
  }
  
  return enhanced;
}