import { book } from "./data.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "className") node.className = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === false || value == null) continue;
    else if (key === "checked" || key === "hidden" || key === "disabled") {
      node[key] = Boolean(value);
    } else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

function initProgress() {
  const bar = document.querySelector("[data-read-progress]");
  if (!bar) return;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    bar.style.width = `${value}%`;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initReveal() {
  const nodes = document.querySelectorAll(".reveal, .handwrite");
  if (reduceMotion) {
    nodes.forEach((n) => n.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );
  nodes.forEach((n) => io.observe(n));
}

function initMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const links = document.querySelector("[data-nav-links]");
  const overlay = document.querySelector("[data-nav-overlay]");
  if (!toggle || !links || !overlay) return;

  const close = () => {
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    links.classList.remove("is-open");
    overlay.classList.remove("is-open");
    overlay.hidden = true;
  };

  const open = () => {
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    links.classList.add("is-open");
    overlay.classList.add("is-open");
    overlay.hidden = false;
  };

  toggle.addEventListener("click", () => {
    if (toggle.classList.contains("is-open")) close();
    else open();
  });
  overlay.addEventListener("click", close);
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function initChapters() {
  const { chapters } = book;
  const nav = document.querySelector("[data-chapter-nav]");
  const visual = document.querySelector("[data-chapter-visual]");
  const years = document.querySelector("[data-chapter-years]");
  const place = document.querySelector("[data-chapter-place]");
  const title = document.querySelector("[data-chapter-title]");
  const story = document.querySelector("[data-chapter-story]");
  const memory = document.querySelector("[data-chapter-memory]");
  const body = document.querySelector("[data-chapter-body]");
  const progress = document.querySelector("[data-chapter-progress]");
  const count = document.querySelector("[data-chapter-count]");
  const prev = document.querySelector("[data-chapter-prev]");
  const next = document.querySelector("[data-chapter-next]");
  if (!nav || !visual) return;

  let active = 0;

  chapters.forEach((chapter, index) => {
    const btn = el("button", {
      type: "button",
      className: index === 0 ? "active" : "",
      onClick: () => show(index),
    }, [
      el("span", { className: "num", text: chapter.number }),
      el("span", { className: "meta" }, [
        el("small", { text: `${chapter.eraLabel} · ${chapter.years}` }),
        el("strong", { text: chapter.title }),
      ]),
    ]);
    nav.append(btn);
  });

  function show(index) {
    active = Math.max(0, Math.min(chapters.length - 1, index));
    const chapter = chapters[active];
    visual.style.backgroundImage = `linear-gradient(0deg, #261c1930, transparent 55%), url("${chapter.image}")`;
    years.textContent = chapter.years;
    place.textContent = chapter.place;
    title.textContent = chapter.title;
    story.textContent = chapter.story;
    memory.textContent = chapter.memory;
    progress.style.width = `${((active + 1) / chapters.length) * 100}%`;
    count.textContent = `${active + 1} / ${chapters.length}`;
    prev.disabled = active === 0;
    next.disabled = active === chapters.length - 1;
    nav.querySelectorAll("button").forEach((btn, i) => {
      const isActive = i === active;
      btn.classList.toggle("active", isActive);
      if (isActive) btn.setAttribute("aria-current", "step");
      else btn.removeAttribute("aria-current");
    });
    if (!reduceMotion && body) {
      body.classList.remove("is-fading");
      void body.offsetWidth;
      body.classList.add("is-fading");
    }
  }

  prev.addEventListener("click", () => show(active - 1));
  next.addEventListener("click", () => show(active + 1));
  show(0);
}

function initGallery() {
  const tabs = document.querySelector("[data-album-tabs]");
  const grid = document.querySelector("[data-gallery-grid]");
  const modal = document.querySelector("[data-lightbox]");
  const image = document.querySelector("[data-lightbox-image]");
  const caption = document.querySelector("[data-lightbox-caption]");
  const closeBtn = document.querySelector("[data-lightbox-close]");
  const prevBtn = document.querySelector("[data-lightbox-prev]");
  const nextBtn = document.querySelector("[data-lightbox-next]");
  if (!tabs || !grid || !modal) return;

  let album = "all";
  let openIndex = null;
  let lastFocus = null;
  let visible = [...book.photos];

  const albums = [{ id: "all", title: "Все" }, ...book.albums];

  albums.forEach((item) => {
    tabs.append(
      el("button", {
        type: "button",
        className: item.id === "all" ? "active" : "",
        "aria-pressed": item.id === "all" ? "true" : "false",
        onClick: () => {
          album = item.id;
          tabs.querySelectorAll("button").forEach((btn) => {
            const active = btn.textContent === item.title;
            btn.classList.toggle("active", active);
            btn.setAttribute("aria-pressed", active ? "true" : "false");
          });
          renderGrid();
        },
        text: item.title,
      }),
    );
  });

  function renderGrid() {
    visible =
      album === "all"
        ? [...book.photos]
        : book.photos.filter((photo) => photo.album === album);
    grid.replaceChildren();
    visible.forEach((photo, index) => {
      const btn = el("button", {
        type: "button",
        className: "photo-card",
        onClick: () => open(index, btn),
      }, [
        el("img", {
          src: photo.image,
          alt: `${photo.title}. ${photo.caption}`,
          loading: "lazy",
          decoding: "async",
          width: "864",
          height: "1152",
        }),
        el("div", { className: "meta" }, [
          el("strong", { text: photo.title }),
          el("small", { text: photo.year }),
        ]),
      ]);
      grid.append(btn);
    });
  }

  function open(index, trigger) {
    openIndex = index;
    lastFocus = trigger || document.activeElement;
    const photo = visible[openIndex];
    image.src = photo.image;
    image.alt = `${photo.title}. ${photo.caption}`;
    caption.innerHTML = `<strong>${photo.title}</strong> · ${photo.year}<br>${photo.caption}`;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    closeBtn.focus();
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    openIndex = null;
    lastFocus?.focus?.();
  }

  function step(delta) {
    if (openIndex == null || !visible.length) return;
    openIndex = (openIndex + delta + visible.length) % visible.length;
    open(openIndex, lastFocus);
  }

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  let touchX = null;
  modal.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.changedTouches[0]?.clientX ?? null;
    },
    { passive: true },
  );
  modal.addEventListener(
    "touchend",
    (e) => {
      if (touchX == null || modal.hidden) return;
      const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX;
      if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
      touchX = null;
    },
    { passive: true },
  );

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  renderGrid();
}

