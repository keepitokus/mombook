import { book } from "./data.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    else if (key === "style" && typeof value === "string") node.setAttribute("style", value);
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === false || value == null) continue;
    else if (key === "checked" || key === "hidden" || key === "disabled") node[key] = Boolean(value);
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

function pauseAllAudio() {
  document.querySelectorAll("audio").forEach((audio) => {
    audio.pause();
  });
  document.querySelectorAll(".voice-card").forEach((card) => {
    card.classList.remove("is-playing");
    const btn = card.querySelector(".play-btn");
    if (btn) {
      btn.textContent = "▶";
      btn.setAttribute("aria-pressed", "false");
    }
  });
}

function initProgress() {
  const bar = document.querySelector("[data-read-progress]");
  const topbar = document.querySelector("[data-topbar]");
  if (!bar) return;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`;
    topbar?.classList.toggle("is-solid", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const links = document.querySelector("[data-nav-links]");
  const overlay = document.querySelector("[data-nav-overlay]");
  const label = document.querySelector("[data-menu-label]");
  if (!toggle || !links || !overlay) return;

  const close = () => {
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    links.classList.remove("is-open");
    overlay.classList.remove("is-open");
    overlay.hidden = true;
    if (label) label.textContent = "Открыть меню";
  };

  const open = () => {
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    links.classList.add("is-open");
    overlay.classList.add("is-open");
    overlay.hidden = false;
    if (label) label.textContent = "Закрыть меню";
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

function initToc() {
  const toc = document.querySelector("[data-toc]");
  if (!toc) return;
  book.chapters.forEach((chapter, index) => {
    const btn = el("button", {
      type: "button",
      onClick: () => {
        document.dispatchEvent(new CustomEvent("premium:chapter", { detail: { index } }));
        document.querySelector("#chapters")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      },
    }, [
      el("span", { className: "num", text: chapter.number }),
      el("span", { className: "title", text: chapter.title }),
      el("span", { className: "years", text: chapter.years }),
    ]);
    toc.append(el("li", {}, [btn]));
  });
}

function initChapters() {
  const { chapters } = book;
  const nav = document.querySelector("[data-chapter-nav]");
  const visual = document.querySelector("[data-chapter-visual]");
  const years = document.querySelector("[data-chapter-years]");
  const era = document.querySelector("[data-chapter-era]");
  const place = document.querySelector("[data-chapter-place]");
  const title = document.querySelector("[data-chapter-title]");
  const story = document.querySelector("[data-chapter-story]");
  const memory = document.querySelector("[data-chapter-memory]");
  const body = document.querySelector("[data-chapter-body]");
  const count = document.querySelector("[data-chapter-count]");
  const prev = document.querySelector("[data-chapter-prev]");
  const next = document.querySelector("[data-chapter-next]");
  if (!nav || !visual) return;

  let active = 0;

  chapters.forEach((chapter, index) => {
    nav.append(
      el("button", {
        type: "button",
        className: index === 0 ? "active" : "",
        onClick: () => show(index),
      }, [
        el("small", { text: `${chapter.number} · ${chapter.years}` }),
        el("strong", { text: chapter.title }),
      ]),
    );
  });

  function show(index) {
    active = Math.max(0, Math.min(chapters.length - 1, index));
    const chapter = chapters[active];
    visual.style.backgroundImage = `linear-gradient(0deg, rgba(18,15,12,0.2), transparent 55%), url("${chapter.image}")`;
    years.textContent = chapter.years;
    era.textContent = chapter.eraLabel;
    place.textContent = chapter.place;
    title.textContent = chapter.title;
    story.textContent = chapter.story;
    memory.textContent = chapter.memory;
    count.textContent = `${active + 1} / ${chapters.length}`;
    prev.disabled = active === 0;
    next.disabled = active === chapters.length - 1;
    nav.querySelectorAll("button").forEach((btn, i) => {
      const isActive = i === active;
      btn.classList.toggle("active", isActive);
      if (isActive) btn.setAttribute("aria-current", "true");
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
  document.addEventListener("premium:chapter", (event) => {
    show(event.detail.index);
  });
  show(0);
}

function initGallery() {
  const tabs = document.querySelector("[data-album-tabs]");
  const grid = document.querySelector("[data-gallery-grid]");
  const empty = document.querySelector("[data-album-empty]");
  const featureOpen = document.querySelector("[data-feature-open]");
  const featureImage = document.querySelector("[data-feature-image]");
  const featureTitle = document.querySelector("[data-feature-title]");
  const featureYear = document.querySelector("[data-feature-year]");
  const featureCaption = document.querySelector("[data-feature-caption]");
  const modal = document.querySelector("[data-lightbox]");
  const image = document.querySelector("[data-lightbox-image]");
  const caption = document.querySelector("[data-lightbox-caption]");
  const closeBtn = document.querySelector("[data-lightbox-close]");
  const prevBtn = document.querySelector("[data-lightbox-prev]");
  const nextBtn = document.querySelector("[data-lightbox-next]");
  if (!tabs || !grid || !modal) return;

  let album = "all";
  let featureIndex = 0;
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
        dataset: { albumId: item.id },
        text: item.title,
        onClick: () => {
          album = item.id;
          tabs.querySelectorAll("button").forEach((btn) => {
            const active = btn.dataset.albumId === album;
            btn.classList.toggle("active", active);
            btn.setAttribute("aria-pressed", active ? "true" : "false");
          });
          featureIndex = 0;
          render();
        },
      }),
    );
  });

  function setFeature(index) {
    if (!visible.length) return;
    featureIndex = Math.max(0, Math.min(visible.length - 1, index));
    const photo = visible[featureIndex];
    featureImage.src = photo.image;
    featureImage.alt = `${photo.title}. ${photo.caption}`;
    featureTitle.textContent = photo.title;
    featureYear.textContent = photo.year;
    featureCaption.textContent = photo.caption;
    grid.querySelectorAll("button").forEach((btn, i) => {
      btn.classList.toggle("active", i === featureIndex);
    });
  }

  function render() {
    visible =
      album === "all"
        ? [...book.photos]
        : book.photos.filter((photo) => photo.album === album);
    grid.replaceChildren();
    if (empty) empty.hidden = visible.length > 0;
    featureOpen.hidden = visible.length === 0;
    if (!visible.length) return;

    visible.forEach((photo, index) => {
      const btn = el("button", {
        type: "button",
        className: index === featureIndex ? "active" : "",
        onClick: () => setFeature(index),
      }, [
        el("img", {
          src: photo.image,
          alt: photo.title,
          loading: "lazy",
          decoding: "async",
          width: "400",
          height: "400",
        }),
      ]);
      grid.append(btn);
    });
    setFeature(Math.min(featureIndex, visible.length - 1));
  }

  function openLightbox(index, trigger) {
    if (!visible.length) return;
    pauseAllAudio();
    openIndex = index;
    lastFocus = trigger || document.activeElement;
    const photo = visible[openIndex];
    image.src = photo.image;
    image.alt = `${photo.title}. ${photo.caption}`;
    caption.replaceChildren(
      el("strong", { text: photo.title }),
      document.createTextNode(` · ${photo.year}`),
      el("br"),
      document.createTextNode(photo.caption),
    );
    modal.hidden = false;
    document.body.classList.add("modal-open");
    closeBtn.focus();
  }

  function closeLightbox() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    openIndex = null;
    lastFocus?.focus?.();
  }

  function step(delta) {
    if (openIndex == null || !visible.length) return;
    openIndex = (openIndex + delta + visible.length) % visible.length;
    openLightbox(openIndex, lastFocus);
  }

  featureOpen.addEventListener("click", () => openLightbox(featureIndex, featureOpen));
  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => step(-1));
  nextBtn.addEventListener("click", () => step(1));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLightbox();
  });

  let touchX = null;
  modal.addEventListener("touchstart", (e) => {
    touchX = e.changedTouches[0]?.clientX ?? null;
  }, { passive: true });
  modal.addEventListener("touchend", (e) => {
    if (touchX == null || modal.hidden) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  render();
}

function initVoices() {
  const grid = document.querySelector("[data-voice-grid]");
  if (!grid) return;

  book.voices.forEach((voice) => {
    const card = el("article", { className: "voice-card" }, [
      el("div", {}, [
        el("p", { className: "relation", text: voice.relation }),
        el("h3", { text: voice.name }),
        el("blockquote", { text: voice.quote }),
      ]),
    ]);

    if (!voice.src) {
      card.append(el("div", {
        className: "audio-missing",
        text: "Аудиозапись появится в персональной книге.",
      }));
      grid.append(card);
      return;
    }

    const audio = el("audio", { preload: "none", src: voice.src });
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

    playBtn.addEventListener("click", async () => {
      if (audio.paused) {
        pauseAllAudio();
        try {
          await audio.play();
          card.classList.add("is-playing");
          playBtn.textContent = "❚❚";
          playBtn.setAttribute("aria-pressed", "true");
        } catch {
          playBtn.textContent = "▶";
          playBtn.setAttribute("aria-pressed", "false");
        }
      } else {
        audio.pause();
        card.classList.remove("is-playing");
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
      card.classList.remove("is-playing");
      playBtn.textContent = "▶";
      playBtn.setAttribute("aria-pressed", "false");
      sync();
    });

    card.append(el("div", { className: "audio-player" }, [
      el("div", { className: "audio-row" }, [playBtn, time]),
      seek,
      audio,
    ]));
    grid.append(card);
  });
}

function initVideos() {
  const grid = document.querySelector("[data-video-grid]");
  if (!grid || !book.videos.length) return;

  const [hero, ...rest] = book.videos;
  const hasSource = Boolean(hero.src || hero.sources?.length);

  const heroBlock = el("div", { className: "film-hero" }, [
    el("div", {
      className: "film-poster",
      style: hero.poster ? `background-image:url("${hero.poster}")` : undefined,
    }),
    el("div", { className: "film-copy" }, [
      el("h3", { text: hero.title }),
      el("p", { text: hero.description }),
      hero.duration ? el("p", { text: `Длительность: ${hero.duration}` }) : null,
      hasSource
        ? el("button", {
            type: "button",
            className: "button",
            text: "Смотреть",
            onClick: () => openVideo(hero),
          })
        : el("span", {
            className: "video-placeholder",
            text: "В вашей книге здесь будет семейный ролик",
          }),
    ]),
  ]);

  const list = el("div", { className: "film-list" },
    rest.map((video) =>
      el("article", { className: "film-item" }, [
        el("h4", { text: video.title }),
        el("p", { text: video.description }),
        video.duration ? el("p", { text: video.duration }) : null,
        video.src || video.sources?.length
          ? el("button", {
              type: "button",
              className: "text-btn",
              text: "Смотреть →",
              onClick: () => openVideo(video),
            })
          : el("span", {
              className: "video-placeholder",
              text: "Пример размещения видео",
            }),
      ]),
    ),
  );

  grid.append(heroBlock, list);
}

function openVideo(video) {
  const modal = document.querySelector("[data-video-modal]");
  const mount = document.querySelector("[data-video-mount]");
  const closeBtn = document.querySelector("[data-video-close]");
  if (!modal || !mount || !closeBtn) return;

  pauseAllAudio();
  const lastFocus = document.activeElement;
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
    lastFocus?.focus?.();
  };

  closeBtn.onclick = close;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
  const onKey = (e) => {
    if (e.key === "Escape" && !modal.hidden) {
      close();
      document.removeEventListener("keydown", onKey);
    }
  };
  document.addEventListener("keydown", onKey);
}

function initLetters() {
  const grid = document.querySelector("[data-letter-grid]");
  const modal = document.querySelector("[data-letter-modal]");
  const mount = document.querySelector("[data-letter-mount]");
  const closeBtn = document.querySelector("[data-letter-close]");
  if (!grid || !modal || !mount || !closeBtn || !book.letters.length) return;

  let lastFocus = null;
  const [featured, ...rest] = book.letters;

  const openLetter = (letter, trigger) => {
    pauseAllAudio();
    lastFocus = trigger || document.activeElement;
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
  };

  const close = () => {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    mount.replaceChildren();
    lastFocus?.focus?.();
  };

  const openFeatured = el("button", {
    type: "button",
    className: "button",
    text: "Открыть письмо",
    style: "margin-top:1.2rem;width:fit-content",
    onClick: (event) => openLetter(featured, event.currentTarget),
  });

  grid.append(
    el("article", { className: "letter-sheet" }, [
      el("p", { className: "relation", text: featured.relation }),
      el("h3", { text: `От ${featured.from}` }),
      el("p", { className: "preview", text: featured.preview }),
      openFeatured,
    ]),
    el("div", { className: "letter-side" },
      rest.map((letter) =>
        el("button", {
          type: "button",
          className: "letter-mini",
          onClick: (event) => openLetter(letter, event.currentTarget),
        }, [
          el("p", { className: "relation", text: letter.relation }),
          el("strong", { text: letter.from }),
          el("span", { text: letter.preview }),
        ]),
      ),
    ),
  );

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
initToc();
initChapters();
initGallery();
initVoices();
initVideos();
initLetters();
