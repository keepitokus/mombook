"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import type {
  AudioMemory,
  FamilyLetter,
  PhotoMemory,
  PremiumBook as PremiumBookData,
  VideoMemory,
} from "../../lib/premium/types";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PremiumBook({ book }: { book: PremiumBookData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [album, setAlbum] = useState<string>("all");
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const [letter, setLetter] = useState<FamilyLetter | null>(null);
  const [video, setVideo] = useState<VideoMemory | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const [activeVoice, setActiveVoice] = useState<string | null>(null);
  const photoTriggerRef = useRef<HTMLButtonElement | null>(null);
  const letterTriggerRef = useRef<HTMLButtonElement | null>(null);

  const chapter = book.chapters[chapterIndex];
  const visiblePhotos = useMemo(
    () =>
      album === "all"
        ? book.photos
        : book.photos.filter((photo) => photo.album === album),
    [album, book.photos],
  );
  const openPhoto =
    photoIndex === null ? null : (visiblePhotos[photoIndex] ?? null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "modal-open",
      Boolean(menuOpen || openPhoto || letter || video),
    );
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        if (openPhoto) setPhotoIndex(null);
        else if (letter) setLetter(null);
        else if (video) setVideo(null);
        else setMenuOpen(false);
      }
      if (photoIndex === null) return;
      if (event.key === "ArrowRight") {
        setPhotoIndex((i) =>
          i === null ? i : (i + 1) % visiblePhotos.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setPhotoIndex((i) =>
          i === null ? i : (i - 1 + visiblePhotos.length) % visiblePhotos.length,
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, openPhoto, letter, video, photoIndex, visiblePhotos.length]);

  useEffect(() => {
    if (photoIndex === null) photoTriggerRef.current?.focus();
  }, [photoIndex]);

  useEffect(() => {
    if (!letter) letterTriggerRef.current?.focus();
  }, [letter]);

  return (
    <div className="premium-root">
      <div className="progress-bar" aria-hidden="true">
        <span style={{ width: `${readProgress}%` }} />
      </div>

      {menuOpen ? (
        <button
          className="nav-overlay is-open"
          type="button"
          aria-label="Закрыть меню"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <header className="topbar">
        <a
          className="brand"
          href="#cover"
          aria-label="Я здесь, к началу книги"
          onClick={() => setMenuOpen(false)}
        >
          <img
            className="brand-logo"
            src="/ya-zdes-logo.jpg"
            alt=""
            width={112}
            height={112}
          />
        </a>
        <button
          className={menuOpen ? "menu-toggle is-open" : "menu-toggle"}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="premium-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Закрыть меню" : "Открыть меню"}</span>
          <span className="bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>
        <nav
          className={menuOpen ? "nav-links is-open" : "nav-links"}
          id="premium-menu"
          aria-label="Разделы книги"
        >
          {[
            ["#dedication", "Посвящение"],
            ["#chapters", "История"],
            ["#photos", "Фото"],
            ["#videos", "Видео"],
            ["#voices", "Голоса"],
            ["#letters", "Письма"],
            ["#order", "Заказать"],
          ].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="hero is-ready" id="cover">
          <div
            className="hero-media"
            style={{ backgroundImage: `url("${book.cover.image}")` }}
            aria-hidden="true"
          />
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-inner">
            <span className="demo-note">{book.cover.demoNote}</span>
            <h1>{book.cover.recipientName}</h1>
            <p className="tagline">{book.cover.tagline}</p>
            <p className="subtitle">{book.cover.subtitle}</p>
            <div className="hero-actions">
              <a className="button" href="#dedication">
                {book.cover.ctaLabel}
              </a>
            </div>
          </div>
          <div className="scroll-hint" aria-hidden="true">
            <span>Листать</span>
            <i />
          </div>
        </section>

        <section className="section dedication" id="dedication">
          <div className="wrap">
            <div className="ornament" aria-hidden="true">
              ✧
            </div>
            <p className="eyebrow">Посвящение</p>
            <h2 className="dedication-quote">{book.dedication.quote}</h2>
            <p className="lead">{book.dedication.body}</p>
            <p className="signature">{book.dedication.signature}</p>
          </div>
        </section>

        <section className="section chapters" id="chapters">
          <div className="wrap">
            <p className="eyebrow">Семь глав одной истории</p>
            <h2 className="section-title">Хронология жизни</h2>
            <p className="lead">
              От бабушкиного дома у реки до сегодняшнего дня — главы, которые можно
              листать как страницы дорогой книги.
            </p>
            <div className="chapter-layout">
              <div className="chapter-nav" role="tablist" aria-label="Главы книги">
                {book.chapters.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={index === chapterIndex ? "active" : undefined}
                    aria-current={index === chapterIndex ? "step" : undefined}
                    onClick={() => setChapterIndex(index)}
                  >
                    <span className="num">{item.number}</span>
                    <span className="meta">
                      <small>
                        {item.eraLabel} · {item.years}
                      </small>
                      <strong>{item.title}</strong>
                    </span>
                  </button>
                ))}
              </div>
              <article className="chapter-scene" aria-live="polite">
                <div
                  className="chapter-visual"
                  style={{
                    backgroundImage: `linear-gradient(0deg, #261c1930, transparent 55%), url("${chapter.image}")`,
                  }}
                >
                  <span className="years">{chapter.years}</span>
                </div>
                <div className="chapter-progress" aria-hidden="true">
                  <span
                    style={{
                      width: `${((chapterIndex + 1) / book.chapters.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="chapter-body">
                  <p className="place">{chapter.place}</p>
                  <h3>{chapter.title}</h3>
                  <p className="story">{chapter.story}</p>
                  <p className="chapter-memory">{chapter.memory}</p>
                  <div className="chapter-controls">
                    <button
                      className="text-btn"
                      type="button"
                      disabled={chapterIndex === 0}
                      onClick={() => setChapterIndex((i) => i - 1)}
                    >
                      ← Назад
                    </button>
                    <span className="count">
                      {chapterIndex + 1} / {book.chapters.length}
                    </span>
                    <button
                      className="text-btn"
                      type="button"
                      disabled={chapterIndex === book.chapters.length - 1}
                      onClick={() => setChapterIndex((i) => i + 1)}
                    >
                      Следующая глава →
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section gallery" id="photos">
          <div className="wrap">
            <p className="eyebrow">Семейный фотоархив</p>
            <h2 className="section-title">Моменты, к которым хочется возвращаться</h2>
            <p className="lead">
              Двенадцать кадров из демонстрационного архива семьи Соколовых — с
              подписями, годами и полноэкранным просмотром.
            </p>
            <div className="album-tabs" role="tablist" aria-label="Альбомы">
              <AlbumTab
                label="Все"
                active={album === "all"}
                onClick={() => setAlbum("all")}
              />
              {book.albums.map((item) => (
                <AlbumTab
                  key={item.id}
                  label={item.title}
                  active={album === item.id}
                  onClick={() => setAlbum(item.id)}
                />
              ))}
            </div>
            <div className="gallery-grid">
              {visiblePhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  className="photo-card"
                  onClick={(event) => {
                    photoTriggerRef.current = event.currentTarget;
                    setPhotoIndex(index);
                  }}
                >
                  <img
                    src={photo.image}
                    alt={`${photo.title}. ${photo.caption}`}
                    loading="lazy"
                    decoding="async"
                    width={864}
                    height={1152}
                  />
                  <div className="meta">
                    <strong>{photo.title}</strong>
                    <small>{photo.year}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section videos" id="videos">
          <div className="wrap">
            <p className="eyebrow">Видеоархив</p>
            <h2 className="section-title">Моменты, которые можно прожить снова</h2>
            <p className="lead">
              В персональной книге здесь появятся ваши семейные ролики. В этой
              демонстрации показан пример размещения без ложного воспроизведения.
            </p>
            <div className="video-grid">
              {book.videos.map((item) => (
                <VideoCard key={item.id} video={item} onPlay={setVideo} />
              ))}
            </div>
          </div>
        </section>

        <section className="section voices" id="voices">
          <div className="wrap">
            <p className="eyebrow">Голоса близких</p>
            <h2 className="section-title">Голоса, которые хочется слышать</h2>
            <p className="lead">
              Короткие воспоминания от дочери, сына и мужа. Демо-дорожки запускаются
              только по нажатию; одновременно играет одна запись.
            </p>
            <div className="voice-grid">
              {book.voices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  voice={voice}
                  isActive={activeVoice === voice.id}
                  onPlay={() => setActiveVoice(voice.id)}
                  onStop={() =>
                    setActiveVoice((current) =>
                      current === voice.id ? null : current,
                    )
                  }
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section letters" id="letters">
          <div className="wrap">
            <p className="eyebrow">Письма маме</p>
            <h2 className="section-title">Есть слова, которые хочется сохранить</h2>
            <p className="lead">
              Три письма близких — на бумаге, которую можно открыть целиком и закрыть
              с клавиатуры.
            </p>
            <div className="letter-grid">
              {book.letters.map((item) => (
                <article key={item.id} className="letter-card">
                  <p className="relation">{item.relation}</p>
                  <blockquote>{item.preview}</blockquote>
                  <button
                    type="button"
                    className="button soft open-letter"
                    onClick={(event) => {
                      letterTriggerRef.current = event.currentTarget;
                      setLetter(item);
                    }}
                  >
                    Открыть письмо
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section closing" id="closing">
          <div className="wrap">
            <h2>{book.closing.title}</h2>
            {book.closing.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="signature">{book.closing.signature}</p>
          </div>
        </section>

        <section className="section commercial" id="order">
          <div className="wrap">
            <p className="eyebrow">Проект «Я здесь»</p>
            <h2 className="section-title">{book.commercial.title}</h2>
            <p className="lead">{book.commercial.subtitle}</p>
            <p className="price">{book.commercial.price}</p>
            <a
              className="button"
              href={book.commercial.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {book.commercial.ctaLabel}
            </a>
            <p className="occasion">{book.commercial.occasionNote}</p>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          Демонстрационная книга проекта «Я здесь». Персонажи и история вымышлены.
          Базовая версия доступна на главной странице демо-сайта.
        </p>
      </footer>

      {openPhoto ? (
        <Lightbox
          photo={openPhoto}
          onClose={() => setPhotoIndex(null)}
          onPrev={() =>
            setPhotoIndex((i) =>
              i === null
                ? i
                : (i - 1 + visiblePhotos.length) % visiblePhotos.length,
            )
          }
          onNext={() =>
            setPhotoIndex((i) =>
              i === null ? i : (i + 1) % visiblePhotos.length,
            )
          }
        />
      ) : null}

      {letter ? (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label="Письмо"
          onClick={(event) => {
            if (event.target === event.currentTarget) setLetter(null);
          }}
        >
          <button
            className="modal-close"
            type="button"
            aria-label="Закрыть письмо"
            onClick={() => setLetter(null)}
          >
            ×
          </button>
          <div className="letter-modal-card">
            <p className="relation">{letter.relation}</p>
            <h3>Письмо от {letter.from}</h3>
            <div className="body">{letter.body}</div>
            <p className="signature">{letter.signature}</p>
          </div>
        </div>
      ) : null}

      {video?.src || video?.sources?.length ? (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label="Видео"
          onClick={(event) => {
            if (event.target === event.currentTarget) setVideo(null);
          }}
        >
          <button
            className="modal-close"
            type="button"
            aria-label="Закрыть видео"
            onClick={() => setVideo(null)}
          >
            ×
          </button>
          <video
            controls
            playsInline
            autoPlay
            poster={video.poster}
            style={{
              width: "min(920px, 96vw)",
              maxHeight: "72vh",
              background: "#000",
            }}
            src={video.src}
          >
            {video.sources?.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        </div>
      ) : null}
    </div>
  );
}

function AlbumTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "active" : undefined}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function VideoCard({
  video,
  onPlay,
}: {
  video: VideoMemory;
  onPlay: (video: VideoMemory) => void;
}) {
  const hasSource = Boolean(video.src || video.sources?.length);
  return (
    <article className="video-card">
      <div
        className="video-poster"
        style={
          video.poster
            ? ({ backgroundImage: `url("${video.poster}")` } as CSSProperties)
            : undefined
        }
      >
        {video.duration ? <span className="badge">{video.duration}</span> : null}
      </div>
      <div className="video-body">
        <h3>{video.title}</h3>
        <p>{video.description}</p>
        {hasSource ? (
          <button
            type="button"
            className="button soft"
            style={{ marginTop: "1rem" }}
            onClick={() => onPlay(video)}
          >
            Смотреть
          </button>
        ) : (
          <span className="video-placeholder">Пример размещения видео</span>
        )}
      </div>
    </article>
  );
}

function VoiceCard({
  voice,
  isActive,
  onPlay,
  onStop,
}: {
  voice: AudioMemory;
  isActive: boolean;
  onPlay: () => void;
  onStop: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isActive) {
      audioRef.current?.pause();
    }
  }, [isActive]);

  if (!voice.src) {
    return (
      <article className="voice-card">
        <p className="relation">{voice.relation}</p>
        <h3>{voice.name}</h3>
        <blockquote>{voice.quote}</blockquote>
        <div className="audio-missing">
          Аудиозапись появится в персональной книге.
        </div>
      </article>
    );
  }

  return (
    <article className="voice-card">
      <p className="relation">{voice.relation}</p>
      <h3>{voice.name}</h3>
      <blockquote>{voice.quote}</blockquote>
      <div className="audio-player">
        <div className="audio-row">
          <button
            type="button"
            className="play-btn"
            aria-label={`Слушать голос: ${voice.name}`}
            aria-pressed={playing}
            onClick={async () => {
              const audio = audioRef.current;
              if (!audio) return;
              if (audio.paused) {
                onPlay();
                try {
                  await audio.play();
                  setPlaying(true);
                } catch {
                  setPlaying(false);
                }
              } else {
                audio.pause();
                setPlaying(false);
                onStop();
              }
            }}
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <span className="time">
            {formatTime(current)} / {formatTime(duration)}
          </span>
        </div>
        <input
          className="seek"
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={current}
          aria-label="Позиция воспроизведения"
          onChange={(event) => {
            const value = Number(event.target.value);
            if (audioRef.current) audioRef.current.currentTime = value;
            setCurrent(value);
          }}
        />
        <audio
          ref={audioRef}
          preload="none"
          src={voice.src}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
          onEnded={() => {
            setPlaying(false);
            onStop();
          }}
          onPause={() => setPlaying(false)}
        />
      </div>
    </article>
  );
}

function Lightbox({
  photo,
  onClose,
  onPrev,
  onNext,
}: {
  photo: PhotoMemory;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const touchX = useRef<number | null>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") onClose();
  };

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр фотографии"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
      onTouchStart={(event) => {
        touchX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchX.current == null) return;
        const dx = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (Math.abs(dx) > 48) {
          if (dx < 0) onNext();
          else onPrev();
        }
        touchX.current = null;
      }}
    >
      <button
        className="modal-close"
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
      >
        ×
      </button>
      <figure className="lightbox-figure">
        <img src={photo.image} alt={`${photo.title}. ${photo.caption}`} />
        <figcaption>
          <strong>{photo.title}</strong> · {photo.year}
          <br />
          {photo.caption}
        </figcaption>
        <div className="lightbox-nav">
          <button type="button" aria-label="Предыдущее фото" onClick={onPrev}>
            ←
          </button>
          <button type="button" aria-label="Следующее фото" onClick={onNext}>
            →
          </button>
        </div>
      </figure>
    </div>
  );
}