function initVoices() {
  const grid = document.querySelector("[data-voice-grid]");
  if (!grid) return;

  /** @type {HTMLAudioElement | null} */
  let currentAudio = null;
  /** @type {(() => void) | null} */
  let currentSync = null;

  book.voices.forEach((voice) => {
    const card = el("article", { className: "voice-card reveal" }, [
      el("p", { className: "relation", text: voice.relation }),
      el("h3", { text: voice.name }),
      el("blockquote", { text: voice.quote }),
    ]);

    if (!voice.src) {
      card.append(
        el("div", {
          className: "audio-missing",
          text: "Аудиозапись появится в персональной книге.",
        }),
      );
      grid.append(card);
      return;
    }

    const audio = el("audio", {
      preload: "none",
      src: voice.src,
    });
    const playBtn = el("button", {
      type: "button",
      className: "play-btn",
      "aria-label": `Слушать голос: ${voice.name}`,
      "aria-pressed": "false",
      text: "▶",
    });
    const time = el("span", { className: "time", text: "0:00 / 0:00" });
    const seek = el("input", {
      className: "seek",
      type: "range",
      min: "0",
      max: "0",
      value: "0",
      step: "0.01",
      "aria-label": "Позиция воспроизведения",
    });

    const sync = () => {
      seek.max = String(audio.duration || 0);
      seek.value = String(audio.currentTime || 0);
      time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    };

    const stopOthers = () => {
      if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        currentSync?.();
      }
    };

    playBtn.addEventListener("click", async () => {
      stopOthers();
      if (audio.paused) {
        try {
          await audio.play();
          currentAudio = audio;
          currentSync = sync;
          playBtn.textContent = "❚❚";
          playBtn.setAttribute("aria-pressed", "true");
        } catch {
          playBtn.textContent = "▶";
          playBtn.setAttribute("aria-pressed", "false");
        }
      } else {
        audio.pause();
        playBtn.textContent = "▶";
        playBtn.setAttribute("aria-pressed", "false");
      }
      sync();
    });

    seek.addEventListener("input", () => {
      audio.currentTime = Number(seek.value);
      sync();
    });

    audio.addEventListener("loadedmetadata", sync);
    audio.addEventListener("timeupdate", sync);
    audio.addEventListener("ended", () => {
      playBtn.textContent = "▶";
      playBtn.setAttribute("aria-pressed", "false");
      sync();
    });
    audio.addEventListener("pause", () => {
      if (currentAudio === audio) {
        playBtn.textContent = "▶";
        playBtn.setAttribute("aria-pressed", "false");
      }
    });

    card.append(
      el("div", { className: "audio-player" }, [
        el("div", { className: "audio-row" }, [playBtn, time]),
        seek,
        audio,
      ]),
    );
    grid.append(card);
  });
}

