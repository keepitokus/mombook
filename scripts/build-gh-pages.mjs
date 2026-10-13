import { mkdir, copyFile, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const outDir = resolve(root, "gh-pages");
const assetsDir = resolve(outDir, "assets");

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
    image: "assets/gallery/mom-01.jpg",
  },
  {
    year: "2008",
    title: "Вверх",
    caption: "Мама поднимает ребёнка так, будто весь дом становится легче.",
    image: "assets/gallery/mom-02.jpg",
  },
  {
    year: "2012",
    title: "Семейный портрет",
    caption: "Тот кадр, где мама в центре, а все смотрят и улыбаются по-настоящему.",
    image: "assets/gallery/mom-03.jpg",
  },
  {
    year: "2018",
    title: "На холме",
    caption: "Она ведёт детей к закату — и кажется, что время останавливается.",
    image: "assets/gallery/mom-04.jpg",
  },
  {
    year: "2026",
    title: "Стол с памятью",
    caption: "Мама разбирает старые снимки, из которых потом собирается книга.",
    image: "assets/gallery/mom-05.jpg",
  },
  {
    year: "2026",
    title: "Смотрим вместе",
    caption: "Дети сидят рядом с мамой и листают её историю на экране.",
    image: "assets/gallery/mom-06.jpg",
  },
  {
    year: "2026",
    title: "Эта книга",
    caption: "Портрет, с которого начинается персональная книга о ней.",
    image: "assets/gallery/mom-07.jpg",
  },
  {
    year: "2026",
    title: "Тихий вечер",
    caption: "Когда дом затихает, и мама остаётся наедине с собой.",
    image: "assets/gallery/mom-08.jpg",
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

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const css = `${(await readFile(resolve(root, "app/globals.css"), "utf8"))
  .replace('@import "tailwindcss";', "")
  .replaceAll('url("/mamina-istoriya-hero.png")', 'url("assets/mamina-istoriya-hero.png")')}
.lightbox[hidden] { display: none !important; }
`;

const chapterTabs = chapters
  .map(
    (chapter, index) => `
      <button class="${index === 0 ? "chapter-tab active" : "chapter-tab"}" data-chapter="${index}" role="tab" aria-label="${escapeHtml(`${chapter.years}. ${chapter.title}`)}" aria-selected="${index === 0}">
        <span class="chapter-tab-years">${chapter.years}</span>
        <span class="chapter-tab-title">${escapeHtml(chapter.title)}</span>
      </button>`,
  )
  .join("");

const galleryCards = gallery
  .map(
    (photo, index) => `
      <button type="button" class="photo-card reveal" style="--photo-image: url('${photo.image}'); --stagger: ${(index % 4) + 1}" data-year="${escapeHtml(photo.year)}" data-title="${escapeHtml(photo.title)}" data-caption="${escapeHtml(photo.caption)}" data-image="${photo.image}" aria-label="${escapeHtml(`${photo.year}. ${photo.title}. Открыть фото`)}">
        <span>${escapeHtml(photo.year)}</span>
        <h3>${escapeHtml(photo.title)}</h3>
        <p>${escapeHtml(photo.caption)}</p>
      </button>`,
  )
  .join("");

const voiceCards = voices
  .map(
    (voice, index) => `
      <article class="voice-card">
        <button class="play" data-voice="${index}" aria-label="Включить демо-голос: ${escapeHtml(voice.name)}"></button>
        <div>
          <h3>${escapeHtml(voice.name)}</h3>
          <span>${escapeHtml(voice.role)} · ${voice.duration}</span>
          <p>${escapeHtml(voice.line)}</p>
          <div class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        </div>
      </article>`,
  )
  .join("");

const maxLink =
  "https://max.ru/:share?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B7%D0%B0%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C%20%D0%BA%D0%BD%D0%B8%D0%B3%D1%83%20%C2%AB%D0%9C%D0%B0%D0%BC%D0%B8%D0%BD%D0%B0%20%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D1%8F%C2%BB.%20%D0%9D%D0%BE%D0%BC%D0%B5%D1%80%20%D0%B4%D0%BB%D1%8F%20MAX:%20%2B79855721069";

const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Мама, спасибо - демо-книга | Я здесь</title>
    <meta name="description" content="Интерактивная демо-книга ко Дню матери для проекта «Я здесь»: главы жизни, фото, голоса, видео и письмо.">
    <meta property="og:title" content="Мама, спасибо - демо-книга">
    <meta property="og:description" content="Интерактивный пример персональной цифровой книги о маме.">
    <meta property="og:image" content="assets/mamina-istoriya-hero.png">
    <link rel="icon" href="assets/favicon.svg">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="site-shell">
      <button class="nav-overlay" type="button" aria-label="Закрыть меню" hidden></button>
      <nav class="topbar" aria-label="Навигация по демо-книге">
        <a class="brand" href="#cover" aria-label="Я здесь, к началу книги">
          <img class="brand-logo" src="assets/ya-zdes-logo.jpg" alt="" width="112" height="112">
        </a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu">
          <span class="sr-only">Открыть меню</span>
          <span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>
        <div class="nav-links" id="site-menu">
          <a href="#chapters">Главы</a>
          <a href="#gallery">Фото</a>
          <a href="#voices">Голоса</a>
          <a href="#order">Заказать</a>
        </div>
      </nav>

      <section class="hero" id="cover">
        <div class="hero-image" aria-hidden="true"></div>
        <div class="hero-scrim"></div>
        <div class="hero-dust" aria-hidden="true">${Array.from({ length: 14 }, () => "<span></span>").join("")}</div>
        <div class="hero-content reveal">
          <p class="demo-pill">Демонстрационная история, семья вымышлена</p>
          <p class="eyebrow">Интерактивная книга ко Дню матери</p>
          <h1>Мама, спасибо.</h1>
          <p class="hero-lead">Персональная цифровая книга о Елене Соколовой: о девочке с мечтами, женщине с характером и маме, чья жизнь стала семейным светом.</p>
          <div class="hero-actions">
            <a class="button primary" href="#chapters">Открыть демо-книгу</a>
            <a class="button secondary" href="#order">Заказать к 29 ноября</a>
          </div>
        </div>
        <aside class="cover-card" aria-label="Карточка демо-книги">
          <span>Соколовы</span>
          <strong>4 главы</strong>
          <small>фото, видео, голоса, письмо</small>
        </aside>
      </section>

      <section class="intro section-band">
        <div class="intro-copy reveal">
          <p class="section-kicker">Идея подарка</p>
          <h2>Не вещь на полку, а история, где главная героиня - мама.</h2>
        </div>
        <div class="intro-grid">
          <article class="reveal" style="--stagger: 1"><span>01</span><h3>Семейный сюжет</h3><p>Главы жизни, фотографии, подписи, даты и тёплые детали собираются в цельный рассказ.</p></article>
          <article class="reveal" style="--stagger: 2"><span>02</span><h3>Живые голоса</h3><p>Демо показывает, как в книгу могут быть встроены поздравления, воспоминания и короткие видео.</p></article>
          <article class="reveal" style="--stagger: 3"><span>03</span><h3>Готово к показу</h3><p>Книгу можно открыть с телефона, отправить родным и показать маме в День матери.</p></article>
        </div>
      </section>

      <section class="chapters section-band" id="chapters">
        <div class="section-heading reveal">
          <p class="section-kicker">Главы жизни</p>
          <h2>История раскрывается как семейный фильм.</h2>
          <p>Нажимайте на годы: каждая глава меняет сцену, подпись и эмоциональный фокус. В настоящем заказе эти блоки заменяются материалами семьи.</p>
        </div>
        <div class="chapter-stage">
          <div class="chapter-list" role="tablist" aria-label="Выбор главы">${chapterTabs}</div>
          <article class="chapter-card" role="tabpanel" id="chapter-card">
            <div class="chapter-progress" aria-label="Прогресс книги 25%"><span style="width: 25%"></span></div>
            <div class="chapter-copy" id="chapter-copy">
              <p class="section-kicker" id="chapter-place">${chapters[0].place}</p>
              <h3 id="chapter-title">${chapters[0].title}</h3>
              <p id="chapter-text">${chapters[0].text}</p>
              <div class="memory-note" id="chapter-memory">${chapters[0].memory}</div>
            </div>
          </article>
        </div>
      </section>

      <section class="gallery section-band" id="gallery">
        <div class="section-heading reveal">
          <p class="section-kicker">Фотогалерея</p>
          <h2>Архив выглядит бережно, но современно.</h2>
        </div>
        <div class="photo-grid">${galleryCards}</div>
      </section>

      <section class="media section-band" id="voices">
        <div class="section-heading reveal">
          <p class="section-kicker">Видео и голоса</p>
          <h2>В демо показан формат мультимедиа-блоков.</h2>
          <p>Это не настоящие записи семьи Соколовых, а пример того, как может звучать готовая книга.</p>
        </div>
        <div class="media-grid">
          <article class="video-demo">
            <div class="video-frame">
              <button type="button" id="video-toggle" aria-label="Включить демо-видео">Смотреть</button>
              <div><span>00:42</span><strong>Семейное видео: мама смеётся у моря</strong></div>
            </div>
            <p>В реальной книге здесь может быть ролик из семейного архива, поздравление детей или фрагмент интервью с мамой.</p>
          </article>
          <div class="voice-stack">${voiceCards}</div>
        </div>
      </section>

      <section class="letter section-band">
        <div class="letter-paper reveal">
          <p class="section-kicker">Письмо в финале</p>
          <h2>Мам, теперь эта история - о тебе.</h2>
          <p>Ты столько лет собирала наши фотографии, смешные фразы, рисунки, школьные победы и маленькие праздники. Мы привыкли, что ты помнишь всё о нас. А теперь нам хочется сохранить всё самое дорогое о тебе.</p>
          <p>О твоей смелости в восемнадцать. О музыке, которую ты включала, когда никто не видел. О любви, которая началась с книги. О доме, где каждый чувствует: его ждут.</p>
          <p>Эта демо-книга показывает формат подарка. В настоящей версии здесь будут ваши фотографии, ваши голоса и слова, которые мама захочет перечитать ещё много раз.</p>
          <span>С любовью, семья</span>
        </div>
      </section>

      <section class="order" id="order">
        <div class="order-inner reveal">
          <p class="demo-pill">День матери - 29 ноября 2026</p>
          <h2>Создайте такую книгу для своей мамы.</h2>
          <p>«Я здесь» помогает собрать фотографии, истории, видео и голоса в персональную интерактивную книгу, которую легко открыть по ссылке и подарить всей семьёй.</p>
          <div class="order-actions">
            <a class="button messenger-button max-button" href="${maxLink}" target="_blank" rel="noreferrer" aria-label="Заказать в MAX по номеру +79855721069"><span class="messenger-icon max-icon" aria-hidden="true">MAX</span>Заказать</a>
            <a class="button messenger-button telegram-button" href="https://t.me/keepitok" target="_blank" rel="noreferrer" aria-label="Заказать в Telegram"><span class="messenger-icon telegram-icon" aria-hidden="true"></span>Заказать</a>
          </div>
          <small>Эта страница - демонстрационный пример. Все персонажи, события, подписи и медиа-сцены вымышлены для показа возможностей проекта.</small>
        </div>
      </section>
    </main>
    <div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
      <button class="lightbox-backdrop" type="button" aria-label="Закрыть фото"></button>
      <button class="lightbox-close" type="button" aria-label="Закрыть фото"><span aria-hidden="true">×</span></button>
      <figure class="lightbox-figure">
        <img id="lightbox-image" alt="">
        <figcaption>
          <span id="lightbox-year"></span>
          <strong id="lightbox-title"></strong>
          <p id="lightbox-caption"></p>
        </figcaption>
      </figure>
    </div>
    <script>
      const chapters = ${JSON.stringify(chapters)};
      const tabs = document.querySelectorAll("[data-chapter]");
      const progress = document.querySelector(".chapter-progress span");
      const chapterCard = document.querySelector("#chapter-card");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const index = Number(tab.dataset.chapter);
          const chapter = chapters[index];
          tabs.forEach((button) => {
            button.classList.toggle("active", button === tab);
            button.setAttribute("aria-selected", button === tab ? "true" : "false");
          });
          document.querySelector("#chapter-place").textContent = chapter.place;
          document.querySelector("#chapter-title").textContent = chapter.title;
          document.querySelector("#chapter-text").textContent = chapter.text;
          document.querySelector("#chapter-memory").textContent = chapter.memory;
          const copy = document.querySelector("#chapter-copy");
          const nextCopy = copy.cloneNode(true);
          copy.replaceWith(nextCopy);
          progress.style.width = Math.round(((index + 1) / chapters.length) * 100) + "%";
          document.querySelector(".chapter-progress").setAttribute("aria-label", "Прогресс книги " + Math.round(((index + 1) / chapters.length) * 100) + "%");
          chapterCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      });
      document.querySelector("#video-toggle").addEventListener("click", (event) => {
        const frame = event.currentTarget.closest(".video-frame");
        const active = frame.classList.toggle("playing");
        event.currentTarget.textContent = active ? "Пауза" : "Смотреть";
      });
      document.querySelectorAll("[data-voice]").forEach((button) => {
        button.addEventListener("click", () => {
          const wasActive = button.classList.contains("active");
          document.querySelectorAll("[data-voice]").forEach((item) => {
            item.classList.remove("active");
            item.closest(".voice-card")?.classList.remove("is-playing");
          });
          if (!wasActive) {
            button.classList.add("active");
            button.closest(".voice-card")?.classList.add("is-playing");
          }
        });
      });

      const revealNodes = Array.from(document.querySelectorAll(".reveal"));
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const reveal = (node) => node.classList.add("is-visible");
      if (reduceMotion) {
        revealNodes.forEach(reveal);
      } else {
        const observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        }, { threshold: 0.08, rootMargin: "0px 0px 12% 0px" });
        revealNodes.forEach((node) => {
          if (node.getBoundingClientRect().top < window.innerHeight * 0.94) reveal(node);
          else observer.observe(node);
        });
      }

      const overlay = document.querySelector(".nav-overlay");
      const toggle = document.querySelector(".menu-toggle");
      const links = document.querySelector("#site-menu");
      const topbar = document.querySelector(".topbar");
      const closeMenu = () => {
        overlay.hidden = true;
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.querySelector(".sr-only").textContent = "Открыть меню";
        links.classList.remove("is-open");
        topbar.classList.remove("is-open");
        document.body.style.overflow = "";
      };
      const openMenu = () => {
        overlay.hidden = false;
        toggle.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.querySelector(".sr-only").textContent = "Закрыть меню";
        links.classList.add("is-open");
        topbar.classList.add("is-open");
        document.body.style.overflow = "hidden";
      };
      toggle.addEventListener("click", () => {
        if (toggle.classList.contains("is-open")) closeMenu();
        else openMenu();
      });
      overlay.addEventListener("click", closeMenu);
      links.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
      document.querySelector(".brand").addEventListener("click", closeMenu);

      const lightbox = document.querySelector("#lightbox");
      const closePhoto = () => {
        lightbox.hidden = true;
        document.body.style.overflow = toggle.classList.contains("is-open") ? "hidden" : "";
      };
      const openPhoto = (photo) => {
        document.querySelector("#lightbox-image").src = photo.image;
        document.querySelector("#lightbox-year").textContent = photo.year;
        document.querySelector("#lightbox-title").textContent = photo.title;
        document.querySelector("#lightbox-caption").textContent = photo.caption;
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
      };
      document.querySelectorAll(".photo-card").forEach((card) => {
        card.addEventListener("click", () => openPhoto(card.dataset));
      });
      lightbox.querySelectorAll("[aria-label='Закрыть фото']").forEach((button) => {
        button.addEventListener("click", closePhoto);
      });
      window.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (!lightbox.hidden) closePhoto();
        else closeMenu();
      });
    </script>
  </body>
</html>
`;

await rm(outDir, { recursive: true, force: true });
await mkdir(assetsDir, { recursive: true });
await copyFile(resolve(root, "public/mamina-istoriya-hero.png"), resolve(assetsDir, "mamina-istoriya-hero.png"));
await copyFile(resolve(root, "public/favicon.svg"), resolve(assetsDir, "favicon.svg"));
await copyFile(resolve(root, "public/ya-zdes-logo.jpg"), resolve(assetsDir, "ya-zdes-logo.jpg"));
const galleryOut = resolve(assetsDir, "gallery");
await mkdir(galleryOut, { recursive: true });
for (const file of await readdir(resolve(root, "public/gallery"))) {
  await copyFile(resolve(root, "public/gallery", file), resolve(galleryOut, file));
}
await writeFile(resolve(outDir, "styles.css"), css);
await writeFile(resolve(outDir, "index.html"), html);
await writeFile(resolve(outDir, ".nojekyll"), "");

console.log(`GitHub Pages static build written to ${outDir}`);
