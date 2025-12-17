// app.js
(() => {
  const audio = document.getElementById("audio");
  const cover = document.getElementById("cover");
  const titleEl = document.getElementById("title");
  const artistEl = document.getElementById("artist");
  const listEl = document.getElementById("list");
  const countEl = document.getElementById("count");

  const playBtn = document.getElementById("playBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const seek = document.getElementById("seek");
  const curTime = document.getElementById("curTime");
  const durTime = document.getElementById("durTime");

  const vol = document.getElementById("vol");
  const autoplay = document.getElementById("autoplay");

  document.getElementById("year").textContent = new Date().getFullYear();

  const tracks = Array.isArray(window.TRACKS) ? window.TRACKS : [];
  countEl.textContent = `${tracks.length} track${tracks.length === 1 ? "" : "s"}`;

  let idx = 0;
  let isSeeking = false;

  function fmtTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function setActiveRow() {
    [...listEl.querySelectorAll(".item")].forEach((li, i) => {
      li.classList.toggle("active", i === idx);
    });
  }

  function loadTrack(i, { autoplayPlay = false } = {}) {
    if (!tracks.length) return;
    idx = (i + tracks.length) % tracks.length;
    const t = tracks[idx];

    titleEl.textContent = t.title || "—";
    artistEl.textContent = t.artist || "—";
    cover.src = t.cover || "";
    cover.alt = `${t.title || "Track"} cover`;

    audio.src = t.src;
    audio.load();

    setActiveRow();

    // reset UI
    seek.value = 0;
    curTime.textContent = "0:00";
    durTime.textContent = "0:00";
    playBtn.textContent = "▶";

    if (autoplayPlay) {
      audio.play().then(() => {
        playBtn.textContent = "⏸";
      }).catch(() => {
        // Browser blocked autoplay; user must tap play.
      });
    }
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().then(() => {
        playBtn.textContent = "⏸";
      }).catch(() => {});
    } else {
      audio.pause();
      playBtn.textContent = "▶";
    }
  }

  function next() { loadTrack(idx + 1, { autoplayPlay: true }); }
  function prev() { loadTrack(idx - 1, { autoplayPlay: true }); }

  // Build library list
  function buildList() {
    listEl.innerHTML = "";
    tracks.forEach((t, i) => {
      const li = document.createElement("li");
      li.className = "item";
      li.tabIndex = 0;
      li.innerHTML = `
        <div class="left">
          <div class="t">${t.title || "Untitled"}</div>
          <div class="a">${t.artist || ""}</div>
        </div>
        <div class="right">
          ${t.tag ? `<span class="badge">${t.tag}</span>` : ""}
          <span>Tap to play</span>
        </div>
      `;
      li.addEventListener("click", () => loadTrack(i, { autoplayPlay: true }));
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") loadTrack(i, { autoplayPlay: true });
      });
      listEl.appendChild(li);
    });
  }

  // Events
  playBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  vol.addEventListener("input", () => {
    audio.volume = Number(vol.value);
  });
  audio.volume = Number(vol.value);

  audio.addEventListener("loadedmetadata", () => {
    durTime.textContent = fmtTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (isSeeking) return;
    const d = audio.duration || 0;
    const c = audio.currentTime || 0;
    curTime.textContent = fmtTime(c);
    durTime.textContent = fmtTime(d);
    if (d > 0) {
      seek.value = Math.floor((c / d) * 1000);
    }
  });

  seek.addEventListener("pointerdown", () => { isSeeking = true; });
  seek.addEventListener("pointerup", () => { isSeeking = false; });

  seek.addEventListener("input", () => {
    const d = audio.duration || 0;
    if (d <= 0) return;
    const pct = Number(seek.value) / 1000;
    audio.currentTime = pct * d;
  });

  audio.addEventListener("ended", () => {
    playBtn.textContent = "▶";
    if (autoplay.checked) next();
  });

  // Init
  buildList();
  loadTrack(0, { autoplayPlay: false });
})();
