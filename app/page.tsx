"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

const chapters = [
  {
    years: "1974-1989",
    title: "Девочка, которая собирала лето",
    place: "Таруса, дом у реки",
    text:
      "Лена Соколова росла в доме, где по воскресеньям пахло пирогами, а на подоконнике сушились полевые цветы. Она записывала в тетрадь слова из песен, училась фотографировать на старый Зенит и мечтала однажды увидеть море не на открытке.",
    memory: "Первая сохранившаяся фотография: Лена на велосипеде, июль 1983.",
  },
  {
    years: "1990-1998",
    title: "Восемнадцать: песни, письма, первые решения",
    place: "Москва, общежитие на Соколе",
    text:
      "В восемнадцать она слушала Наутилус и Sade, носила бордовую рубашку и говорила, что счастье начинается с честного разговора. В этот период Лена поступила на филфак, впервые жила одна и писала домой письма на тонкой бумаге.",
    memory: "Вопрос для мамы: какую мечту ты тогда никому не рассказывала?",
  },
  {
    years: "1999-2007",
    title: "Любовь, которую видно в деталях",
    place: "Парк Горького, кухня на Новослободской",
    text:
      "С будущим мужем, Андреем, Лена познакомилась у книжного лотка. Он купил ей сборник Ахматовой, а она через неделю вернула книгу с закладкой из трамвайного билета. Потом были маленькая свадьба, переезды, первый семейный фотоальбом и традиция варить какао по субботам.",
    memory: "Аудио-демо: Андрей вспоминает их первое свидание.",
  },
  {
    years: "2008-2026",
    title: "Мама, которая делала дом живым",
    place: "Семья Соколовых",
    text:
      "Когда родились Ника и Миша, Лена стала тем человеком, который помнит все школьные спектакли, первые победы и смешные детские фразы. Но эта книга возвращает фокус к ней самой: к её смелости, юмору, красоте и тихим победам.",
    memory: "Финальная глава собирает голоса детей, семейные видео и письмо благодарности.",
  },
];

const gallery = [
  {
    year: "1983",
    title: "У реки",
    caption: "Лена на велосипеде: первое лето, которое она называла своим.",
    image: "/gallery/mom-01.jpg",
  },
  {
    year: "2008",
    title: "Вверх",
    caption: "Мама поднимает ребёнка так, будто весь дом становится легче.",
    image: "/gallery/mom-02.jpg",
  },
  {
    year: "2012",
    title: "Семейный портрет",
    caption: "Тот кадр, где мама в центре, а все смотрят и улыбаются по-настоящему.",
    image: "/gallery/mom-03.jpg",
  },
  {
    year: "2018",
    title: "На холме",
    caption: "Она ведёт детей к закату — и кажется, что время останавливается.",
    image: "/gallery/mom-04.jpg",
  },
  {
    year: "2026",
    title: "Стол с памятью",
    caption: "Мама разбирает старые снимки, из которых потом собирается книга.",
    image: "/gallery/mom-05.jpg",
  },
  {
    year: "2026",
    title: "Смотрим вместе",
    caption: "Дети сидят рядом с мамой и листают её историю на экране.",
    image: "/gallery/mom-06.jpg",
  },
  {
    year: "2026",
    title: "Эта книга",
    caption: "Портрет, с которого начинается персональная книга о ней.",
    image: "/gallery/mom-07.jpg",
  },
  {
    year: "2026",
    title: "Тихий вечер",
    caption: "Когда дом затихает, и мама остаётся наедине с собой.",
    image: "/gallery/mom-08.jpg",
  },
];

const voices = [
  {
    name: "Андрей",
    role: "муж",
    line: "Я понял, что хочу быть рядом, когда она спорила о книге так, будто защищала целый мир.",
    duration: "0:34",
  },
  {
    name: "Ника",
    role: "дочь",
    line: "Мама умеет делать обычный день праздником. Даже если это просто чай на кухне.",
    duration: "0:28",
  },
  {
    name: "Миша",
    role: "сын",
    line: "Она всегда говорила: попробуй ещё раз. И я до сих пор слышу это перед важными решениями.",
    duration: "0:31",
  },
];

