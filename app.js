/**
 * CampusTrack — All College Events & Submissions Tracker
 * Complete client-side management of campus hackathons, deadlines, fests, workshops, and sports.
 * v4.0 — Full interactive: Grid/Compact views, Theme switcher, Details modal, Sound FX, Toast notifications
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'campustrack_events_v3';
  const THEME_KEY = 'campustrack_theme';
  const SOUND_KEY = 'campustrack_sound';
  const VIEW_KEY = 'campustrack_view';

  // ============================================================
  // Helper: Relative time offset ISO strings
  // ============================================================
  function offsetIso(hours) {
    const d = new Date();
    d.setTime(d.getTime() + hours * 60 * 60 * 1000);
    return d.toISOString();
  }

  // ============================================================
  // Default Events
  // ============================================================
  function getDefaultEvents() {
    return [
      {
        id: 'evt-exam-1',
        title: 'Computer Networks: Midterm Examination',
        category: 'exam',
        dept: 'Department of Computer Science',
        dateTime: offsetIso(38),
        venue: 'Main Academic Block, Exam Hall 102',
        link: '',
        desc: 'Midterm covering OSI 7-layer model, TCP/IP, sliding window protocol, and CIDR subnetting. Closed-book. Bring your hall ticket.',
        starred: false,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-1',
        title: 'HackSpark 2026: 24-Hour Inter-College Hackathon',
        category: 'hackathon',
        dept: 'ACM & IEEE Student Chapters',
        dateTime: offsetIso(26),
        venue: 'Student Activity Center, Arena Hall',
        link: 'https://devpost.com',
        desc: 'Overnight hackathon with $5,000 cash prizes, free food, mentor checkpoints, and internship opportunities. Register teams of 2–4.',
        starred: true,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-exam-2',
        title: 'Discrete Mathematics: Assessment & Quiz 2',
        category: 'exam',
        dept: 'Department of Mathematics',
        dateTime: offsetIso(110),
        venue: 'Science Block, Lecture Hall B',
        link: '',
        desc: 'Quiz covering Graph Theory, Tree Traversals, Eulerian circuits, and Boolean Algebra. Open-note allowed.',
        starred: false,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-2',
        title: 'Operating Systems: Kernel Module & Lab 4 Report',
        category: 'submission',
        dept: 'Department of Computer Science',
        dateTime: offsetIso(8.5),
        venue: 'College Moodle Portal',
        link: 'https://classroom.google.com',
        desc: 'Submit your compiled C kernel module implementation and a 4-page benchmarking report in PDF format. No late submissions.',
        starred: true,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-3',
        title: 'Hands-on Workshop: Building AI Agents with LLMs',
        category: 'workshop',
        dept: 'AI & Data Science Club',
        dateTime: offsetIso(72),
        venue: 'Computer Center Lab 3 & Online Stream',
        link: 'https://meet.google.com',
        desc: 'Practical 3-hour session covering API tool calling, embeddings, and deploying local open-source models. Prerequisites: Basic Python.',
        starred: false,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-4',
        title: 'Aura 2026: Annual Inter-College Cultural & Music Fest',
        category: 'fest',
        dept: 'Student Cultural Committee',
        dateTime: offsetIso(120),
        venue: 'Main Campus Amphitheatre',
        link: '',
        desc: 'Battle of the bands, street play competitions, dance battles, and live concert night featuring guest artists.',
        starred: false,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-5',
        title: 'CodeClash: Algorithmic Coding Challenge',
        category: 'hackathon',
        dept: 'Competitive Programming Society',
        dateTime: offsetIso(144),
        venue: 'Auditorium Hall B & HackerEarth',
        link: 'https://hackerearth.com',
        desc: '3-hour rapid algorithmic problem solving contest with tracks for beginners and advanced programmers. Rating points awarded.',
        starred: false,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-6',
        title: 'Database Management Systems: SQL Indexing Assignment',
        category: 'submission',
        dept: 'Dept of Information Technology',
        dateTime: offsetIso(48),
        venue: 'Canvas LMS Submission Portal',
        link: 'https://canvas.instructure.com',
        desc: 'Analyze query execution plans for 10 analytical queries and benchmark B-Tree vs Hash indexing strategies.',
        starred: false,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-7',
        title: 'Google & TCS Campus Placement Talk & Coding Round',
        category: 'career',
        dept: 'Career Development Cell',
        dateTime: offsetIso(168),
        venue: 'Placement Block Auditorium',
        link: '',
        desc: 'Pre-placement talk for final year & pre-final students followed by a technical online screening round. Formal attire required.',
        starred: false,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-8',
        title: 'Inter-Department Football Tournament Finals',
        category: 'sports',
        dept: 'Department of Physical Education',
        dateTime: offsetIso(96),
        venue: 'Campus Sports Complex Ground 1',
        link: '',
        desc: 'CSE Titans vs Mechanical Warriors in the annual college cup championship final. Spectators welcome.',
        starred: false,
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-9',
        title: 'Linear Algebra Problem Set 3',
        category: 'submission',
        dept: 'Department of Mathematics',
        dateTime: offsetIso(-24),
        venue: 'Math Portal',
        link: '',
        desc: 'Completed problem set covering Eigenvalues and SVD decomposition.',
        starred: false,
        completed: true,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // ============================================================
  // Application State
  // ============================================================
  const state = {
    events: [],
    filter: 'all',
    search: '',
    sortBy: 'date-asc',
    viewMode: localStorage.getItem(VIEW_KEY) || 'grid', // 'grid' | 'compact'
    soundEnabled: localStorage.getItem(SOUND_KEY) !== 'off',
    theme: localStorage.getItem(THEME_KEY) || 'violet',
    nextEvent: null
  };

  // ============================================================
  // Persistence
  // ============================================================
  function loadEvents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old events without starred field
        state.events = parsed.map(e => ({ starred: false, ...e }));
      } else {
        state.events = getDefaultEvents();
        saveEvents();
      }
    } catch (e) {
      console.warn('Error reading from storage:', e);
      state.events = getDefaultEvents();
    }
  }

  function saveEvents() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
    } catch (e) {
      console.error('Error saving events:', e);
    }
  }

  // ============================================================
  // Theme Engine
  // ============================================================
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update active button in dropdown
    document.querySelectorAll('.theme-opt').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });

    // Update label
    const label = document.getElementById('currentThemeLabel');
    const themeNames = {
      violet: 'Cosmic Violet',
      cyan: 'Cyber Cyan',
      emerald: 'Neon Matrix',
      sunset: 'Sunset Ruby',
      light: 'Daylight'
    };
    if (label) label.textContent = themeNames[theme] || theme;
  }

  // ============================================================
  // Sound FX Engine (Web Audio API)
  // ============================================================
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playChime(type = 'success') {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;

      const frequencies = {
        success: [523.25, 659.25, 783.99],    // C-E-G major chord
        done: [783.99, 659.25, 523.25],         // Descending
        add: [440, 523.25, 659.25],             // A-C-E
        delete: [349.23, 293.66],               // F-D descending
        notify: [880]                            // Single high ping
      };

      const freqs = frequencies[type] || frequencies.success;

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
    } catch (err) {
      // Audio not supported, fail silently
    }
  }

  function updateSoundToggleUI() {
    const onIcon = document.querySelector('.sound-icon-on');
    const offIcon = document.querySelector('.sound-icon-off');
    if (onIcon) onIcon.classList.toggle('hidden', !state.soundEnabled);
    if (offIcon) offIcon.classList.toggle('hidden', state.soundEnabled);
  }

  // ============================================================
  // Toast Notification
  // ============================================================
  function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);
    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    setTimeout(() => {
      toast.classList.remove('toast-visible');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  // ============================================================
  // Live Clock & Countdown Engine
  // ============================================================
  function updateLiveClock() {
    const timeEl = document.getElementById('liveTime');
    const dateEl = document.getElementById('liveDate');
    if (!timeEl || !dateEl) return;
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    dateEl.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  function calculateDiff(isoString) {
    const target = new Date(isoString).getTime();
    const now = Date.now();
    const diff = target - now;

    if (isNaN(target)) return { text: 'Date TBD', isUrgent: false, isPassed: false, days: 0, hours: 0, mins: 0, secs: 0 };
    if (diff <= 0) return { text: 'Past / Due', isUrgent: false, isPassed: true, days: 0, hours: 0, mins: 0, secs: 0 };

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const isUrgent = diff < 24 * 60 * 60 * 1000;

    let text = '';
    if (days > 0) text = `in ${days}d ${hours}h`;
    else if (hours > 0) text = `in ${hours}h ${mins}m`;
    else text = `in ${mins}m ${secs}s`;

    return { text, isUrgent, isPassed: false, days, hours, mins, secs, totalSeconds };
  }

  function formatDateTime(isoString) {
    if (!isoString) return 'Date TBD';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      + ' • '
      + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  // ============================================================
  // Hero Highlight
  // ============================================================
  function getCategoryBadgeText(cat) {
    const map = {
      exam: '📚 Exam / Quiz',
      hackathon: '🏆 Hackathon',
      submission: '📝 Assignment / Submission',
      workshop: '💡 Workshop / Talk',
      fest: '🎭 Cultural & Fest',
      career: '💼 Career & Placement',
      sports: '⚽ Sports Tournament',
      other: '📌 General Event'
    };
    return map[cat] || '📌 Event';
  }

  function updateHeroHighlight() {
    const heroTitle = document.getElementById('heroTitle');
    const heroCategory = document.getElementById('heroCategory');
    const heroDate = document.getElementById('heroDate');
    const heroVenue = document.getElementById('heroVenue');
    const heroActionBtn = document.getElementById('heroActionBtn');
    const heroMarkDoneBtn = document.getElementById('heroMarkDoneBtn');
    const heroDays = document.getElementById('heroDays');
    const heroHours = document.getElementById('heroHours');
    const heroMins = document.getElementById('heroMins');
    const heroSecs = document.getElementById('heroSecs');

    const now = Date.now();
    const upcoming = state.events
      .filter(e => !e.completed && new Date(e.dateTime).getTime() > now)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    state.nextEvent = upcoming.length > 0 ? upcoming[0] : null;

    if (!state.nextEvent) {
      if (heroTitle) heroTitle.textContent = 'All caught up! No upcoming events.';
      if (heroCategory) heroCategory.textContent = '🎉 All Done';
      if (heroDate) heroDate.textContent = 'Great job staying on top of deadlines!';
      if (heroVenue) heroVenue.textContent = '';
      if (heroActionBtn) heroActionBtn.style.display = 'none';
      if (heroMarkDoneBtn) heroMarkDoneBtn.style.display = 'none';
      const pad = n => '00';
      if (heroDays) heroDays.textContent = pad();
      if (heroHours) heroHours.textContent = pad();
      if (heroMins) heroMins.textContent = pad();
      if (heroSecs) heroSecs.textContent = pad();
      return;
    }

    const item = state.nextEvent;
    const diff = calculateDiff(item.dateTime);
    const pad = n => String(n).padStart(2, '0');

    if (heroTitle) heroTitle.textContent = item.title;
    if (heroCategory) heroCategory.textContent = getCategoryBadgeText(item.category);
    if (heroDate) heroDate.textContent = `📅 ${formatDateTime(item.dateTime)}`;
    if (heroVenue) heroVenue.textContent = item.venue ? `📍 ${item.venue}` : '';

    if (heroActionBtn) {
      heroActionBtn.style.display = 'inline-flex';
      heroActionBtn.href = item.link || '#';
      heroActionBtn.textContent = item.link ? 'Open Portal / Details →' : 'View Below →';
    }

    if (heroMarkDoneBtn) {
      heroMarkDoneBtn.style.display = 'inline-flex';
      heroMarkDoneBtn.onclick = () => toggleComplete(item.id, true);
    }

    if (heroDays) heroDays.textContent = pad(diff.days);
    if (heroHours) heroHours.textContent = pad(diff.hours);
    if (heroMins) heroMins.textContent = pad(diff.mins);
    if (heroSecs) heroSecs.textContent = pad(diff.secs);
  }

  // ============================================================
  // Filtering & Sorting
  // ============================================================
  function getFilteredEvents() {
    return state.events.filter(e => {
      if (state.search.trim()) {
        const q = state.search.toLowerCase().trim();
        const fields = [e.title, e.dept, e.venue, e.desc].map(f => (f || '').toLowerCase());
        if (!fields.some(f => f.includes(q))) return false;
      }

      if (state.filter === 'done') return e.completed;
      if (state.filter === 'starred') return e.starred && !e.completed;
      if (state.filter !== 'all') {
        if (e.category !== state.filter) return false;
      }
      return true;
    }).sort((a, b) => {
      if (state.sortBy === 'date-asc') return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      if (state.sortBy === 'date-desc') return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      if (state.sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });
  }

  // ============================================================
  // View Mode: Grid Card
  // ============================================================
  function renderGridCard(item) {
    const diff = calculateDiff(item.dateTime);
    const isUrgent = diff.isUrgent && !item.completed;
    const formattedDate = formatDateTime(item.dateTime);
    let countdownBadgeText = item.completed ? 'Completed ✓' : diff.text;

    return `
      <article class="event-card ${item.completed ? 'status-done' : ''} ${isUrgent ? 'urgent-card' : ''}" data-id="${item.id}">
        <div>
          <div class="card-top">
            <span class="card-category-badge badge-${item.category}">${getCategoryBadgeText(item.category)}</span>
            <div class="card-top-right">
              <button class="icon-btn star-btn ${item.starred ? 'starred' : ''}" data-action="star" title="${item.starred ? 'Unstar' : 'Star event'}" aria-label="Star">⭐</button>
              <span class="card-countdown-tag ${isUrgent ? 'urgent' : ''}" data-countdown="${item.dateTime}">${countdownBadgeText}</span>
            </div>
          </div>

          ${item.dept ? `<div class="card-dept">${escapeHtml(item.dept)}</div>` : ''}
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          ${item.desc ? `<p class="card-desc">${escapeHtml(item.desc)}</p>` : ''}

          <div class="card-meta-list">
            <div class="card-meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>${formattedDate}</span>
            </div>
            ${item.venue ? `
            <div class="card-meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${escapeHtml(item.venue)}</span>
            </div>` : ''}
            ${item.link ? `
            <div class="card-meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Official Link →</a>
            </div>` : ''}
          </div>
        </div>

        <div class="card-bottom-actions">
          <button class="btn-toggle-done ${item.completed ? 'done' : ''}" data-action="toggle-done">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${item.completed ? 'Attended / Done' : 'Mark Done'}</span>
          </button>

          <div class="card-icon-btns">
            <button class="icon-btn" data-action="inspect" title="View Details" aria-label="View Details">🔍</button>
            <button class="icon-btn" data-action="ical" title="Add to Calendar" aria-label="Export Calendar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </button>
            <button class="icon-btn" data-action="edit" title="Edit Event" aria-label="Edit">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="icon-btn delete" data-action="delete" title="Delete Event" aria-label="Delete">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  // ============================================================
  // View Mode: Compact List Row
  // ============================================================
  function renderCompactRow(item) {
    const diff = calculateDiff(item.dateTime);
    const isUrgent = diff.isUrgent && !item.completed;
    const formattedDate = formatDateTime(item.dateTime);
    const countdownText = item.completed ? '✓ Done' : diff.isPassed ? 'Overdue' : diff.text;

    return `
      <div class="compact-row ${item.completed ? 'status-done' : ''} ${isUrgent ? 'urgent-card' : ''}" data-id="${item.id}">
        <div class="compact-left">
          <button class="compact-check-btn ${item.completed ? 'done' : ''}" data-action="toggle-done" title="Toggle done">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
          <span class="compact-cat-dot dot-${item.category}" title="${getCategoryBadgeText(item.category)}"></span>
        </div>

        <div class="compact-body">
          <div class="compact-title ${item.completed ? 'line-through' : ''}">${escapeHtml(item.title)}</div>
          <div class="compact-meta">
            ${item.dept ? `<span class="compact-dept">${escapeHtml(item.dept)}</span>` : ''}
            ${item.venue ? `<span>📍 ${escapeHtml(item.venue)}</span>` : ''}
          </div>
        </div>

        <div class="compact-right">
          <div class="compact-date">${formattedDate}</div>
          <span class="compact-countdown ${isUrgent ? 'urgent' : ''} ${diff.isPassed && !item.completed ? 'overdue' : ''}">${countdownText}</span>
        </div>

        <div class="compact-actions">
          <button class="icon-btn compact-icon" data-action="star" title="Star" aria-label="Star">${item.starred ? '⭐' : '☆'}</button>
          <button class="icon-btn compact-icon" data-action="inspect" title="Details" aria-label="Details">🔍</button>
          <button class="icon-btn compact-icon" data-action="edit" title="Edit" aria-label="Edit">✏️</button>
          <button class="icon-btn compact-icon delete" data-action="delete" title="Delete" aria-label="Delete">🗑️</button>
        </div>
      </div>
    `;
  }

  // ============================================================
  // Main Render Function
  // ============================================================
  function render() {
    updateHeroHighlight();

    // Stats
    const totalCount = state.events.length;
    const examCount = state.events.filter(e => e.category === 'exam' && !e.completed).length;
    const hackathonCount = state.events.filter(e => e.category === 'hackathon' && !e.completed).length;
    const submissionCount = state.events.filter(e => e.category === 'submission' && !e.completed).length;
    const workshopCount = state.events.filter(e => e.category === 'workshop' && !e.completed).length;
    const festCount = state.events.filter(e => (e.category === 'fest' || e.category === 'sports') && !e.completed).length;

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('statTotalCount', totalCount);
    setEl('statExams', examCount);
    setEl('statHackathons', hackathonCount);
    setEl('statSubmissions', submissionCount);
    setEl('statWorkshops', workshopCount);
    setEl('statFests', festCount);

    // Grid / List rendering
    const grid = document.getElementById('eventsGrid');
    const emptyState = document.getElementById('emptyState');
    if (!grid) return;

    const filtered = getFilteredEvents();

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const isCompact = state.viewMode === 'compact';
    grid.classList.toggle('events-grid-compact', isCompact);
    grid.classList.toggle('events-grid-cards', !isCompact);

    grid.innerHTML = filtered.map(item =>
      isCompact ? renderCompactRow(item) : renderGridCard(item)
    ).join('');
  }

  // ============================================================
  // Actions
  // ============================================================
  function toggleComplete(id, fromHero = false) {
    const item = state.events.find(e => e.id === id);
    if (!item) return;
    item.completed = !item.completed;
    saveEvents();
    render();
    if (item.completed) {
      playChime('done');
      showToast(`"${item.title}" marked as completed! 🎉`, 'success');
    } else {
      showToast(`"${item.title}" marked as pending.`, 'info');
    }
  }

  function toggleStar(id) {
    const item = state.events.find(e => e.id === id);
    if (!item) return;
    item.starred = !item.starred;
    saveEvents();
    render();
    showToast(item.starred ? '⭐ Starred!' : 'Unstarred.', 'info', 1500);
  }

  function deleteEvent(id) {
    const item = state.events.find(e => e.id === id);
    if (!item) return;
    if (confirm(`Remove "${item.title}"?`)) {
      state.events = state.events.filter(e => e.id !== id);
      saveEvents();
      render();
      playChime('delete');
      showToast('Event removed.', 'warning');
    }
  }

  // ============================================================
  // Details Modal
  // ============================================================
  const detailsModal = document.getElementById('eventDetailsModal');

  function openDetailsModal(id) {
    const item = state.events.find(e => e.id === id);
    if (!item || !detailsModal) return;

    const diff = calculateDiff(item.dateTime);

    const setEl = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };
    const setHtml = (elId, val) => { const el = document.getElementById(elId); if (el) el.innerHTML = val; };

    setHtml('detailCategoryBadge', getCategoryBadgeText(item.category));
    setEl('detailTitle', item.title);
    setEl('detailDateTime', formatDateTime(item.dateTime));
    setEl('detailVenue', item.venue || 'Not specified');
    setEl('detailDept', item.dept || 'General');
    setEl('detailCountdown', item.completed ? '✅ Completed' : diff.isPassed ? '⌛ Overdue' : diff.text);
    setEl('detailDesc', item.desc || 'No additional description provided.');

    // Dynamic checklist based on category
    const checklists = {
      exam: ['✅ Check hall ticket / registration', '✅ Review syllabus chapters', '✅ Pack stationery & ID', '✅ Check exam venue & time'],
      hackathon: ['✅ Confirm team registration', '✅ Set up dev environment', '✅ Review problem domains', '✅ Pack laptop charger & power bank'],
      submission: ['✅ Verify submission format (PDF/ZIP)', '✅ Double-check all requirements', '✅ Test upload on portal', '✅ Save a local backup'],
      workshop: ['✅ Complete prerequisites', '✅ Install required tools/software', '✅ Bring notebook & pen', '✅ Confirm attendance link'],
      fest: ['✅ Register for events', '✅ Confirm travel/transport', '✅ Note dress code', '✅ Plan your schedule'],
      career: ['✅ Update resume & LinkedIn', '✅ Research the company', '✅ Prepare formal attire', '✅ Practice common interview questions'],
      sports: ['✅ Confirm your team lineup', '✅ Bring sports equipment', '✅ Arrive 30 mins early', '✅ Stay hydrated!'],
    };
    const items = checklists[item.category] || ['✅ Confirm participation', '✅ Set a reminder', '✅ Check venue/time'];
    const checklistEl = document.getElementById('detailChecklist');
    if (checklistEl) {
      checklistEl.innerHTML = items.map(text => `
        <li>
          <label class="checklist-item">
            <input type="checkbox">
            <span class="checklist-text">${text}</span>
          </label>
        </li>
      `).join('');
    }

    // External link
    const linkEl = document.getElementById('detailExternalLink');
    if (linkEl) {
      if (item.link) {
        linkEl.href = item.link;
        linkEl.style.display = 'inline-flex';
      } else {
        linkEl.style.display = 'none';
      }
    }

    // Copy details button
    const copyBtn = document.getElementById('detailCopyBtn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const text = `📌 ${item.title}\n📅 ${formatDateTime(item.dateTime)}\n📍 ${item.venue || 'TBD'}\n🏛️ ${item.dept || ''}\n\n${item.desc || ''}`;
        navigator.clipboard.writeText(text).then(() => {
          showToast('Event details copied to clipboard! 📋', 'success');
        });
      };
    }

    // Export single event
    const calBtn = document.getElementById('detailCalendarBtn');
    if (calBtn) {
      calBtn.onclick = () => exportIcs([item], `${(item.title || 'event').replace(/\W+/g, '-')}.ics`);
    }

    if (typeof detailsModal.showModal === 'function') detailsModal.showModal();
    else detailsModal.setAttribute('open', 'true');
  }

  function closeDetailsModal() {
    if (!detailsModal) return;
    if (typeof detailsModal.close === 'function') detailsModal.close();
    else detailsModal.removeAttribute('open');
  }

  // ============================================================
  // Add / Edit Modal
  // ============================================================
  const modal = document.getElementById('eventModal');
  const form = document.getElementById('eventForm');

  function openModal(editId = null) {
    if (!modal || !form) return;
    form.reset();

    const heading = document.getElementById('modalHeading');
    const editInput = document.getElementById('editEventId');

    if (editId) {
      const item = state.events.find(e => e.id === editId);
      if (!item) return;

      heading.textContent = 'Edit College Event';
      editInput.value = item.id;
      document.getElementById('eventTitle').value = item.title || '';
      document.getElementById('eventCategory').value = item.category || 'hackathon';
      document.getElementById('eventDept').value = item.dept || '';

      if (item.dateTime) {
        const d = new Date(item.dateTime);
        const pad = n => String(n).padStart(2, '0');
        document.getElementById('eventDate').value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }

      document.getElementById('eventVenue').value = item.venue || '';
      document.getElementById('eventLink').value = item.link || '';
      document.getElementById('eventDesc').value = item.desc || '';
    } else {
      heading.textContent = 'Add New College Event';
      editInput.value = '';

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const pad = n => String(n).padStart(2, '0');
      document.getElementById('eventDate').value = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
    }

    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', 'true');
  }

  function closeModal() {
    if (!modal) return;
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('editEventId').value;
    const title = document.getElementById('eventTitle').value.trim();
    const category = document.getElementById('eventCategory').value;
    const dept = document.getElementById('eventDept').value.trim();
    const dateTime = new Date(document.getElementById('eventDate').value).toISOString();
    const venue = document.getElementById('eventVenue').value.trim();
    const link = document.getElementById('eventLink').value.trim();
    const desc = document.getElementById('eventDesc').value.trim();

    if (!title || !dateTime) return;

    if (editId) {
      const idx = state.events.findIndex(ev => ev.id === editId);
      if (idx !== -1) {
        state.events[idx] = { ...state.events[idx], title, category, dept, dateTime, venue, link, desc };
      }
      showToast('Event updated! ✏️', 'success');
    } else {
      state.events.unshift({
        id: 'evt-' + Date.now(),
        title, category, dept, dateTime, venue, link, desc,
        starred: false,
        completed: false,
        createdAt: new Date().toISOString()
      });
      playChime('add');
      showToast(`"${title}" added! 🎉`, 'success');
    }

    saveEvents();
    closeModal();
    render();
  }

  // ============================================================
  // iCal Export
  // ============================================================
  function exportIcs(itemList, filename = 'college-events.ics') {
    const pad = n => String(n).padStart(2, '0');
    const formatIcsDate = d => (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) + 'Z'
    );

    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CampusTrack//College Events//EN', 'CALSCALE:GREGORIAN'];

    itemList.forEach(item => {
      const start = new Date(item.dateTime);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      lines.push(
        'BEGIN:VEVENT',
        `UID:campustrack-${item.id}@college.edu`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${formatIcsDate(start)}`,
        `DTEND:${formatIcsDate(end)}`,
        `SUMMARY:${escapeIcs(item.title)}`,
        ...(item.desc ? [`DESCRIPTION:${escapeIcs(item.desc)}`] : []),
        ...(item.venue ? [`LOCATION:${escapeIcs(item.venue)}`] : []),
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Calendar file exported! 📅', 'success');
  }

  // ============================================================
  // Utility
  // ============================================================
  function escapeIcs(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ============================================================
  // View Mode Toggle
  // ============================================================
  function setViewMode(mode) {
    state.viewMode = mode;
    localStorage.setItem(VIEW_KEY, mode);

    const gridBtn = document.getElementById('viewGridBtn');
    const compactBtn = document.getElementById('viewCompactBtn');
    if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');
    if (compactBtn) compactBtn.classList.toggle('active', mode === 'compact');

    render();
  }

  // ============================================================
  // Event Bindings
  // ============================================================
  function setupEvents() {
    // Live tick
    setInterval(() => {
      updateLiveClock();
      updateHeroHighlight();
      document.querySelectorAll('[data-countdown]').forEach(el => {
        const iso = el.getAttribute('data-countdown');
        if (!el.textContent.includes('✓')) {
          const diff = calculateDiff(iso);
          el.textContent = diff.text;
          el.classList.toggle('urgent', diff.isUrgent);
        }
      });
    }, 1000);
    updateLiveClock();

    // Search
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        state.search = e.target.value;
        if (clearSearchBtn) clearSearchBtn.classList.toggle('hidden', !e.target.value);
        render();
      });
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        state.search = '';
        clearSearchBtn.classList.add('hidden');
        render();
      });
    }

    // Filter pills
    document.querySelectorAll('.filter-pills .pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pills .pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.filter = btn.getAttribute('data-filter');
        render();
      });
    });

    // Stat boxes as filters
    document.querySelectorAll('.stat-box').forEach(box => {
      box.addEventListener('click', () => {
        const cat = box.getAttribute('data-stat-filter');
        document.querySelectorAll('.filter-pills .pill').forEach(b => b.classList.remove('active'));
        const pill = document.querySelector(`.filter-pills .pill[data-filter="${cat}"]`);
        if (pill) pill.classList.add('active');
        state.filter = cat;
        render();
      });
    });

    // Sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', e => {
        state.sortBy = e.target.value;
        render();
      });
    }

    // View mode toggle buttons
    const viewGridBtn = document.getElementById('viewGridBtn');
    const viewCompactBtn = document.getElementById('viewCompactBtn');
    if (viewGridBtn) viewGridBtn.addEventListener('click', () => setViewMode('grid'));
    if (viewCompactBtn) viewCompactBtn.addEventListener('click', () => setViewMode('compact'));

    // Add/Edit modal triggers
    const openAddModalBtn = document.getElementById('openAddModalBtn');
    const emptyAddBtn = document.getElementById('emptyAddBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    if (openAddModalBtn) openAddModalBtn.addEventListener('click', () => openModal());
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', () => openModal());
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (form) form.addEventListener('submit', handleFormSubmit);

    // Close modals on backdrop click
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    if (detailsModal) detailsModal.addEventListener('click', e => { if (e.target === detailsModal) closeDetailsModal(); });

    // Details modal close button
    const closeDetailsBtn = document.getElementById('closeDetailsModalBtn');
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', closeDetailsModal);

    // Hero inspect button
    const heroInspectBtn = document.getElementById('heroInspectBtn');
    if (heroInspectBtn) {
      heroInspectBtn.addEventListener('click', () => {
        if (state.nextEvent) openDetailsModal(state.nextEvent.id);
      });
    }

    // Card/row click delegation (grid and compact both)
    const grid = document.getElementById('eventsGrid');
    if (grid) {
      grid.addEventListener('click', e => {
        const card = e.target.closest('[data-id]');
        if (!card) return;
        const id = card.getAttribute('data-id');

        if (e.target.closest('[data-action="toggle-done"]')) {
          toggleComplete(id);
        } else if (e.target.closest('[data-action="delete"]')) {
          deleteEvent(id);
        } else if (e.target.closest('[data-action="edit"]')) {
          openModal(id);
        } else if (e.target.closest('[data-action="ical"]')) {
          const item = state.events.find(x => x.id === id);
          if (item) exportIcs([item], `${(item.title || 'event').replace(/\W+/g, '-')}.ics`);
        } else if (e.target.closest('[data-action="inspect"]')) {
          openDetailsModal(id);
        } else if (e.target.closest('[data-action="star"]')) {
          toggleStar(id);
        }
      });
    }

    // Export all iCal
    const exportIcsBtn = document.getElementById('exportIcsBtn');
    if (exportIcsBtn) {
      exportIcsBtn.addEventListener('click', () => exportIcs(state.events, 'all-college-events.ics'));
    }

    // Sound toggle
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        localStorage.setItem(SOUND_KEY, state.soundEnabled ? 'on' : 'off');
        updateSoundToggleUI();
        if (state.soundEnabled) {
          playChime('notify');
          showToast('Sound effects enabled 🔊', 'info', 1500);
        } else {
          showToast('Sound effects muted 🔇', 'info', 1500);
        }
      });
    }

    // Theme dropdown
    const themeMenuBtn = document.getElementById('themeMenuBtn');
    const themeDropdownMenu = document.getElementById('themeDropdownMenu');
    if (themeMenuBtn && themeDropdownMenu) {
      themeMenuBtn.addEventListener('click', e => {
        e.stopPropagation();
        themeDropdownMenu.classList.toggle('hidden');
      });

      document.querySelectorAll('.theme-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const theme = btn.getAttribute('data-theme');
          applyTheme(theme);
          themeDropdownMenu.classList.add('hidden');
          showToast(`Theme changed to ${theme}! 🎨`, 'info', 1500);
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', e => {
        if (!themeMenuBtn.contains(e.target) && !themeDropdownMenu.contains(e.target)) {
          themeDropdownMenu.classList.add('hidden');
        }
      });
    }

    // Reset to defaults
    const resetDemoBtn = document.getElementById('resetDemoBtn');
    if (resetDemoBtn) {
      resetDemoBtn.addEventListener('click', () => {
        if (confirm('Reset to default college events, hackathons, and submissions?')) {
          state.events = getDefaultEvents();
          saveEvents();
          render();
          showToast('Events reset to defaults! 🔄', 'info');
        }
      });
    }
  }

  // ============================================================
  // Init
  // ============================================================
  function init() {
    loadEvents();
    applyTheme(state.theme);
    updateSoundToggleUI();
    setViewMode(state.viewMode);
    setupEvents();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
