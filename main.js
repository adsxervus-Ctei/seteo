(function () {
  "use strict";
  var B = window.__BRAND__ || {};
  function safe(fn, n) { try { fn(); } catch (e) { console.warn("[init]" + n, e); } }

  /* Splash */
  function initSplash() {
    var s = document.getElementById("splash"); if (!s) return;
    var hide = function () { s.classList.add("hidden"); };
    window.addEventListener("load", function () { setTimeout(hide, 900); });
    setTimeout(hide, 4500);
  }

  /* Nav solidify */
  function initNav() {
    var nav = document.getElementById("nav");
    var on = function () { if (window.scrollY > 40) nav.classList.add("solid"); else nav.classList.remove("solid"); };
    window.addEventListener("scroll", on, { passive: true }); on();
  }

  /* Hero background video: reveal only if it can play; else animated fallback stays */
  function initHeroVideo() {
    var v = document.getElementById("heroVideo"); if (!v) return;
    v.addEventListener("playing", function () { v.classList.add("on"); });
    v.addEventListener("loadeddata", function () { if (v.readyState >= 2) { try { v.play(); } catch (e) {} } });
    var p = v.play && v.play();
    if (p && p.catch) p.catch(function () {});
  }

  /* Reveal */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.05, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e, i) { e.style.transitionDelay = (i % 4) * 60 + "ms"; io.observe(e); });
    setTimeout(function () { els.forEach(function (e) { e.classList.add("in"); }); }, 6000);
  }

  /* Global links: WhatsApp + PDF */
  function initLinks() {
    document.querySelectorAll("[data-pdf]").forEach(function (a) {
      var url = B.pdf || "#";
      a.setAttribute("href", url);
      a.setAttribute("download", url.split("/").pop()); // fuerza descarga con nombre .pdf
      a.removeAttribute("target"); // sin pestaña nueva: evita que el escritorio guarde el HTML
      a.removeAttribute("rel");
    });
    var wa = "https://wa.me/" + (B.whatsapp || "") + "?text=" + encodeURIComponent("Hola " + (B.manager || "") + ", quisiera coordinar una presentación de la Organización Musical K LIBRE VALLENATO.");
    document.querySelectorAll("[data-wa]").forEach(function (a) { a.setAttribute("href", wa); });
  }

  /* Floating video modal — YouTube (mismo efecto que la galería) */
  function initVideoModal() {
    var lb = document.getElementById("videoLb");
    var mount = document.getElementById("vlbMount");
    var closeBtn = document.getElementById("vlbClose");
    if (!lb || !mount) return;
    var open = function (e) {
      if (e) e.preventDefault();
      lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
      if (mount.children.length === 0) {
        var id = (B.youtubeId || "").trim();
        if (id) {
          var ifr = document.createElement("iframe");
          ifr.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
          ifr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
          ifr.setAttribute("allowfullscreen", "");
          ifr.setAttribute("frameborder", "0");
          ifr.title = "K-Libre Vallenato";
          mount.appendChild(ifr);
        } else {
          mount.innerHTML = '<div class="vlb-msg">Para activar el video, pegue el <b>ID de YouTube</b> en <code>lib/manifest.js</code> (campo <code>youtubeId</code>).</div>';
        }
      }
    };
    var close = function () {
      lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
      mount.innerHTML = ""; // detiene la reproducción al cerrar
    };
    document.querySelectorAll("[data-video]").forEach(function (btn) { btn.addEventListener("click", open); });
    closeBtn && closeBtn.addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) close(); });
  }

  /* Reproductor de audio fijo (sencillos) */
  function initAudio() {
    var bar = document.getElementById("audiobar");
    var audio = document.getElementById("abAudio");
    var playBtn = document.getElementById("abPlay");
    var trackEl = document.getElementById("abTrack");
    var fill = document.getElementById("abFill");
    var progress = document.getElementById("abProgress");
    var toggle = document.getElementById("abToggle");
    var playlist = document.getElementById("abPlaylist");
    if (!bar || !audio) return;
    var songs = B.songs || [];
    var current = -1;
    bar.classList.add("paused");

    // construir lista
    var inner = document.createElement("div");
    inner.className = "ab-pl-inner";
    inner.innerHTML = '<div class="ab-pl-title">Escucha nuestros sencillos</div>';
    songs.forEach(function (s, i) {
      var row = document.createElement("div");
      row.className = "ab-song";
      row.innerHTML = '<span class="ab-song-ic">▶</span><span class="ab-song-title">' + s.title + '</span><span class="ab-song-num">' + (i + 1) + '</span>';
      row.addEventListener("click", function () { load(i, true); closeList(); });
      inner.appendChild(row);
    });
    playlist.appendChild(inner);
    var rows = inner.querySelectorAll(".ab-song");

    function setActive(i) {
      rows.forEach(function (r, k) {
        r.classList.toggle("active", k === i);
        r.querySelector(".ab-song-ic").textContent = (k === i) ? "♪" : "▶";
      });
    }
    function load(i, autoplay) {
      if (i < 0 || i >= songs.length) return;
      current = i;
      audio.src = songs[i].src || "";
      trackEl.textContent = songs[i].title;
      setActive(i);
      if (autoplay) play();
    }
    function play() {
      if (current === -1 && songs.length) { load(0, false); }
      if (!audio.src) return;
      var p = audio.play();
      if (p && p.catch) p.catch(function () { trackEl.textContent = "No se pudo reproducir (archivo pendiente)"; });
    }
    function pause() { audio.pause(); }
    function toggleList() { playlist.classList.toggle("open"); toggle.textContent = playlist.classList.contains("open") ? "Cerrar ▼" : "Lista ▲"; }
    function closeList() { playlist.classList.remove("open"); toggle.textContent = "Lista ▲"; }

    playBtn.addEventListener("click", function () { if (audio.paused) play(); else pause(); });
    toggle.addEventListener("click", toggleList);
    audio.addEventListener("play", function () { bar.classList.remove("paused"); playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>'; });
    audio.addEventListener("pause", function () { bar.classList.add("paused"); playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>'; });
    audio.addEventListener("timeupdate", function () { if (audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100) + "%"; });
    audio.addEventListener("ended", function () { if (current + 1 < songs.length) load(current + 1, true); else { fill.style.width = "0%"; } });
    audio.addEventListener("error", function () { if (audio.src) trackEl.textContent = songs[current] ? songs[current].title + " — (archivo pendiente)" : "Archivo pendiente"; });
    progress.addEventListener("click", function (e) {
      if (!audio.duration) return;
      var r = progress.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    safe(initSplash, "splash");
    safe(initNav, "nav");
    safe(initHeroVideo, "hero");
    safe(initReveal, "reveal");
    safe(initLinks, "links");
    safe(initVideoModal, "videoModal");
    safe(initAudio, "audio");
  });
})();
