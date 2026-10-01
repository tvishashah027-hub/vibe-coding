/**
 * CampusTrack — All College Events & Submissions Tracker
 * Complete client-side management of campus hackathons, deadlines, fests, workshops, and sports.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'campustrack_events_v3';

  // Helper to generate dynamic ISO strings relative to current time
  function offsetIso(hours) {
    const d = new Date();
    d.setTime(d.getTime() + hours * 60 * 60 * 1000);
    return d.toISOString();
  }

  // Realistic sample events covering all college activities
  function getDefaultEvents() {
    return [
      {
        id: 'evt-exam-1',
        title: 'Computer Networks: Midterm Examination',
        category: 'exam',
        dept: 'Department of Computer Science',
        dateTime: offsetIso(38), // ~1.5 days
        venue: 'Main Academic Block, Exam Hall 102',
        link: '',
        desc: 'Midterm covering OSI 7-layer reference model, TCP/IP, sliding window protocol, and CIDR subnetting. Closed-book.',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-1',
        title: 'HackSpark 2026: 24-Hour Inter-College Hackathon',
        category: 'hackathon',
        dept: 'ACM & IEEE Student Chapters',
        dateTime: offsetIso(26), // Tomorrow (~26 hours)
        venue: 'Student Activity Center, Arena Hall',
        link: 'https://devpost.com',
        desc: 'Overnight hackathon with $5,000 cash prizes, free food, mentor checkpoints, and internship opportunities.',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-exam-2',
        title: 'Discrete Mathematics: Assessment & Quiz 2',
        category: 'exam',
        dept: 'Department of Mathematics',
        dateTime: offsetIso(110), // ~4.5 days
        venue: 'Science Block, Lecture Hall B',
        link: '',
        desc: 'Quiz covering Graph Theory, Tree Traversals, Eulerian circuits, and Boolean Algebra.',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-2',
        title: 'Operating Systems: Kernel Module & Lab 4 Report',
        category: 'submission',
        dept: 'Department of Computer Science',
        dateTime: offsetIso(8.5), // Due in 8.5 hours (urgent!)
        venue: 'College Moodle Portal',
        link: 'https://classroom.google.com',
        desc: 'Submit your compiled C kernel module implementation and a 4-page benchmarking report in PDF format.',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-3',
        title: 'Hands-on Workshop: Building AI Agents with LLMs',
        category: 'workshop',
        dept: 'AI & Data Science Club',
        dateTime: offsetIso(72), // 3 days
        venue: 'Computer Center Lab 3 & Online Stream',
        link: 'https://meet.google.com',
        desc: 'Practical 3-hour session covering API tool calling, embeddings, and deploying local open-source models.',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-4',
        title: 'Aura 2026: Annual Inter-College Cultural & Music Fest',
        category: 'fest',
        dept: 'Student Cultural Committee',
        dateTime: offsetIso(120), // 5 days
        venue: 'Main Campus Amphitheatre',
        link: '',
        desc: 'Battle of the bands, street play competitions, dance battles, and live concert night featuring guest artists.',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-5',
        title: 'CodeClash: Algorithmic Coding Challenge',
        category: 'hackathon',
        dept: 'Competitive Programming Society',
        dateTime: offsetIso(144), // 6 days
        venue: 'Auditorium Hall B & HackerEarth',
        link: 'https://hackerearth.com',
        desc: '3-hour rapid algorithmic problem solving contest with tracks for beginners and advanced programmers.',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-6',
        title: 'Database Management Systems: SQL Indexing Assignment',
        category: 'submission',
        dept: 'Dept of Information Tech',
        dateTime: offsetIso(48), // 2 days
        venue: 'Canvas LMS Submission Portal',
        link: 'https://canvas.instructure.com',
        desc: 'Analyze query execution plans for 10 analytical queries and benchmark B-Tree vs Hash indexing.',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-7',
        title: 'Google & TCS Campus Placement Talk & Coding Round',
        category: 'career',
        dept: 'Career Development Cell',
        dateTime: offsetIso(168), // 7 days
        venue: 'Placement Block Auditorium',
        link: '',
        desc: 'Pre-placement presentation for final year & pre-final year students followed by technical online screening.',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-8',
        title: 'Inter-Department Football Tournament Finals',
        category: 'sports',
        dept: 'Department of Physical Education',
        dateTime: offsetIso(96), // 4 days
        venue: 'Campus Sports Complex Ground 1',
        link: '',
        desc: 'CSE Titans vs Mechanical Warriors in the annual college cup championship final.',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'evt-9',
        title: 'Linear Algebra Problem Set 3',
        category: 'submission',
        dept: 'Department of Mathematics',
        dateTime: offsetIso(-24), // Finished yesterday
        venue: 'Math Portal',
        link: '',
        desc: 'Completed problem set covering Eigenvalues and SVD.',
        completed: true,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Application State
  const state = {
    events: [],
    filter: 'all',
    search: '',
    sortBy: 'date-asc',
    nextEvent: null
  };

  // ==========================================================================
  // Persistence
  // ==========================================================================
  function loadEvents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        state.events = JSON.parse(stored);
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

  // ==========================================================================
  // Clocks & Countdown Engine
  // ==========================================================================
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
    if (diff <= 0) return { text: 'Past Event / Due', isUrgent: false, isPassed: true, days: 0, hours: 0, mins: 0, secs: 0 };

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

    return d.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }) + ' • ' + d.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  // ==========================================================================
  // Hero Highlight Update
  // ==========================================================================
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

    // Find the closest upcoming uncompleted event
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
      if (heroDays) heroDays.textContent = '00';
      if (heroHours) heroHours.textContent = '00';
      if (heroMins) heroMins.textContent = '00';
      if (heroSecs) heroSecs.textContent = '00';
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
      if (item.link) {
        heroActionBtn.href = item.link;
        heroActionBtn.textContent = 'Open Portal / Details →';
      } else {
        heroActionBtn.href = '#';
        heroActionBtn.textContent = 'View Below →';
      }
    }

    if (heroMarkDoneBtn) {
      heroMarkDoneBtn.style.display = 'inline-flex';
      heroMarkDoneBtn.onclick = () => {
        toggleComplete(item.id);
      };
    }

    if (heroDays) heroDays.textContent = pad(diff.days);
    if (heroHours) heroHours.textContent = pad(diff.hours);
    if (heroMins) heroMins.textContent = pad(diff.mins);
    if (heroSecs) heroSecs.textContent = pad(diff.secs);
  }

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

  // ==========================================================================
  // Filtering & Sorting
  // ==========================================================================
  function getFilteredEvents() {
    return state.events.filter(e => {
      // 1. Search Query
      if (state.search.trim()) {
        const q = state.search.toLowerCase().trim();
        const titleMatch = (e.title || '').toLowerCase().includes(q);
        const deptMatch = (e.dept || '').toLowerCase().includes(q);
        const venueMatch = (e.venue || '').toLowerCase().includes(q);
        const descMatch = (e.desc || '').toLowerCase().includes(q);
        if (!titleMatch && !deptMatch && !venueMatch && !descMatch) return false;
      }

      // 2. Filter Tab
      if (state.filter === 'done') return e.completed;
      if (state.filter !== 'all') {
        if (e.category !== state.filter) return false;
      }

      return true;
    }).sort((a, b) => {
      if (state.sortBy === 'date-asc') {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      }
      if (state.sortBy === 'date-desc') {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      }
      if (state.sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  }

  // ==========================================================================
  // Render Dashboard & Cards
  // ==========================================================================
  function render() {
    // 1. Update Hero
    updateHeroHighlight();

    // 2. Update Stats Numbers
    const totalCount = state.events.length;
    const examCount = state.events.filter(e => e.category === 'exam' && !e.completed).length;
    const hackathonCount = state.events.filter(e => e.category === 'hackathon' && !e.completed).length;
    const submissionCount = state.events.filter(e => e.category === 'submission' && !e.completed).length;
    const workshopCount = state.events.filter(e => e.category === 'workshop' && !e.completed).length;
    const festCount = state.events.filter(e => (e.category === 'fest' || e.category === 'sports') && !e.completed).length;

    const totalEl = document.getElementById('statTotalCount');
    const examEl = document.getElementById('statExams');
    const hackEl = document.getElementById('statHackathons');
    const subEl = document.getElementById('statSubmissions');
    const workEl = document.getElementById('statWorkshops');
    const festEl = document.getElementById('statFests');

    if (totalEl) totalEl.textContent = totalCount;
    if (examEl) examEl.textContent = examCount;
    if (hackEl) hackEl.textContent = hackathonCount;
    if (subEl) subEl.textContent = submissionCount;
    if (workEl) workEl.textContent = workshopCount;
    if (festEl) festEl.textContent = festCount;

    // 3. Render Cards Grid
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

    grid.innerHTML = filtered.map(item => {
      const diff = calculateDiff(item.dateTime);
      const isUrgent = diff.isUrgent && !item.completed;
      const formattedDate = formatDateTime(item.dateTime);

      let countdownBadgeText = diff.text;
      if (item.completed) countdownBadgeText = 'Completed ✓';

      return `
        <article class="event-card ${item.completed ? 'status-done' : ''}" data-id="${item.id}">
          <div>
            <div class="card-top">
              <span class="card-category-badge badge-${item.category}">
                ${getCategoryBadgeText(item.category)}
              </span>
              <span class="card-countdown-tag ${isUrgent ? 'urgent' : ''}" data-countdown="${item.dateTime}">
                ${countdownBadgeText}
              </span>
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
                </div>
              ` : ''}
              ${item.link ? `
                <div class="card-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Official Link / Portal &rarr;</a>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="card-bottom-actions">
            <button class="btn-toggle-done ${item.completed ? 'done' : ''}" data-action="toggle-done">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>${item.completed ? 'Attended / Done' : 'Mark Done'}</span>
            </button>

            <div class="card-icon-btns">
              <button class="icon-btn" data-action="ical" title="Add to Calendar (.ics)" aria-label="Export to Calendar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </button>
              <button class="icon-btn" data-action="edit" title="Edit Event" aria-label="Edit Event">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="icon-btn delete" data-action="delete" title="Delete Event" aria-label="Delete Event">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // ==========================================================================
  // Actions
  // ==========================================================================
  function toggleComplete(id) {
    const item = state.events.find(e => e.id === id);
    if (!item) return;
    item.completed = !item.completed;
    saveEvents();
    render();
  }

  function deleteEvent(id) {
    const item = state.events.find(e => e.id === id);
    if (!item) return;
    if (confirm(`Remove event "${item.title}"?`)) {
      state.events = state.events.filter(e => e.id !== id);
      saveEvents();
      render();
    }
  }

  // ==========================================================================
  // Modal: Add / Edit Event
  // ==========================================================================
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
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        document.getElementById('eventDate').value = formatted;
      }

      document.getElementById('eventVenue').value = item.venue || '';
      document.getElementById('eventLink').value = item.link || '';
      document.getElementById('eventDesc').value = item.desc || '';
    } else {
      heading.textContent = 'Add New College Event';
      editInput.value = '';

      // Default date to tomorrow 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const pad = n => String(n).padStart(2, '0');
      const formatted = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
      document.getElementById('eventDate').value = formatted;
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
        state.events[idx] = {
          ...state.events[idx],
          title,
          category,
          dept,
          dateTime,
          venue,
          link,
          desc
        };
      }
    } else {
      const newEvent = {
        id: 'evt-' + Date.now(),
        title,
        category,
        dept,
        dateTime,
        venue,
        link,
        desc,
        completed: false,
        createdAt: new Date().toISOString()
      };
      state.events.unshift(newEvent);
    }

    saveEvents();
    closeModal();
    render();
  }

  // ==========================================================================
  // Calendar Export (.ics)
  // ==========================================================================
  function exportIcs(itemList, filename = 'college-events.ics') {
    const pad = n => String(n).padStart(2, '0');
    const formatIcs = d => (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      'Z'
    );

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusTrack//College Events Hub//EN',
      'CALSCALE:GREGORIAN'
    ];

    itemList.forEach(item => {
      const start = new Date(item.dateTime);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours default
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:campustrack-${item.id}@college.edu`);
      lines.push(`DTSTAMP:${formatIcs(new Date())}`);
      lines.push(`DTSTART:${formatIcs(start)}`);
      lines.push(`DTEND:${formatIcs(end)}`);
      lines.push(`SUMMARY:${escapeIcs(item.title)}`);
      if (item.desc) lines.push(`DESCRIPTION:${escapeIcs(item.desc)}`);
      if (item.venue) lines.push(`LOCATION:${escapeIcs(item.venue)}`);
      lines.push('STATUS:CONFIRMED');
      lines.push('END:VEVENT');
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
  }

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

  // ==========================================================================
  // Event Bindings
  // ==========================================================================
  function setupEvents() {
    // 1. Live tick
    setInterval(() => {
      updateLiveClock();
      updateHeroHighlight();

      // Update card countdown labels
      document.querySelectorAll('[data-countdown]').forEach(el => {
        const iso = el.getAttribute('data-countdown');
        if (el.textContent !== 'Completed ✓') {
          const diff = calculateDiff(iso);
          el.textContent = diff.text;
          if (diff.isUrgent) el.classList.add('urgent');
          else el.classList.remove('urgent');
        }
      });
    }, 1000);
    updateLiveClock();

    // 2. Search
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        state.search = e.target.value;
        if (clearSearchBtn) {
          if (e.target.value) clearSearchBtn.classList.remove('hidden');
          else clearSearchBtn.classList.add('hidden');
        }
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

    // 3. Category Filter Pills
    document.querySelectorAll('.filter-pills .pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pills .pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.filter = btn.getAttribute('data-filter');
        render();
      });
    });

    // 4. Stat Box Clickable Filters
    document.querySelectorAll('.stat-box').forEach(box => {
      box.addEventListener('click', () => {
        const cat = box.getAttribute('data-stat-filter');
        const pill = document.querySelector(`.filter-pills .pill[data-filter="${cat}"]`);
        if (pill) {
          document.querySelectorAll('.filter-pills .pill').forEach(b => b.classList.remove('active'));
          pill.classList.add('active');
          state.filter = cat;
          render();
        }
      });
    });

    // 5. Sort Dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', e => {
        state.sortBy = e.target.value;
        render();
      });
    }

    // 6. Modal triggers
    const openAddModalBtn = document.getElementById('openAddModalBtn');
    const emptyAddBtn = document.getElementById('emptyAddBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');

    if (openAddModalBtn) openAddModalBtn.addEventListener('click', () => openModal());
    if (emptyAddBtn) emptyAddBtn.addEventListener('click', () => openModal());
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (form) form.addEventListener('submit', handleFormSubmit);

    // 7. Card clicks delegation
    const grid = document.getElementById('eventsGrid');
    if (grid) {
      grid.addEventListener('click', e => {
        const card = e.target.closest('.event-card');
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
          if (item) exportIcs([item], `${item.title.replace(/\W+/g, '-')}.ics`);
        }
      });
    }

    // 8. Export All to iCal
    const exportIcsBtn = document.getElementById('exportIcsBtn');
    if (exportIcsBtn) {
      exportIcsBtn.addEventListener('click', () => {
        exportIcs(state.events, 'all-college-events.ics');
      });
    }

    // 9. Reset Demo Data
    const resetDemoBtn = document.getElementById('resetDemoBtn');
    if (resetDemoBtn) {
      resetDemoBtn.addEventListener('click', () => {
        if (confirm('Reset to default college events, hackathons, and submissions?')) {
          state.events = getDefaultEvents();
          saveEvents();
          render();
        }
      });
    }
  }

  // Init
  function init() {
    loadEvents();
    setupEvents();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
