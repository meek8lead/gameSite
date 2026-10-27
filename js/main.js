/* ============================================
   ДРУЖОК'S GAMES — скрипты
   Ванильный JS, без библиотек. Потому что могу.
   ============================================ */

(function () {
  'use strict';

  /* ============================================================
     НАСТРОЙКИ ГОСТЕВОЙ (GitHub Issues)
     Впиши сюда свой username и имя репозитория.
     Пример: если репо https://github.com/druzhok/druzhok-games,
     то GH_OWNER = 'druzhok', GH_REPO = 'druzhok-games'.
     ============================================================ */
  var GH_OWNER = 'OWNER';   // <-- ЗАМЕНИ
  var GH_REPO  = 'REPO';    // <-- ЗАМЕНИ

  /* ---------- ХЕЛПЕРЫ ---------- */
  function pad(num, size) {
    var s = String(num);
    while (s.length < size) s = '0' + s;
    return s;
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- СЧЁТЧИК ПОСЕТИТЕЛЕЙ ---------- */
  var COUNTER_KEY = 'druzhok_visits';
  var START_COUNT = 14832;

  function initCounter() {
    var el = document.getElementById('visitor-counter');
    if (!el) return;

    var stored = parseInt(localStorage.getItem(COUNTER_KEY), 10);
    var count = isNaN(stored) ? START_COUNT + 1 : stored + 1;
    localStorage.setItem(COUNTER_KEY, count);
    el.textContent = pad(count, 5);
  }

  /* ---------- ЧАСЫ ---------- */
  function initClock() {
    var el = document.getElementById('server-clock');
    if (!el) return;

    function tick() {
      var d = new Date();
      el.textContent = pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- МУЗЫКА ---------- */
  function initMusic() {
    var btn = document.getElementById('music-toggle');
    var audio = document.getElementById('bg-music');
    if (!btn || !audio) return;

    btn.dataset.state = 'off';
    btn.textContent = '▶ Включить';

    btn.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().then(function () {
          btn.dataset.state = 'on';
          btn.textContent = '⏸ Выключить';
          localStorage.setItem('druzhok_music_on', '1');
        }).catch(function () {
          btn.textContent = '✕ Нет файла';
          btn.dataset.state = 'off';
          localStorage.setItem('druzhok_music_on', '0');
        });
      } else {
        audio.pause();
        btn.dataset.state = 'off';
        btn.textContent = '▶ Включить';
        localStorage.setItem('druzhok_music_on', '0');
      }
    });

    audio.addEventListener('ended', function () {
      btn.dataset.state = 'off';
      btn.textContent = '▶ Включить';
    });
  }

  /* ---------- ГОСТЕВАЯ ---------- */
  var GB_KEY = 'druzhok_guestbook';

  function loadGB() {
    try {
      return JSON.parse(localStorage.getItem(GB_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveGB(entries) {
    localStorage.setItem(GB_KEY, JSON.stringify(entries));
  }

  var SEED = [
    {
      name: 'Диман',
      site: '',
      message: 'Дружок, тетрис огонь! Но змейка лучше. Не обижайся.',
      date: '2024-03-10T19:23:00'
    },
    {
      name: 'Ксюха',
      site: 'http://ksuxa.example',
      message: 'Зайди ко мне на сайт, я там выложила свои стихи. Жду!',
      date: '2024-03-08T14:05:00'
    },
    {
      name: 'Серёга_777',
      site: '',
      message: 'Слушай, а морской бой сложный. Я на "адмирале" застрял на 3 часа. Спасибо, конечно, но так нельзя.',
      date: '2024-03-02T22:41:00'
    },
    {
      name: 'Аноним',
      site: '',
      message: 'Зашёл из 2003 года. Всё как раньше. Спасибо, что живой.',
      date: '2024-02-20T03:12:00'
    }
  ];

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return pad(d.getDate(), 2) + '.' + pad(d.getMonth() + 1, 2) + '.' + d.getFullYear() +
           ' ' + pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2);
  }

  function renderGB() {
    var container = document.getElementById('guestbook-entries');
    if (!container) return;

    var entries = loadGB();
    if (entries.length === 0) {
      entries = SEED.slice();
      saveGB(entries);
    }

    var countEl = document.getElementById('gb-count');
    if (countEl) countEl.textContent = '(' + entries.length + ')';
    var statEl = document.getElementById('stat-count');
    if (statEl) statEl.textContent = entries.length;

    entries.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

    container.innerHTML = '';
    entries.forEach(function (e) {
      var div = document.createElement('div');
      div.className = 'gb-entry';

      var siteHTML = e.site
        ? '<a class="gb-entry-site" href="' + escapeHTML(e.site) + '" rel="nofollow noopener" target="_blank">' + escapeHTML(e.site) + '</a>'
        : '';

      div.innerHTML =
        '<div class="gb-entry-head">' +
          '<span class="gb-entry-name">' + escapeHTML(e.name) + '</span>' +
          '<span class="gb-entry-date">' + escapeHTML(formatDate(e.date)) + '</span>' +
        '</div>' +
        '<div class="gb-entry-msg">' + escapeHTML(e.message) + '</div>' +
        siteHTML;

      container.appendChild(div);
    });
  }

  function isGHConfigured() {
    return GH_OWNER && GH_REPO &&
           GH_OWNER !== 'OWNER' && GH_REPO !== 'REPO' &&
           GH_OWNER.length > 0 && GH_REPO.length > 0;
  }

  function openGitHubIssue(name, message, site) {
    var title = '[Гостевая] от ' + name;
    var body = message;
    if (site) body += '\n\nСайт: ' + site;
    body += '\n\n---\n_Отправлено с сайта Дружок\'s Games_';

    var url = 'https://github.com/' +
      encodeURIComponent(GH_OWNER) + '/' +
      encodeURIComponent(GH_REPO) +
      '/issues/new?title=' + encodeURIComponent(title) +
      '&body=' + encodeURIComponent(body) +
      '&labels=guestbook';

    window.open(url, '_blank', 'noopener');
  }

  function initGB() {
    var form = document.getElementById('guestbook-form');
    if (!form) return;

    // показать предупреждение, если конфиг не заполнен
    if (!isGHConfigured()) {
      var warn = document.getElementById('gb-config-warn');
      if (warn) warn.style.display = 'block';
    }

    renderGB();

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var message = (data.get('message') || '').toString().trim();
      var site = (data.get('site') || '').toString().trim();

      if (!name || !message) return;

      var entries = loadGB();
      entries.push({
        name: name,
        message: message,
        site: site,
        date: new Date().toISOString()
      });
      saveGB(entries);
      form.reset();
      renderGB();
    });

    // кнопка «Открыть на GitHub»
    var ghBtn = document.getElementById('gb-gh-btn');
    if (ghBtn) {
      ghBtn.addEventListener('click', function () {
        if (!isGHConfigured()) {
          alert('Настрой GH_OWNER и GH_REPO в js/main.js — я не знаю, куда отправлять.');
          return;
        }
        var data = new FormData(form);
        var name = (data.get('name') || '').toString().trim() || 'Аноним';
        var message = (data.get('message') || '').toString().trim();
        var site = (data.get('site') || '').toString().trim();

        if (!message) {
          alert('Сначала напиши сообщение в поле «Сообщение».');
          return;
        }

        openGitHubIssue(name, message, site);
      });
    }
  }

  /* ---------- ИНИЦИАЛИЗАЦИЯ ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initCounter();
    initClock();
    initMusic();
    initGB();
  });

})();