export default function Home() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [playingVoice, setPlayingVoice] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openPhoto, setOpenPhoto] = useState<(typeof gallery)[number] | null>(null);
  const chapterCardRef = useRef<HTMLElement>(null);

  const progress = useMemo(
    () => Math.round(((activeChapter + 1) / chapters.length) * 100),
    [activeChapter],
  );

  const closeMenu = () => setMenuOpen(false);
  const closePhoto = () => setOpenPhoto(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen || openPhoto ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (openPhoto) setOpenPhoto(null);
      else setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, openPhoto]);

  return (
    <main className="site-shell">
      {menuOpen ? (
        <button
          className="nav-overlay"
          type="button"
          aria-label="Закрыть меню"
          onClick={closeMenu}
        />
      ) : null}
      <nav className={menuOpen ? "topbar is-open" : "topbar"} aria-label="Навигация по демо-книге">
        <a className="brand" href="#cover" aria-label="Я здесь, к началу книги" onClick={closeMenu}>
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
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Закрыть меню" : "Открыть меню"}</span>
          <span className="menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
        <div className={menuOpen ? "nav-links is-open" : "nav-links"} id="site-menu">
          <a href="#chapters" onClick={closeMenu}>Главы</a>
          <a href="#gallery" onClick={closeMenu}>Фото</a>
          <a href="#voices" onClick={closeMenu}>Голоса</a>
          <a href="#order" onClick={closeMenu}>Заказать</a>
        </div>
      </nav>

      <section className="hero" id="cover">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-scrim" />
        <div className="hero-content reveal">
          <p className="demo-pill">Демонстрационная история, семья вымышлена</p>
          <p className="eyebrow">Премиальная интерактивная книга ко Дню матери</p>
          <h1>Мамина история</h1>
          <p className="hero-lead">
            Персональная цифровая книга о Елене Соколовой: о девочке с мечтами,
            женщине с характером и маме, чья жизнь стала семейным светом.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#chapters">
              Открыть демо-книгу
            </a>
            <a className="button secondary" href="#order">
              Заказать к 29 ноября
            </a>
          </div>
        </div>
        <aside className="cover-card" aria-label="Карточка демо-книги">
          <span>Соколовы</span>
          <strong>4 главы</strong>
          <small>фото, видео, голоса, письмо</small>
        </aside>
      </section>

      <section className="intro section-band">
        <div className="intro-copy reveal">
          <p className="section-kicker">Идея подарка</p>
          <h2>Не вещь на полку, а история, где главная героиня - мама.</h2>
        </div>
        <div className="intro-grid">
          <article>
            <span>01</span>
            <h3>Семейный сюжет</h3>
            <p>Главы жизни, фотографии, подписи, даты и тёплые детали собираются в цельный рассказ.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Живые голоса</h3>
            <p>Демо показывает, как в книгу могут быть встроены поздравления, воспоминания и короткие видео.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Готово к показу</h3>
            <p>Книгу можно открыть с телефона, отправить родным и показать маме в День матери.</p>
          </article>
        </div>
      </section>

      <section className="chapters section-band" id="chapters">
        <div className="section-heading reveal">
          <p className="section-kicker">Главы жизни</p>
          <h2>История раскрывается как семейный фильм.</h2>
          <p>
            Нажимайте на годы: каждая глава меняет сцену, подпись и эмоциональный
            фокус. В настоящем заказе эти блоки заменяются материалами семьи.
          </p>
        </div>

        <div className="chapter-stage">
          <div className="chapter-list" role="tablist" aria-label="Выбор главы">
            {chapters.map((chapter, index) => (
              <button
                className={activeChapter === index ? "chapter-tab active" : "chapter-tab"}
                key={chapter.title}
                onClick={() => {
                  setActiveChapter(index);
                  chapterCardRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                  });
                }}
                role="tab"
                aria-label={`${chapter.years}. ${chapter.title}`}
                aria-selected={activeChapter === index}
              >
                <span className="chapter-tab-years">{chapter.years}</span>
                <span className="chapter-tab-title">{chapter.title}</span>
              </button>
            ))}
          </div>

          <article className="chapter-card" role="tabpanel" ref={chapterCardRef}>
            <div className="chapter-progress" aria-label={`Прогресс книги ${progress}%`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <p className="section-kicker">{chapters[activeChapter].place}</p>
            <h3>{chapters[activeChapter].title}</h3>
            <p>{chapters[activeChapter].text}</p>
            <div className="memory-note">{chapters[activeChapter].memory}</div>
          </article>
        </div>
      </section>

      <section className="gallery section-band" id="gallery">
        <div className="section-heading reveal">
          <p className="section-kicker">Фотогалерея</p>
          <h2>Архив выглядит бережно, но современно.</h2>
        </div>
        <div className="photo-grid">
          {gallery.map((photo) => (
            <button
              className="photo-card"
              key={photo.title}
              type="button"
              style={{ "--photo-image": `url("${photo.image}")` } as CSSProperties}
              onClick={() => setOpenPhoto(photo)}
              aria-label={`${photo.year}. ${photo.title}. Открыть фото`}
            >
              <span>{photo.year}</span>
              <h3>{photo.title}</h3>
              <p>{photo.caption}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="media section-band" id="voices">
        <div className="section-heading reveal">
          <p className="section-kicker">Видео и голоса</p>
          <h2>В демо показан формат мультимедиа-блоков.</h2>
          <p>Это не настоящие записи семьи Соколовых, а пример того, как может звучать готовая книга.</p>
        </div>

        <div className="media-grid">
          <article className="video-demo">
            <div className={videoOpen ? "video-frame playing" : "video-frame"}>
              <button onClick={() => setVideoOpen(!videoOpen)} aria-label="Включить демо-видео">
                {videoOpen ? "Пауза" : "Смотреть"}
              </button>
              <div>
                <span>00:42</span>
                <strong>Семейное видео: мама смеётся у моря</strong>
              </div>
            </div>
            <p>
              В реальной книге здесь может быть ролик из семейного архива,
              поздравление детей или фрагмент интервью с мамой.
            </p>
          </article>

          <div className="voice-stack">
            {voices.map((voice, index) => (
              <article className="voice-card" key={voice.name}>
                <button
                  className={playingVoice === index ? "play active" : "play"}
                  onClick={() => setPlayingVoice(playingVoice === index ? null : index)}
                  aria-label={`Включить демо-голос: ${voice.name}`}
                />
                <div>
                  <h3>{voice.name}</h3>
                  <span>{voice.role} · {voice.duration}</span>
                  <p>{voice.line}</p>
                  <div className="wave" aria-hidden="true">
                    <i /><i /><i /><i /><i /><i /><i /><i />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="letter section-band">
        <div className="letter-paper reveal">
          <p className="section-kicker">Письмо в финале</p>
          <h2>Мам, теперь эта история - о тебе.</h2>
          <p>
            Ты столько лет собирала наши фотографии, смешные фразы, рисунки,
            школьные победы и маленькие праздники. Мы привыкли, что ты помнишь
            всё о нас. А теперь нам хочется сохранить всё самое дорогое о тебе.
          </p>
          <p>
            О твоей смелости в восемнадцать. О музыке, которую ты включала,
            когда никто не видел. О любви, которая началась с книги. О доме,
            где каждый чувствует: его ждут.
          </p>
          <p>
            Эта демо-книга показывает формат подарка. В настоящей версии здесь
            будут ваши фотографии, ваши голоса и слова, которые мама захочет
            перечитать ещё много раз.
          </p>
          <span>С любовью, семья</span>
        </div>
      </section>

      <section className="order" id="order">
        <div className="order-inner reveal">
          <p className="demo-pill">День матери - 29 ноября 2026</p>
          <h2>Создайте такую книгу для своей мамы.</h2>
          <p>
            «Я здесь» помогает собрать фотографии, истории, видео и голоса в
            персональную интерактивную книгу, которую легко открыть по ссылке и
            подарить всей семьёй.
          </p>
          <div className="order-actions">
            <a
              className="button messenger-button max-button"
              href="https://max.ru/:share?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B7%D0%B0%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C%20%D0%BA%D0%BD%D0%B8%D0%B3%D1%83%20%C2%AB%D0%9C%D0%B0%D0%BC%D0%B8%D0%BD%D0%B0%20%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D1%8F%C2%BB.%20%D0%9D%D0%BE%D0%BC%D0%B5%D1%80%20%D0%B4%D0%BB%D1%8F%20MAX:%20%2B79855721069"
              target="_blank"
              rel="noreferrer"
              aria-label="Заказать в MAX по номеру +79855721069"
            >
              <span className="messenger-icon max-icon" aria-hidden="true">MAX</span>
              Заказать
            </a>
            <a
              className="button messenger-button telegram-button"
              href="https://t.me/keepitok"
              target="_blank"
              rel="noreferrer"
              aria-label="Заказать в Telegram"
            >
              <span className="messenger-icon telegram-icon" aria-hidden="true" />
              Заказать
            </a>
          </div>
          <small>
            Эта страница - демонстрационный пример. Все персонажи, события,
            подписи и медиа-сцены вымышлены для показа возможностей проекта.
          </small>
        </div>
      </section>

      {openPhoto
        ? createPortal(
            <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
              <button
                className="lightbox-backdrop"
                type="button"
                aria-label="Закрыть фото"
                onClick={closePhoto}
              />
              <button
                className="lightbox-close"
                type="button"
                aria-label="Закрыть фото"
                onClick={closePhoto}
              >
                <span aria-hidden="true">×</span>
              </button>
              <figure className="lightbox-figure">
                <img src={openPhoto.image} alt="" />
                <figcaption>
                  <span>{openPhoto.year}</span>
                  <strong id="lightbox-title">{openPhoto.title}</strong>
                  <p>{openPhoto.caption}</p>
                </figcaption>
              </figure>
            </div>,
            document.body,
          )
        : null}
    </main>
  );
}
