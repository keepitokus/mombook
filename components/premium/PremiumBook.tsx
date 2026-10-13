"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
  const [solidNav, setSolidNav] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [album, setAlbum] = useState("all");
  const [featureIndex, setFeatureIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const [letter, setLetter] = useState<FamilyLetter | null>(null);
  const [video, setVideo] = useState<VideoMemory | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const [activeVoice, setActiveVoice] = useState<string | null>(null);
  const photoTriggerRef = useRef<HTMLElement | null>(null);
  const letterTriggerRef = useRef<HTMLElement | null>(null);

  const chapter = book.chapters[chapterIndex];
  const visiblePhotos = useMemo(
    () =>
      album === "all"
        ? book.photos
        : book.photos.filter((photo) => photo.album === album),
    [album, book.photos],
  );
  const feature = visiblePhotos[featureIndex] ?? visiblePhotos[0] ?? null;
  const openPhoto =
    photoIndex === null ? null : (visiblePhotos[photoIndex] ?? null);
  const [featuredLetter, ...otherLetters] = book.letters;
  const [heroVideo, ...restVideos] = book.videos;

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      setSolidNav(window.scrollY > 24);
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
    const onKey = (event: KeyboardEvent) => {
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

  const openChapter = (index: number) => {
    setChapterIndex(index);
    setMenuOpen(false);
    document.getElementById("chapters")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="premium-root">
      <div className="read-progress" aria-hidden="true">
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

      <header className={solidNav || menuOpen ? "topbar is-solid" : "topbar"}>
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
          <span className="sr-only">
            {menuOpen ? "Закрыть меню" : "Открыть меню"}
          </span>
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
            ["#contents", "Оглавление"],
            ["#chapters", "Главы"],
            ["#photos", "Архив"],
            ["#voices", "Голоса"],
            ["#letters", "Письма"],
            ["#closing", "Финал"],
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
            <p className="demo-note">{book.cover.demoNote}</p>
            <p className="hero-product">Премиальная книга</p>
            <h1>Мамина история</h1>
            <p className="hero-name">{book.cover.recipientName}</p>
            <p className="hero-tagline">{book.cover.tagline}</p>
            <p className="hero-lead">{book.cover.subtitle}</p>
            <a className="button" href="#dedication">
              Открыть историю
            </a>
          </div>
        </section>

        <section className="page dedication" id="dedication">
          <div className="page-inner">
            <p className="kicker">Посвящение</p>
            <h2 className="dedication-quote">{book.dedication.quote}</h2>
            <p className="dedication-body">{book.dedication.body}</p>
            <p className="signature">{book.dedication.signature}</p>
          </div>
        </section>

        <section className="page contents" id="contents">
          <div className="page-inner">
            <p className="kicker">Оглавление</p>
            <h2 className="page-title">Семь глав одной жизни</h2>
            <ol className="toc">
              {book.chapters.map((item, index) => (
                <li key={item.id}>
                  <button type="button" onClick={() => openChapter(index)}>
                    <span className="num">{item.number}</span>
                    <span className="title">{item.title}</span>
                    <span className="years">{item.years}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="reader" id="chapters">
          <div className="reader-inner">
            <p className="kicker">Главы</p>
            <h2 className="page-title">Хронология</h2>
            <div className="reader-layout">
              <div className="chapter-rail" aria-label="Выбор главы">
                {book.chapters.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={index === chapterIndex ? "active" : undefined}
                    aria-current={index === chapterIndex ? "true" : undefined}
                    onClick={() => setChapterIndex(index)}
                  >
                    <small>
                      {item.number} · {item.years}
                    </small>
                    <strong>{item.title}</strong>
                  </button>
                ))}
              </div>
              <article className="spread" aria-live="polite">
                <div
                  className="spread-visual"
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgba(18,15,12,0.2), transparent 55%), url("${chapter.image}")`,
                  }}
                >
                  <span className="spread-years">{chapter.years}</span>
                </div>
                <div className="spread-copy">
                  <p className="spread-era">{chapter.eraLabel}</p>
                  <p className="spread-place">{chapter.place}</p>
                  <h3>{chapter.title}</h3>
                  <p className="spread-story">{chapter.story}</p>
                  <blockquote>{chapter.memory}</blockquote>
                  <div className="spread-controls">
                    <button
                      type="button"
                      className="text-btn"
                      disabled={chapterIndex === 0}
                      onClick={() => setChapterIndex((i) => i - 1)}
                    >
                      ← Назад
                    </button>
                    <span className="spread-count">
                      {chapterIndex + 1} / {book.chapters.length}
                    </span>
                    <button
                      type="button"
                      className="text-btn"
                      disabled={chapterIndex === book.chapters.length - 1}
                      onClick={() => setChapterIndex((i) => i + 1)}
                    >
                      Далее →
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="archive" id="photos">
          <div className="archive-inner">
            <p className="kicker">Семейный фотоархив</p>
            <h2 className="page-title">Моменты, к которым хочется возвращаться</h2>
            <div className="album-tabs" aria-label="Альбомы">
              <button
                type="button"
                className={album === "all" ? "active" : undefined}
                aria-pressed={album === "all"}
                onClick={() => {
                  setAlbum("all");
                  setFeatureIndex(0);
                }}
              >
                Все
              </button>
              {book.albums.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={album === item.id ? "active" : undefined}
                  aria-pressed={album === item.id}
                  onClick={() => {
                    setAlbum(item.id);
                    setFeatureIndex(0);
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>
            {feature ? (
              <div className="archive-stage">
                <button
                  type="button"
                  className="feature-frame"
                  onClick={(event) => {
                    photoTriggerRef.current = event.currentTarget;
                    setPhotoIndex(featureIndex);
                  }}
                >
                  <img
                    src={feature.image}
                    alt={`${feature.title}. ${feature.caption}`}
                    width={864}
                    height={1152}
                  />
                  <div className="feature-meta">
                    <strong>{feature.title}</strong>
                    <span>{feature.year}</span>
                    <p>{feature.caption}</p>
                  </div>
                </button>
                <div className="thumb-strip">
                  {visiblePhotos.map((photo, index) => (
                    <button
                      key={photo.id}
                      type="button"
                      className={index === featureIndex ? "active" : undefined}
                      onClick={() => setFeatureIndex(index)}
                    >
                      <img
                        src={photo.image}
                        alt={photo.title}
                        loading="lazy"
                        width={400}
                        height={400}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="empty-note">В этом альбоме пока нет снимков.</p>
            )}
          </div>
        </section>

        <section className="voices-page" id="voices">
          <div className="page-inner">
            <p className="kicker">Голоса близких</p>
            <h2 className="page-title">Голоса, которые хочется слышать</h2>
            <p className="page-lead">
              Короткие воспоминания. Воспроизводятся только по нажатию —
              одновременно звучит одна запись.
            </p>
            <div className="voice-list">
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

        <section className="video-page" id="videos">
          <div className="page-inner">
            <p className="kicker">Видеоархив</p>
            <h2 className="page-title">Моменты, которые можно прожить снова</h2>
            <div className="film-frame">
              {heroVideo ? (
                <div className="film-hero">
                  <div
                    className="film-poster"
                    style={
                      heroVideo.poster
                        ? ({
                            backgroundImage: `url("${heroVideo.poster}")`,
                          } as CSSProperties)
                        : undefined
                    }
                  />
                  <div className="film-copy">
                    <h3>{heroVideo.title}</h3>
                    <p>{heroVideo.description}</p>
                    {heroVideo.duration ? (
                      <p>Длительность: {heroVideo.duration}</p>
                    ) : null}
                    {heroVideo.src || heroVideo.sources?.length ? (
                      <button
                        type="button"
                        className="button"
                        onClick={() => {
                          setActiveVoice(null);
                          setVideo(heroVideo);
                        }}
                      >
                        Смотреть
                      </button>
                    ) : (
                      <span className="video-placeholder">
                        В вашей книге здесь будет семейный ролик
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
              <div className="film-list">
                {restVideos.map((item) => (
                  <article key={item.id} className="film-item">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    {item.duration ? <p>{item.duration}</p> : null}
                    <span className="video-placeholder">
                      Пример размещения видео
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="letters-page" id="letters">
          <div className="page-inner">
            <p className="kicker">Письма маме</p>
            <h2 className="page-title">Есть слова, которые хочется сохранить</h2>
            <div className="letters-layout">
              {featuredLetter ? (
                <article className="letter-sheet">
                  <p className="relation">{featuredLetter.relation}</p>
                  <h3>От {featuredLetter.from}</h3>
                  <p className="preview">{featuredLetter.preview}</p>
                  <button
                    type="button"
                    className="button"
                    style={{ marginTop: "1.2rem", width: "fit-content" }}
                    onClick={(event) => {
                      letterTriggerRef.current = event.currentTarget;
                      setLetter(featuredLetter);
                    }}
                  >
                    Открыть письмо
                  </button>
                </article>
              ) : null}
              <div className="letter-side">
                {otherLetters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="letter-mini"
                    onClick={(event) => {
                      letterTriggerRef.current = event.currentTarget;
                      setLetter(item);
                    }}
                  >
                    <p className="relation">{item.relation}</p>
                    <strong>{item.from}</strong>
                    <span>{item.preview}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="closing" id="closing">
          <div className="page-inner">
            <h2>{book.closing.title}</h2>
            {book.closing.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="signature">{book.closing.signature}</p>
          </div>
        </section>

        <section className="colophon" id="order">
          <div className="page-inner">
            <p className="kicker">После книги</p>
            <h2 className="page-title">{book.commercial.title}</h2>
            <p className="page-lead">{book.commercial.subtitle}</p>
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
            <p className="colophon-note">
              Это демонстрация проекта «Я здесь». Базовая книга доступна на
              главной странице демо-сайта.
            </p>
          </div>
        </section>
      </main>

      {openPhoto ? (
        <Lightbox
          photo={openPhoto}
          onClose={() => {
            setPhotoIndex(null);
            photoTriggerRef.current?.focus();
          }}
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
            if (event.target === event.currentTarget) {
              setLetter(null);
              letterTriggerRef.current?.focus();
            }
          }}
        >
          <button
            className="modal-close"
            type="button"
            aria-label="Закрыть письмо"
            onClick={() => {
              setLetter(null);
              letterTriggerRef.current?.focus();
            }}
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
    if (!isActive) audioRef.current?.pause();
  }, [isActive]);

  if (!voice.src) {
    return (
      <article className="voice-card">
        <div>
          <p className="relation">{voice.relation}</p>
          <h3>{voice.name}</h3>
          <blockquote>{voice.quote}</blockquote>
        </div>
        <div className="audio-missing">
          Аудиозапись появится в персональной книге.
        </div>
      </article>
    );
  }

  return (
    <article className={playing ? "voice-card is-playing" : "voice-card"}>
      <div>
        <p className="relation">{voice.relation}</p>
        <h3>{voice.name}</h3>
        <blockquote>{voice.quote}</blockquote>
      </div>
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
  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр фотографии"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onTouchStart={(event) => {
        touchX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchX.current == null) return;
        const dx =
          (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
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
