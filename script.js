// Инициализация интерфейса
// Дополнительные функции для управления

// --- Инициализация при загрузке ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. Прогресс-бар
  const pg = document.getElementById("progress-circle");
  if (pg) {
    const p = parseInt(pg.style.getPropertyValue("--pg-percent")) || 0;
    pg.style.setProperty(
      "--dynamic-color",
      `hsl(${Math.max(0, 120 - p * 1.2)}, 75%, 50%)`
    );
  }

  // 2. Переключение темы
  const html = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const theme = localStorage.getItem("theme") || "dark";
  html.setAttribute("data-theme", theme);
  toggle.addEventListener("click", () => {
    const next =
      html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  // 3. Обработка флагов (Twemoji)
  parseFlags();
});

// --- Функции управления ---
async function copyLink(l, b) {
  try {
    await navigator.clipboard.writeText(l);
    const old = b.textContent;
    b.textContent = "Готово!";
    setTimeout(() => (b.textContent = old), 1500);
  } catch (e) {
    alert("Ошибка");
  }
}

function showQR(l) {
  const c = document.getElementById("qrcode");
  c.innerHTML = "";
  new QRCode(c, {
    text: l,
    width: 180,
    height: 180,
    colorDark: "#0b0d14",
    colorLight: "#ffffff",
  });
  document.getElementById("qrModal").classList.add("active");
}

function closeQR() {
  document.getElementById("qrModal").classList.remove("active");
}

function parseFlags() {
  if (typeof twemoji === "undefined") return;

  const flags = document.querySelectorAll(".server-flag");
  flags.forEach((el) => {
    try {
      let text = el.textContent.trim();
      if (text.includes("%")) text = decodeURIComponent(text);

      // Оставляем только эмодзи для блока флага
      const emojiOnly = text.match(
        /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
      );
      el.textContent = emojiOnly ? emojiOnly.join("") : "🌍";

      twemoji.parse(el, {
        folder: "svg",
        ext: ".svg",
        base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
      });
    } catch (e) {
      console.error(e);
    }
  });

  const titles = document.querySelectorAll(".server-title");
  titles.forEach((el) => {
    let text = el.textContent.trim();
    if (text.includes("%")) text = decodeURIComponent(text);

    // Убираем эмодзи из названия, чтобы было чисто: "Германия #1"
    const cleanText = text
      .replace(
        /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g,
        "",
      )
      .trim();
    el.textContent = cleanText || text;
  });
}

// --- АНИМАЦИЯ НЕЙРОННОЙ СЕТИ ---
const canvas = document.getElementById("particle-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particlesArray = [];
  let pulsesArray = [];

  const getVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.dx = Math.random() * 0.4 - 0.2;
      this.dy = Math.random() * 0.4 - 0.2;
      this.size = Math.random() * 2 + 1.5;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = getVar("--net-color");
      ctx.fill();
    }
    update() {
      if (this.x < 0 || this.x > canvas.width) this.dx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.dy *= -1;
      this.x += this.dx;
      this.y += this.dy;
      this.draw();
    }
  }

  class Pulse {
    constructor(start, end) {
      this.start = start;
      this.end = end;
      this.progress = 0;
      this.speed = 0.005 + Math.random() * 0.01;
    }
    update() {
      this.progress += this.speed;
      if (this.progress >= 1) return false;
      const x = this.start.x + (this.end.x - this.start.x) * this.progress;
      const y = this.start.y + (this.end.y - this.start.y) * this.progress;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.shadowBlur = 10;
      ctx.shadowColor = getVar("--pulse-color");
      ctx.fillStyle = getVar("--pulse-color");
      ctx.fill();
      ctx.shadowBlur = 0;
      return true;
    }
  }

  function init() {
    particlesArray = [];
    for (let i = 0; i < 90; i++) particlesArray.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      for (let j = i + 1; j < particlesArray.length; j++) {
        const dx = particlesArray[i].x - particlesArray[j].x;
        const dy = particlesArray[i].y - particlesArray[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          ctx.strokeStyle = getVar("--net-color");
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
          ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
          ctx.stroke();
          if (Math.random() > 0.9985 && pulsesArray.length < 20) {
            pulsesArray.push(new Pulse(particlesArray[i], particlesArray[j]));
          }
        }
      }
    }
    pulsesArray = pulsesArray.filter(p => p.update());
    requestAnimationFrame(animate);
  }

  init();
  animate();
}
