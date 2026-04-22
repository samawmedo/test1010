(() => {
  "use strict";

  // إعدادات خاصة (غير ظاهرة للمستخدم)
  const PASSWORD = "1420";
  const RELATIONSHIP_START_ISO = "2023-09-01T00:00:00+03:00";

  const MESSAGES = [
    "أعرف إن هذا المكان ما ينشاف…\nبس كنت أبيه يكون لنا بس 🤍",
    "إذا وصلتي لهنا… يعني قلبك عرف الطريق قبل يدك.",
    "أنا ما أحب أقول كلام كثير.\nأحب أكون سبب هدوئك.",
    "كل مرة تضحكين فيها… أحس الدنيا تصير أخف ✨",
    "وكل مرة تسكتين… أتمنى لو أقدر أقرأ اللي بعينك بدون سؤال.",
    "أنا معك…\nمو عشان الأيام حلوة.\nعشان حتى لو ثقلت… نخففها سوا.",
    "إذا نسيتِ أي شيء…\nلا تنسين إنك غالية جدًا عندي ❤️"
  ];

  const $ = (id) => document.getElementById(id);

  const screens = {
    password: $("screen-password"),
    start: $("screen-start"),
    messages: $("screen-messages"),
    love: $("screen-love")
  };

  const passwordInput = $("passwordInput");
  const enterBtn = $("enterBtn");
  const passwordHint = $("passwordHint");
  const startTap = $("startTap");
  const messageText = $("messageText");
  const nextBtn = $("nextBtn");
  const audioBtn = $("audioBtn");
  const audioLabel = $("audioLabel");
  const backToStart = $("backToStart");

  const daysEl = $("days");
  const hoursEl = $("hours");
  const minutesEl = $("minutes");
  const secondsEl = $("seconds");
  const sinceLine = $("sinceLine");

  const namesTap = $("namesTap");
  const hidden = $("hidden");

  let msgIndex = 0;
  let typingAbort = { aborted: false };
  let counterTimer = null;
  let messageInProgress = false;

  // صوت ناعم (بدون ملفات) - يبدأ فقط بعد تفاعل المستخدم
  let audioCtx = null;
  let audioOn = false;
  let pad = null;

  function vibrateSoft() {
    try {
      if (navigator.vibrate) navigator.vibrate(14);
    } catch {
      // ignore
    }
  }

  function setActiveScreen(next) {
    Object.values(screens).forEach((el) => el.classList.remove("is-active"));
    next.classList.add("is-active");
  }

  function setHint(text) {
    passwordHint.textContent = text || "";
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function randBetween(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  async function typewrite(el, text, signal) {
    el.textContent = "";
    const chars = Array.from(text);
    for (let i = 0; i < chars.length; i++) {
      if (signal.aborted) return;
      el.textContent += chars[i];
      // إيقاع طبيعي: الحروف أسرع، والأسطر/النقاط أبطأ
      const c = chars[i];
      let delay = 32;
      if (c === "\n") delay = 260;
      else if (/[.!؟…،]/.test(c)) delay = 190;
      else if (c === " ") delay = 36;
      await sleep(delay);
    }
  }

  function showNextButton() {
    nextBtn.classList.add("is-visible");
  }

  function hideNextButton() {
    nextBtn.classList.remove("is-visible");
  }

  async function showMessageAt(index) {
    messageInProgress = true;
    hideNextButton();

    // إلغاء أي كتابة جارية (لا نقطع العرض الحالي عبر واجهة المستخدم، لكن نضمن عدم تداخل)
    typingAbort.aborted = true;
    typingAbort = { aborted: false };

    await typewrite(messageText, MESSAGES[index], typingAbort);
    if (typingAbort.aborted) return;

    // قاعدة: انتظر بعد اكتمال الرسالة ثم أظهر "التالي"
    await sleep(randBetween(500, 1000));
    showNextButton();
    messageInProgress = false;
  }

  function ensureAudio() {
    if (audioCtx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = new Ctx();
  }

  function startPad() {
    ensureAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});

    if (pad) return;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.0;
    gain.connect(audioCtx.destination);

    const o1 = audioCtx.createOscillator();
    const o2 = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();

    o1.type = "sine";
    o2.type = "triangle";
    lfo.type = "sine";

    // نغمة هادئة جدًا
    o1.frequency.value = 196; // G3
    o2.frequency.value = 246.94; // B3
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 6; // اهتزاز بسيط للتردد

    lfo.connect(lfoGain);
    lfoGain.connect(o1.frequency);
    lfoGain.connect(o2.frequency);

    o1.connect(gain);
    o2.connect(gain);

    o1.start();
    o2.start();
    lfo.start();

    // رفع الصوت تدريجيًا
    const now = audioCtx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 1.2);

    pad = { gain, o1, o2, lfo, lfoGain };
  }

  function stopPad() {
    if (!audioCtx || !pad) return;
    const now = audioCtx.currentTime;
    try {
      pad.gain.gain.cancelScheduledValues(now);
      pad.gain.gain.setValueAtTime(pad.gain.gain.value, now);
      pad.gain.gain.linearRampToValueAtTime(0.0, now + 0.8);
    } catch {
      // ignore
    }

    // إيقاف بعد نزول الصوت
    setTimeout(() => {
      try {
        pad.o1.stop();
        pad.o2.stop();
        pad.lfo.stop();
      } catch {
        // ignore
      }
      pad = null;
    }, 900);
  }

  function setAudioUI() {
    audioLabel.textContent = audioOn ? "إيقاف" : "تشغيل";
    audioBtn.style.opacity = audioOn ? "1" : ".92";
  }

  function toggleAudio() {
    audioOn = !audioOn;
    setAudioUI();
    if (audioOn) startPad();
    else stopPad();
  }

  function formatArabicDateLine(date) {
    const fmt = new Intl.DateTimeFormat("ar", { year: "numeric", month: "long", day: "numeric" });
    return `من ${fmt.format(date)}`;
  }

  function updateCounter() {
    const start = new Date(RELATIONSHIP_START_ISO);
    const now = new Date();
    const diff = Math.max(0, now.getTime() - start.getTime());

    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;

    daysEl.textContent = String(days);
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");

    sinceLine.textContent = formatArabicDateLine(start);
  }

  function startCounter() {
    if (counterTimer) return;
    updateCounter();
    counterTimer = setInterval(updateCounter, 1000);
  }

  function stopCounter() {
    if (!counterTimer) return;
    clearInterval(counterTimer);
    counterTimer = null;
  }

  function resetExperience() {
    msgIndex = 0;
    typingAbort.aborted = true;
    messageText.textContent = "";
    hideNextButton();
    messageInProgress = false;
    stopCounter();
    hidden.textContent = "";
    hidden.classList.remove("is-shown");
  }

  // --- أحداث الدخول ---
  function checkPasswordAndEnter() {
    vibrateSoft();
    const value = (passwordInput.value || "").trim();

    if (!value) {
      setHint("قريب… اكتبه بهدوء.");
      return;
    }

    if (value !== PASSWORD) {
      setHint("مو هذا… جرّب مرة ثانية.");
      passwordInput.focus();
      passwordInput.select?.();
      return;
    }

    setHint("");
    // انتقال ناعم (تلاشي + بلور بسيط) عبر تبديل الشاشة
    setActiveScreen(screens.start);
    passwordInput.value = "";
  }

  enterBtn.addEventListener("click", checkPasswordAndEnter);
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPasswordAndEnter();
  });

  // --- بدء التجربة ---
  startTap.addEventListener("click", async () => {
    vibrateSoft();
    resetExperience();
    setActiveScreen(screens.messages);
    setAudioUI();
    await sleep(180);
    await showMessageAt(msgIndex);
  });

  audioBtn.addEventListener("click", () => {
    vibrateSoft();
    toggleAudio();
  });

  nextBtn.addEventListener("click", async () => {
    if (messageInProgress) return;
    vibrateSoft();
    if (!nextBtn.classList.contains("is-visible")) return;

    msgIndex += 1;
    if (msgIndex < MESSAGES.length) {
      await showMessageAt(msgIndex);
      return;
    }

    // نهاية الرسائل -> الأسماء + العداد
    setActiveScreen(screens.love);
    startCounter();
  });

  backToStart.addEventListener("click", () => {
    vibrateSoft();
    stopPad();
    audioOn = false;
    setAudioUI();
    resetExperience();
    setActiveScreen(screens.start);
  });

  // رسالة مخفية بعد نقرات متعددة
  let taps = 0;
  let tapTimer = null;
  namesTap.addEventListener("click", async () => {
    vibrateSoft();
    taps += 1;

    if (tapTimer) clearTimeout(tapTimer);
    tapTimer = setTimeout(() => {
      taps = 0;
      tapTimer = null;
    }, 1800);

    if (taps === 6) {
      hidden.textContent =
        "إذا جاء يوم وحسيتي إنك مو بخير…\nلا تشرحين كثير.\nقولي بس: “تعال”.\nوأنا أجي.";
      hidden.classList.add("is-shown");
      await sleep(700);
      taps = 0;
    }
  });

  // لمسة لطيفة: تركيز تلقائي على حقل الباسورد
  setTimeout(() => passwordInput.focus(), 420);
})();
