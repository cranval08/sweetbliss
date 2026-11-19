/* =============================================
   Sweet Bliss Bakery – app.js
   ============================================= */

// ── Langflow config ──────────────────────────
const LANGFLOW_API_KEY = 'sk-N28M9XU8L_uD2AtVdApi4MKdvLNPKaamu7nxU4GBbHw';
const LANGFLOW_ENDPOINT = 'http://localhost:7860/api/v1/run/32235646-8814-4845-95bf-ef63ee096a64';

/** Generate a simple UUID v4 (no crypto module needed in browser) */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/** Call Langflow API and return the bot's reply string */
async function callLangflow(userMessage) {
  const payload = {
    output_type: 'chat',
    input_type: 'chat',
    input_value: userMessage,
    session_id: generateUUID()
  };

  const response = await fetch(LANGFLOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LANGFLOW_API_KEY
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Try multiple possible paths in the Langflow response structure
  const reply =
    data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
    data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ||
    data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
    data?.result?.output ||
    data?.output ||
    null;

  if (reply) return reply;

  // Fallback: stringify first output for debugging
  console.warn('Unexpected Langflow response shape:', data);
  throw new Error('Tidak dapat membaca balasan dari server.');
}


// ── Product catalogue ────────────────────────
const products = [
  { id: 1, emoji: '🎂', name: 'Rainbow Delight Cake', category: 'cake',   price: 285000, unit: '/loyang', desc: 'Kue berlapis pelangi dengan krim buttercream lembut.' },
  { id: 2, emoji: '🍰', name: 'Creamy Cheesecake',    category: 'pastry', price: 220000, unit: '/loyang', desc: 'New-York style cheesecake dengan topping strawberry segar.' },
  { id: 3, emoji: '🧁', name: 'Choco Velvet Cupcake', category: 'pastry', price: 25000,  unit: '/pcs',   desc: 'Cupcake red velvet dengan frosting krim coklat kaya.' },
  { id: 4, emoji: '👰', name: 'Elegant Wedding Tier', category: 'custom', price: 1200000,unit: '/tier',  desc: 'Wedding cake multi-tier elegan, bisa dikustomisasi penuh.' },
  { id: 5, emoji: '🥐', name: 'Butter Croissant',     category: 'pastry', price: 18000,  unit: '/pcs',   desc: 'Croissant renyah lapis-lapis dengan butter premium impor.' },
  { id: 6, emoji: '🎂', name: 'Moist Choco Fudge',    category: 'cake',   price: 320000, unit: '/loyang', desc: 'Kue coklat super moist dengan ganache berjatuhan.' },
  { id: 7, emoji: '🌸', name: 'Floral Birthday Cake', category: 'custom', price: 450000, unit: '/loyang', desc: 'Desain bunga segar 3D yang cantik untuk momen spesial.' },
  { id: 8, emoji: '🍮', name: 'Mille Crêpe Matcha',   category: 'pastry', price: 180000, unit: '/loyang', desc: 'Lapisan crêpe halus bertabur aroma matcha premium Jepang.' },
  { id: 9, emoji: '🎂', name: 'Princess Doll Cake',   category: 'custom', price: 500000, unit: '/pcs',   desc: 'Kue karakter boneka princess untuk si kecil yang istimewa.' }
];

function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  const list = filter === 'all' ? products : products.filter(p => p.category === filter);

  grid.innerHTML = list.map(p => `
    <div class="product-card" data-category="${p.category}">
      <div class="product-img">${p.emoji}</div>
      <div class="product-info">
        <div class="product-category">${categoryLabel(p.category)}</div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-footer">
          <div class="product-price">${formatRupiah(p.price)} <small>${p.unit}</small></div>
          <button class="btn-add" onclick="addToOrder('${p.name}')">+ Pesan</button>
        </div>
      </div>
    </div>
  `).join('');
}

function categoryLabel(cat) {
  return { cake: 'Kue Ulang Tahun', pastry: 'Pastry', custom: 'Custom Order' }[cat] || cat;
}

function addToOrder(name) {
  openChat();
  setTimeout(() => sendQuick(`Saya mau pesan ${name}`), 400);
}


// ── Filter tabs ──────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(btn.dataset.filter);
  });
});


// ── Navbar scroll ────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('mobile-open');
});
// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('mobile-open'));
});


// ── Smooth-scroll helper ─────────────────────
function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}


// ── Contact form ─────────────────────────────
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = '✅ Pesan Terkirim!';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Kirim Pesan 📩';
    btn.disabled = false;
    e.target.reset();
  }, 3000);
});


// ── Chatbox ──────────────────────────────────
const chatWidget  = document.getElementById('chatWidget');
const chatBox     = document.getElementById('chatBox');
const chatToggle  = document.getElementById('chatToggle');
const chatCloseBtn= document.getElementById('chatCloseBtn');
const chatMessages= document.getElementById('chatMessages');
const chatInput   = document.getElementById('chatInput');
const chatSend    = document.getElementById('chatSend');
const chatNotif   = document.getElementById('chatNotif');
const iconOpen    = chatToggle.querySelector('.chat-icon-open');
const iconClose   = chatToggle.querySelector('.chat-icon-close');

let isChatOpen = false;

function openChat() {
  if (!isChatOpen) toggleChat();
}

function toggleChat() {
  isChatOpen = !isChatOpen;
  chatBox.classList.toggle('open', isChatOpen);
  iconOpen.style.display  = isChatOpen ? 'none'  : 'inline';
  iconClose.style.display = isChatOpen ? 'inline' : 'none';

  if (isChatOpen) {
    chatNotif.style.display = 'none';
    chatInput.focus();
    scrollToBottom();
  }
}

chatToggle.addEventListener('click', toggleChat);
chatCloseBtn.addEventListener('click', toggleChat);

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isChatOpen) toggleChat();
});

// Send on Enter
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});
chatSend.addEventListener('click', handleSend);

function sendQuick(text) {
  openChat();
  chatInput.value = text;
  handleSend();
}

function getTimeString() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(role, text) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `
    <div class="msg-bubble">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
    <div class="msg-time">${getTimeString()}</div>
  `;
  chatMessages.appendChild(div);
  scrollToBottom();
}

function appendBotHtml(html) {
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = `
    <div class="msg-bubble">${html}</div>
    <div class="msg-time">${getTimeString()}</div>
  `;
  chatMessages.appendChild(div);
  scrollToBottom();
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="typing-bubble">
      <span></span><span></span><span></span>
    </div>
  `;
  chatMessages.appendChild(div);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setInputDisabled(val) {
  chatInput.disabled = val;
  chatSend.disabled  = val;
}

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Hide quick replies after first use
  const qr = document.getElementById('quickReplies');
  if (qr) qr.style.display = 'none';

  appendMessage('user', text);
  chatInput.value = '';
  setInputDisabled(true);
  showTyping();

  try {
    const reply = await callLangflow(text);
    hideTyping();
    appendMessage('bot', reply);
  } catch (err) {
    hideTyping();
    console.error('Langflow error:', err);
    appendBotHtml(
      `Maaf, saya sedang tidak bisa terhubung ke server. 😔<br>` +
      `Silakan hubungi kami langsung di <strong>+62 812-3456-7890</strong> ya!`
    );
  } finally {
    setInputDisabled(false);
    chatInput.focus();
  }
}


// ── Scroll-reveal animation ──────────────────
function revealOnScroll() {
  const elements = document.querySelectorAll(
    '.feature-card, .product-card, .testi-card, .about-text, .about-visual, .contact-form'
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(30px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
    observer.observe(el);
  });
}


// ── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  revealOnScroll();
});
