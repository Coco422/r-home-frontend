import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { profile } from "./content/profile";
import { ToolsIndex } from "./tools/ToolsIndex";
import { VramCalculator } from "./tools/VramCalculator";

const preloadAssets = [
  "/media/hero-symbol.webp",
  "/media/peak-cover.webp",
  "/media/blog-logo-old.webp",
  "/media/name-anluoying-ink.webp",
];

const navLinks = [
  {
    label: "文",
    ariaLabel: "打开个人博客",
    href: profile.blogUrl,
    external: true,
  },
  {
    label: "码",
    ariaLabel: "打开 GitHub 主页",
    href: profile.githubUrl,
    external: true,
  },
  {
    label: "器",
    ariaLabel: "打开工具页",
    href: profile.toolsUrl,
    external: false,
  },
];

function HomePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<"loading" | "playing" | "paused">("loading");
  const [loadProgress, setLoadProgress] = useState(0.04);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let closed = false;
    let doneCount = 0;
    const total = preloadAssets.length + 1;
    const timers: number[] = [];

    const finishOne = () => {
      if (closed) return;
      doneCount += 1;
      const next = doneCount / total;
      setLoadProgress(Math.max(0.08, next));

      if (doneCount >= total) {
        setLoadProgress(1);
        setIsLoaded(true);
        timers.push(
          window.setTimeout(() => {
            if (!closed) {
              setShowLoader(false);
            }
          }, 260),
        );
      }
    };

    const imageCleanups = preloadAssets.map((src) => {
      const image = new window.Image();
      let settled = false;
      const onDone = () => {
        if (settled) return;
        settled = true;
        finishOne();
      };

      image.onload = onDone;
      image.onerror = onDone;
      image.src = src;
      if (image.complete) {
        window.setTimeout(onDone, 0);
      }

      return () => {
        image.onload = null;
        image.onerror = null;
      };
    });

    let audioSettled = false;
    const onAudioReady = () => {
      if (audioSettled) return;
      audioSettled = true;
      finishOne();
    };

    audio.preload = "auto";
    audio.addEventListener("canplaythrough", onAudioReady, { once: true });
    audio.addEventListener("error", onAudioReady, { once: true });
    if (audio.readyState >= 4) {
      window.setTimeout(onAudioReady, 0);
    } else {
      audio.load();
    }
    timers.push(window.setTimeout(onAudioReady, 4200));

    return () => {
      closed = true;
      audio.removeEventListener("canplaythrough", onAudioReady);
      audio.removeEventListener("error", onAudioReady);
      imageCleanups.forEach((cleanup) => cleanup());
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const audio = audioRef.current;
    if (!audio) return;

    let closed = false;

    const tryPlay = async () => {
      if (closed) return;

      try {
        audio.volume = 0.42;
        await audio.play();
      } catch {
        if (!closed) {
          setAudioState("paused");
        }
      }
    };

    const syncPlaying = () => setAudioState("playing");
    const syncPaused = () => setAudioState("paused");
    const unlock = (event: PointerEvent | KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest(".music-disc")) {
        return;
      }
      if (audio.paused) {
        void tryPlay();
      }
    };

    audio.loop = true;
    audio.addEventListener("play", syncPlaying);
    audio.addEventListener("pause", syncPaused);
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    void tryPlay();

    return () => {
      closed = true;
      audio.pause();
      audio.removeEventListener("play", syncPlaying);
      audio.removeEventListener("pause", syncPaused);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [isLoaded]);

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setAudioState("paused");
      return;
    }

    try {
      await audio.play();
      setAudioState("playing");
    } catch {
      setAudioState("paused");
    }
  };

  return (
    <div className="page">
      <audio ref={audioRef} src="/media/peak-of-the-first-stroke.mp3" />
      {showLoader ? (
        <div className={`loader${isLoaded ? " loader--done" : ""}`} aria-live="polite" aria-label="资源加载中">
          <div className="loader-frost" />
          <div className="loader-core">
            <img className="loader-seal" src="/media/blog-logo-old.webp" alt="" aria-hidden="true" />
            <div className="loader-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(loadProgress * 100)}>
              <span style={{ transform: `scaleX(${loadProgress})` }} />
            </div>
          </div>
        </div>
      ) : null}

      <header className="topbar">
        <div className="shell topbar-inner">
          <a className="brand" href="#top" aria-label="返回顶部">
            <img className="brand-mark" src="/media/blog-logo-old.webp" alt="" aria-hidden="true" />
          </a>

          <nav className="topnav" aria-label="站点入口">
            {navLinks.map((link) => (
              <a key={link.href} className="topnav-link" href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noreferrer" : undefined} aria-label={link.ariaLabel}>
                {link.label}
              </a>
            ))}
          </nav>

          <button
            className={`music-disc music-disc--${audioState}`}
            type="button"
            onClick={toggleAudio}
            aria-label={audioState === "playing" ? "暂停背景音乐" : "播放背景音乐"}
            aria-pressed={audioState === "playing"}
          >
            <span className="music-disc-art" aria-hidden="true" />
            <span className="music-disc-icon" aria-hidden="true">
              {audioState === "playing" ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </span>
          </button>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-wash" />
          <div className="hero-visual">
            <img className="hero-symbol" src="/media/hero-symbol.webp" alt="" aria-hidden="true" />
          </div>

          <div className="hero-inner shell">
            <div className="hero-copy">
              <h1 className="hero-name">
                <img src="/media/name-anluoying-ink.webp" alt={profile.chineseName} />
              </h1>
              <p className="hero-signature">{profile.signature}</p>
              <p className="hero-motto">{profile.motto}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/tools") return <ToolsIndex />;
  if (pathname === "/tools/vram-calculator") return <VramCalculator />;
  return <HomePage />;
}

export default App;
