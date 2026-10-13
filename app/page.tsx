"use client";

import { useMemo, useState } from "react";

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
  ["1983", "Велосипед у реки", "Первое лето, которое Лена называла своим."],
  ["1992", "Филфак и красная помада", "Фотография из автомата рядом с метро."],
  ["1999", "Книжный лоток", "День, когда началась история с Андреем."],
  ["2008", "Первое какао для Ники", "Субботняя традиция стала семейным ритуалом."],
  ["2016", "Поездка к морю", "Мама смеётся так, что все кадры получаются живыми."],
  ["2026", "Эта книга", "Дети собирают историю, которую хочется сохранить."],
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

  const progress = useMemo(
    () => Math.round(((activeChapter + 1) / chapters.length) * 100),
    [activeChapter],
  );

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Навигация по демо-книге">
        <a className="brand" href="#cover" aria-label="Я здесь, к началу книги">
          <span className="brand-mark">Я</span>
          <span>Я здесь</span>
        </a>
        <div className="nav-links">
          <a href="#chapters">Главы</a>
          <a href="#gallery">Фото</a>
          <a href="#voices">Голоса</a>
          <a href="#order">Заказать</a>
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
                onClick={() => setActiveChapter(index)}
                role="tab"
                aria-selected={activeChapter === index}
              >
                <span>{chapter.years}</span>
                {chapter.title}
              </button>
            ))}
          </div>

          <article className="chapter-card" role="tabpanel">
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
          {gallery.map(([year, title, caption], index) => (
            <article className={`photo-card tone-${index + 1}`} key={title}>
              <div className="photo-shine" />
              <span>{year}</span>
              <h3>{title}</h3>
              <p>{caption}</p>
            </article>
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
            <a className="button primary" href="mailto:hello@example.com?subject=Хочу%20книгу%20для%20мамы">
              Оставить заявку
            </a>
            <a className="button secondary" href="#cover">
              Пересмотреть демо
            </a>
          </div>
          <small>
            Эта страница - демонстрационный пример. Все персонажи, события,
            подписи и медиа-сцены вымышлены для показа возможностей проекта.
          </small>
        </div>
      </section>
    </main>
  );
}
