const { useMemo, useEffect, useState, useRef } = React;
const MotionLib = window.Motion || window["framer-motion"];
const { motion, AnimatePresence } = MotionLib;

const START_DATE = new Date("2025-10-03T00:00:00");
const CORRECT_PASSWORD = "love";
const SONG_NAME = "A Thousand Years";
const ALBUM_COVER = "https://upload.wikimedia.org/wikipedia/en/1/1f/Christina_Perri_-_A_Thousand_Years.png";
const SONG_URL =
  "https://cdn.pixabay.com/download/audio/2023/04/30/audio_c2a245f3f1.mp3?filename=romantic-piano-145991.mp3";

const memoryItems = [
  { type: "image", src: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=900&q=80" },
  { type: "image", src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=80" },
  { type: "image", src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80" },
  { type: "video", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { type: "image", src: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=80" },
];

const letters = [
  "أنتِ الهدوء الذي وجدته بعد ضجيج العالم، والدعوة التي أرددها كل ليلة بشكر.",
  "كل يوم معك يثبت لي أن الحب الحقيقي ليس صدفة، بل رحمة جميلة من الله.",
  "حين أراك، أشعر أن قلبي يعود إلى بيته، وأن الدنيا تصبح أخف وأجمل.",
];

const introMessage =
  "من اللحظة اللي عرفتك فيها، قلبي اختار السكينة في قربك. هذا المكان معمول عشان يفضل شاهد على حبنا بكل تفاصيله.";
const finalMessage =
  "وإذا وصلتي لهنا... أحب أقولك إن كل ذكرى معك هي كنز، وكل ضحكة بيننا هي عمر كامل من الفرح.";

function addYears(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function getElapsedParts(from, to) {
  let cursor = new Date(from);
  let years = 0;
  while (addYears(cursor, 1) <= to) {
    years += 1;
    cursor = addYears(cursor, 1);
  }

  let months = 0;
  while (addMonths(cursor, 1) <= to) {
    months += 1;
    cursor = addMonths(cursor, 1);
  }

  let remaining = to - cursor;
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  remaining -= days * 1000 * 60 * 60 * 24;
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  remaining -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(remaining / (1000 * 60));
  remaining -= minutes * 1000 * 60;
  const seconds = Math.floor(remaining / 1000);

  return { years, months, days, hours, minutes, seconds };
}

function HeartBackground() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 4,
        size: 10 + Math.random() * 22,
      })),
    []
  );

  return (
    <div className="heart-bg">
      {hearts.map((heart) => (
        <motion.span
          key={heart.id}
          className="absolute text-[#d4af7a]/40"
          style={{ left: `${heart.left}%`, fontSize: `${heart.size}px` }}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 0.9, 0.6, 0] }}
          transition={{ repeat: Infinity, duration: heart.duration, delay: heart.delay, ease: "linear" }}
        >
          ❤
        </motion.span>
      ))}
    </div>
  );
}

function TypingText({ text, speed = 45, className = "", onComplete }) {
  const [value, setValue] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setValue(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, onComplete]);

  const finished = value.length === text.length;
  return <p className={`${className} ${finished ? "" : "typing-cursor"}`}>{value}</p>;
}

function EntryGate({ onUnlock, onStartMusic, isPlaying }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (password.trim().toLowerCase() === CORRECT_PASSWORD) {
      onStartMusic();
      onUnlock();
      return;
    }
    setError("كلمة السر غير صحيحة، جربي مرة ثانية يا قلبي.");
  };

  return (
    <motion.section
      className="min-h-screen flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.form onSubmit={submit} className="glass w-full max-w-lg rounded-3xl p-6 md:p-10 text-center space-y-5" layout>
        <img
          src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=500&q=80"
          alt="صورتنا"
          className="w-36 h-36 rounded-full mx-auto object-cover border-4 border-[#d4af7a]/60"
        />
        <h1 className="font-tajawal text-3xl md:text-4xl gold-text">جاهزة يا أغلى ما عندي؟ ❤️</h1>
        <div className="glass rounded-2xl p-3 text-right">
          <div className="flex items-center gap-3">
            <img src={ALBUM_COVER} alt="غلاف الأغنية" className="w-14 h-14 rounded-xl object-cover" />
            <div className="flex-1">
              <p className="text-xs text-white/70">أغنيتنا</p>
              <p className="font-tajawal text-sm gold-text">{SONG_NAME}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStartMusic}
            className="mt-3 w-full rounded-xl bg-white/20 px-3 py-2 text-sm hover:bg-white/30 transition"
          >
            {isPlaying ? "الموسيقى شغالة 🎵" : "ابدئي الموسيقى"}
          </button>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="أدخلي كلمة السر الخاصة بنا"
          className="w-full rounded-2xl bg-white/15 border border-white/30 px-4 py-3 text-white placeholder:text-white/70 outline-none focus:ring-2 focus:ring-[#d4af7a]"
        />
        <button type="submit" className="w-full rounded-2xl bg-[#d4af7a] text-[#4A0404] font-bold py-3 hover:brightness-110 transition">
          فتح عالمنا
        </button>
        {error ? <p className="text-red-200 text-sm">{error}</p> : null}
      </motion.form>
    </motion.section>
  );
}