function initVideos() {
  const grid = document.querySelector("[data-video-grid]");
  if (!grid) return;

  book.videos.forEach((video) => {
    const hasSource = Boolean(video.src || video.sources?.length);
    const card = el("article", { className: "video-card reveal" }, [
      el("div", {
        className: "video-poster",
        style: video.poster ? `background-image:url("${video.poster}")` : undefined,
      }, [
        video.duration
          ? el("span", { className: "badge", text: video.duration })
          : null,
      ]),
      el("div", { className: "video-body" }, [
        el("h3", { text: video.title }),
        el("p", { text: video.description }),
        hasSource
          ? el("button", {
              type: "button",
              className: "button soft",
              style: "margin-top:1rem",
              text: "Смотреть",
              onClick: () => openVideo(video),
            })
          : el("span", {
              className: "video-placeholder",
              text: "Пример размещения видео",
            }),
      ]),
    ]);
    grid.append(card);
  });
}

function openVideo(video) {
  const modal = document.querySelector("[data-video-modal]");
  const mount = document.querySelector("[data-video-mount]");
  const closeBtn = document.querySelector("[data-video-close]");
  if (!modal || !mount || !closeBtn) return;

  mount.replaceChildren();
  const player = el("video", {
    controls: true,
    playsinline: true,
    poster: video.poster || undefined,
    style: "width:min(920px,96vw);max-height:72vh;background:#000",
  });
  if (video.sources?.length) {
    video.sources.forEach((source) => {
      player.append(el("source", { src: source.src, type: source.type }));
    });
  } else if (video.src) {
    player.src = video.src;
  }
  mount.append(player);
  modal.hidden = false;
  document.body.classList.add("modal-open");
  closeBtn.focus();
  player.play?.().catch(() => {});

  const close = () => {
    player.pause();
    mount.replaceChildren();
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  };
  closeBtn.onclick = close;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}

function initLetters() {
  const grid = document.querySelector("[data-letter-grid]");
  const modal = document.querySelector("[data-letter-modal]");
  const mount = document.querySelector("[data-letter-mount]");
  const closeBtn = document.querySelector("[data-letter-close]");
  if (!grid || !modal || !mount || !closeBtn) return;

  let lastFocus = null;

  const close = () => {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    mount.replaceChildren();
    lastFocus?.focus?.();
  };

  book.letters.forEach((letter) => {
    const openBtn = el("button", {
      type: "button",
      className: "button soft open-letter",
      text: "Открыть письмо",
    });
    openBtn.addEventListener("click", () => {
      lastFocus = openBtn;
      mount.replaceChildren(
        el("div", { className: "letter-modal-card" }, [
          el("p", { className: "relation", text: letter.relation }),
          el("h3", { text: `Письмо от ${letter.from}` }),
          el("div", { className: "body", text: letter.body }),
          el("p", { className: "signature", text: letter.signature }),
        ]),
      );
      modal.hidden = false;
      document.body.classList.add("modal-open");
      closeBtn.focus();
    });

    grid.append(
      el("article", { className: "letter-card reveal" }, [
        el("p", { className: "relation", text: letter.relation }),
        el("blockquote", { text: letter.preview }),
        openBtn,
      ]),
    );
  });

  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });
}

function hydrateStaticCopy() {
  document.querySelectorAll("[data-bind]").forEach((node) => {
    const path = node.getAttribute("data-bind");
    if (!path) return;
    const value = path.split(".").reduce((acc, key) => acc?.[key], book);
    if (typeof value === "string") node.textContent = value;
  });

  const heroMedia = document.querySelector("[data-hero-media]");
  if (heroMedia) {
    heroMedia.style.backgroundImage = `url("${book.cover.image}")`;
    requestAnimationFrame(() => {
      document.querySelector(".hero")?.classList.add("is-ready");
    });
  }

  const cta = document.querySelector("[data-order-cta]");
  if (cta) {
    cta.setAttribute("href", book.commercial.ctaHref);
    cta.textContent = book.commercial.ctaLabel;
  }

  const closingBody = document.querySelector("[data-closing-body]");
  if (closingBody) {
    closingBody.replaceChildren(
      ...book.closing.body.map((paragraph) => el("p", { text: paragraph })),
    );
  }
}

hydrateStaticCopy();
initProgress();
initMenu();
initReveal();
initChapters();
initGallery();
initVoices();
initVideos();
initLetters();

root.dataset.bookReady = "true";