function MusicPlayer({ playing, onToggle }) {

  return (
    <div className="fixed bottom-4 left-4 z-30 glass rounded-2xl px-4 py-3 text-sm max-w-xs">
      <img src={ALBUM_COVER} alt="غلاف الألبوم" className="w-full h-24 object-cover rounded-xl mb-2" />
      <p className="font-tajawal gold-text">أغنيتنا المفضلة</p>
      <p className="text-white/85">{SONG_NAME}</p>
      <button onClick={onToggle} className="mt-2 rounded-xl bg-white/20 px-3 py-1.5">
        {playing ? "إيقاف" : "تشغيل"}
      </button>
    </div>
  );
}

function StoryCounter() {
  const [parts, setParts] = useState(getElapsedParts(START_DATE, new Date()));

  useEffect(() => {
    const id = setInterval(() => setParts(getElapsedParts(START_DATE, new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  const blocks = [
    ["سنين", parts.years],
    ["شهور", parts.months],
    ["أيام", parts.days],
    ["ساعات", parts.hours],
    ["دقائق", parts.minutes],
    ["ثواني", parts.seconds],
  ];

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <h2 className="font-tajawal text-2xl md:text-3xl gold-text mb-2">منذ أن أشرقت حياتي بك</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
        {blocks.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-black/20 p-4 text-center">
            <p className="text-3xl font-bold text-[#d4af7a]">{String(value).padStart(2, "0")}</p>
            <p className="text-sm text-white/80">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-[#d4af7a]/15 p-4">
        <p className="text-white/80">بدايتنا</p>
        <p className="font-amiri text-2xl gold-text">٣ أكتوبر ٢٠٢٥</p>
      </div>
    </section>
  );
}

function MemoryVault() {
  const [bursts, setBursts] = useState({});
  const [likes, setLikes] = useState(() => memoryItems.map(() => 0));
  const [pops, setPops] = useState({});

  const burst = (idx) => {
    setLikes((prev) => prev.map((v, i) => (i === idx ? v + 1 : v)));
    setPops((prev) => ({ ...prev, [idx]: Date.now() }));
    setTimeout(() => {
      setPops((prev) => {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
    }, 350);
    setBursts((prev) => ({ ...prev, [idx]: Date.now() }));
    setTimeout(() => {
      setBursts((prev) => {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
    }, 900);
  };

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <h2 className="font-tajawal text-2xl md:text-3xl gold-text mb-2">ذكرياتنا</h2>
      <p className="text-white/80 mb-5">أجمل اللحظات</p>
      <div className="memory-masonry">
        {memoryItems.map((item, idx) => (
          <div key={idx} className="memory-item glass rounded-2xl p-2 relative overflow-hidden">
            {item.type === "image" ? (
              <img src={item.src} alt="ذكرى" className="w-full rounded-xl object-cover" />
            ) : (
              <video src={item.src} controls className="w-full rounded-xl" />
            )}
            <motion.button
              onClick={() => burst(idx)}
              animate={pops[idx] ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              className="mt-3 w-full rounded-xl bg-[#d4af7a] text-[#4A0404] font-bold py-2 flex items-center justify-center gap-2"
            >
              <span>❤</span>
              <span>{likes[idx]}</span>
            </motion.button>
            <AnimatePresence>
              {bursts[idx] ? (
                <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-[#ffd7a8]"
                      style={{ left: "50%", top: "55%" }}
                      initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
                      animate={{
                        x: Math.cos((i / 12) * Math.PI * 2) * 65,
                        y: Math.sin((i / 12) * Math.PI * 2) * 65,
                        scale: 1.1,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      ❤
                    </motion.span>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

function LoveLetters() {
  const [index, setIndex] = useState(0);
  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <h2 className="font-tajawal text-2xl md:text-3xl gold-text mb-4">رسائل من القلب</h2>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          className="font-amiri text-3xl leading-relaxed min-h-44 text-[#ffe9cf]"
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 25 }}
          transition={{ duration: 0.45 }}
        >
          {letters[index]}
        </motion.p>
      </AnimatePresence>
      <button
        onClick={() => setIndex((prev) => (prev + 1) % letters.length)}
        className="mt-4 rounded-xl bg-white/20 px-4 py-2 hover:bg-white/30 transition"
      >
        الرسالة التالية
      </button>
    </section>
  );
}

function ReconciliationCorner() {
  const words = ["أنا آسف", "أحبك", "سامحيني"];
  const [msg, setMsg] = useState("مساحتنا الهادئة... حتى وقت الزعل.");
  return (
    <section className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-rose-100/20 to-orange-100/20 border border-white/25">
      <h2 className="font-tajawal text-2xl md:text-3xl gold-text mb-4">ركن التصالح</h2>
      <div className="flex flex-wrap gap-3">
        {words.map((word) => (
          <button key={word} onClick={() => setMsg(word)} className="rounded-xl bg-white/30 text-white px-4 py-2 hover:bg-white/40 transition">
            {word}
          </button>
        ))}
      </div>
      <p className="mt-5 text-xl font-amiri text-[#ffe9cf]">{msg}</p>
    </section>
  );
}

function EndingMessageSection() {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <section className="glass rounded-3xl p-6 md:p-8 text-center">
      <h3 className="font-tajawal text-2xl gold-text mb-4">رسالة أخيرة</h3>
      {!show ? (
        <button
          onClick={() => setShow(true)}
          className="rounded-xl bg-white/20 px-4 py-2 hover:bg-white/30 transition"
        >
          اضغطي لعرض الرسالة
        </button>
      ) : (
        <div className="space-y-5">
          <TypingText text={finalMessage} speed={40} className="font-amiri text-3xl leading-relaxed text-[#ffe9cf]" onComplete={() => setDone(true)} />
          {done ? (
            <a href="#memory-vault" className="inline-block rounded-xl bg-[#d4af7a] text-[#4A0404] font-bold px-5 py-2.5 hover:brightness-110 transition">
              ذكرياتنا
            </a>
          ) : null}
        </div>
      )}
    </section>
  );
}

function IntroMessage({ onNext }) {
  const [done, setDone] = useState(false);
  return (
    <motion.section
      className="min-h-screen flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="glass rounded-3xl p-6 md:p-10 w-full max-w-3xl text-center">
        <TypingText text={introMessage} className="font-amiri text-3xl md:text-4xl leading-relaxed text-[#ffe9cf]" onComplete={() => setDone(true)} />
        {done ? (
          <button
            onClick={onNext}
            className="mt-8 rounded-xl bg-[#d4af7a] text-[#4A0404] font-bold px-6 py-2.5 hover:brightness-110 transition"
          >
            التالي
          </button>
        ) : null}
      </div>
    </motion.section>
  );
}

function Sanctuary() {
  return (
    <motion.main className="page-shell max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <StoryCounter />
      <section id="memory-vault">
        <MemoryVault />
      </section>
      <LoveLetters />
      <ReconciliationCorner />
      <EndingMessageSection />
    </motion.main>
  );
}

function App() {
  const [stage, setStage] = useState("gate");
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const startMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      <HeartBackground />
      <audio ref={audioRef} id="ourSong" loop preload="none" src={SONG_URL} />
      <AnimatePresence mode="wait">
        {stage === "gate" ? (
          <EntryGate key="gate" onUnlock={() => setStage("intro")} onStartMusic={startMusic} isPlaying={playing} />
        ) : null}
        {stage === "intro" ? <IntroMessage key="intro" onNext={() => setStage("main")} /> : null}
        {stage === "main" ? <Sanctuary key="sanctuary" /> : null}
      </AnimatePresence>
      {stage !== "gate" ? <MusicPlayer playing={playing} onToggle={toggleMusic} /> : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
