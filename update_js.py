import sys

with open('public/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add global functions for UI behavior
ui_funcs = """
// --- New UI Helpers ---
window.setGenderPref = function(val, btn) {
    document.getElementById('preferredGender').value = val;
    document.querySelectorAll('#gender-btns button').forEach(b => {
        b.className = "flex-1 py-4 px-6 rounded-full bg-surface-container-highest text-secondary font-bold whitespace-nowrap hover:bg-surface-variant transition-colors";
    });
    btn.className = "flex-1 py-4 px-6 rounded-full bg-tertiary-container text-on-tertiary-container font-bold whitespace-nowrap shadow-sm";
};

window.setMoodPref = function(val, btn) {
    document.getElementById('dateMood').value = val;
    document.querySelectorAll('#mood-btns button').forEach(b => {
        b.className = "p-4 rounded-xl bg-surface-container-low border-2 border-transparent text-secondary font-semibold text-center hover:bg-surface-container-high transition-all";
    });
    btn.className = "p-4 rounded-xl bg-tertiary-container/10 border-2 border-tertiary-container text-on-tertiary-container font-bold text-center";
};

window.updatePriceDisplay = function(val) {
    const spans = document.querySelectorAll('#price-display span');
    spans.forEach((span, idx) => {
        if (idx < val) {
            span.className = "text-2xl font-black text-primary";
        } else {
            span.className = "text-2xl font-black text-outline-variant";
        }
    });
};

window.openChat = function(convId, name, img) {
    document.getElementById('active-chat-name').innerText = name;
    document.getElementById('active-chat-img').src = img;
    document.getElementById('messages-container').innerHTML = `<p class="text-center text-secondary italic">Chat API not implemented in placeholder, but you matched with ${name}!</p>`;
};
"""

js = js.replace('// Auth UI Logic', ui_funcs + '\n// Auth UI Logic')


# Update loadDiscover
old_loadDiscover = """async function loadDiscover() {
  if (!currentUserId) return;
  try {
    let res = await fetch(`${API_BASE}/discover/${currentUserId}`);
    let candidates = await res.json();
    const discoverCard = document.getElementById('discover-card');

    if (!candidates || candidates.length === 0) {
      // Auto-regenerate and try again once
      await fetch(`${API_BASE}/discover/${currentUserId}/regenerate`, { method: 'POST' });
      res = await fetch(`${API_BASE}/discover/${currentUserId}`);
      candidates = await res.json();
      
      if (!candidates || candidates.length === 0) {
        discoverCard.innerHTML = `<div class="match-card"><div class="match-details"><p style="text-align:center;">No fresh matches in your hive. Try expanding your preferences.</p></div></div>`;
        return;
      }
    }

    // Display the first candidate
    const c = candidates[0];
    const openerText = c.preferences && c.preferences.opener ? c.preferences.opener : "Looking for my match!";
    discoverCard.innerHTML = `
      <div class="match-card" data-userId="${c.userId}">
        <img src="${c.profilePicUrl || 'https://i.pravatar.cc/150'}" class="match-thumb">
        <div class="match-details">
          <h3>${c.name}, ${c.age}</h3>
          <p>${c.occupation || 'Bee'} • Match Candidate</p>
          <p style="margin-top: 8px; font-style: italic; color: var(--text-dark);">"${openerText}"</p>
        </div>
        <div class="match-actions">
          <button class="btn btn-unlike" onclick="swipe(${c.userId}, 'dislike')"><i class="fa fa-times"></i></button>
          <button class="btn btn-buzz" onclick="swipe(${c.userId}, 'like')"><i class="fa-solid fa-brands fa-forumbee"></i> Buzz</button>
        </div>
      </div>
    `;
  } catch (e) {
    console.error(e);
  }
}"""

new_loadDiscover = """async function loadDiscover() {
  if (!currentUserId) return;
  try {
    let res = await fetch(`${API_BASE}/discover/${currentUserId}`);
    let candidates = await res.json();
    const discoverCard = document.getElementById('discover-card');

    if (!candidates || candidates.length === 0) {
      // Auto-regenerate and try again once
      await fetch(`${API_BASE}/discover/${currentUserId}/regenerate`, { method: 'POST' });
      res = await fetch(`${API_BASE}/discover/${currentUserId}`);
      candidates = await res.json();
      
      if (!candidates || candidates.length === 0) {
        discoverCard.innerHTML = `<div class="col-span-full text-center text-secondary italic">No fresh matches in your hive. Try expanding your preferences.</div>`;
        return;
      }
    }

    discoverCard.innerHTML = candidates.map(c => `
      <article class="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
          <div class="relative h-72 overflow-hidden">
              <img alt="${c.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="${c.profilePicUrl || 'https://i.pravatar.cc/150'}">
              <div class="absolute bottom-4 left-4 right-4">
                  <span class="bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center w-fit gap-1">
                      <span class="material-symbols-outlined text-[14px]">location_on</span> ${c.distance ? c.distance + ' miles away' : 'Nearby'}
                  </span>
              </div>
          </div>
          <div class="p-6 flex-1 flex flex-col">
              <div class="mb-4">
                  <h4 class="text-2xl font-headline font-extrabold text-on-surface">${c.name}, ${c.age}</h4>
                  <p class="text-secondary text-sm mt-2 line-clamp-2 italic">${c.preferences && c.preferences.opener ? c.preferences.opener : 'Looking for my match!'}</p>
              </div>
              <div class="flex flex-wrap gap-2 mb-6">
                  ${(c.preferences && c.preferences.hobbies ? c.preferences.hobbies : []).slice(0, 3).map(h => `<span class="px-3 py-1 bg-surface-container-low text-xs font-medium rounded-full capitalize">${h}</span>`).join('')}
              </div>
              <div class="mt-auto flex gap-2">
                  <button class="flex-1 bg-surface-container-high text-secondary font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-surface-variant transition-all" onclick="swipe(${c.userId}, 'dislike')">
                      <span class="material-symbols-outlined">close</span> Pass
                  </button>
                  <button class="flex-1 honey-gradient text-on-primary-fixed font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all" onclick="swipe(${c.userId}, 'like')">
                      <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">hive</span> Buzz
                  </button>
              </div>
          </div>
      </article>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}"""
js = js.replace(old_loadDiscover, new_loadDiscover)


# Update loadChats
old_loadChats = """async function loadChats() {
  if (!currentUserId) return;
  const chatList = document.getElementById('chat-list');
  try {
    const res = await fetch(`${API_BASE}/messaging/user/${currentUserId}/conversations`);
    if (!res.ok) return;
    const conversations = await res.json();

    if (!conversations || conversations.length === 0) {
      chatList.innerHTML = `<div class="match-card" style="justify-content: center; color: var(--muted-brown);">No conversations yet. Buzz some profiles!</div>`;
      return;
    }

    chatList.innerHTML = conversations.map(c => {
      const m = c.match;
      const other = m.user1.userId == currentUserId ? m.user2 : m.user1;
      const preview = c.lastMessagePreview || 'No messages yet';
      return `
        <div class="match-card">
          <img src="${other.profilePicUrl || 'https://i.pravatar.cc/150?u=' + other.userId}" class="match-thumb">
          <div class="match-details">
            <h3>${other.name}, ${other.age}</h3>
            <p style="color: var(--muted-brown); font-style: italic;">${preview}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Failed to load chats', e);
  }
}"""

new_loadChats = """async function loadChats() {
  if (!currentUserId) return;
  const chatList = document.getElementById('chat-list');
  try {
    const res = await fetch(`${API_BASE}/messaging/user/${currentUserId}/conversations`);
    if (!res.ok) return;
    const conversations = await res.json();

    if (!conversations || conversations.length === 0) {
      chatList.innerHTML = `<div class="text-center text-secondary italic mt-8">No conversations yet. Buzz some profiles!</div>`;
      return;
    }

    chatList.innerHTML = conversations.map(c => {
      const m = c.match;
      const other = m.user1.userId == currentUserId ? m.user2 : m.user1;
      const preview = c.lastMessagePreview || 'No messages yet';
      return `
        <div class="hover:bg-surface-container-high rounded-xl p-4 flex gap-4 cursor-pointer mb-3 transition-colors" onclick="openChat(${c.conversationId}, '${other.name}', '${other.profilePicUrl || 'https://i.pravatar.cc/150'}')">
            <div class="w-14 h-14 hexagon-mask bg-outline-variant p-0.5 relative">
                <img class="w-full h-full object-cover hexagon-mask" src="${other.profilePicUrl || 'https://i.pravatar.cc/150'}">
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                    <h4 class="font-bold text-on-surface truncate">${other.name}</h4>
                </div>
                <p class="text-sm text-secondary truncate mt-0.5">${preview}</p>
            </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Failed to load chats', e);
  }
}"""
js = js.replace(old_loadChats, new_loadChats)


# Update loadDates
old_loadDates = """async function loadDates() {
  if (!currentUserId) return;
  const dateList = document.querySelector('#page-calendar .card-list');
  try {
    const res = await fetch(`${API_BASE}/dates/user/${currentUserId}`);
    if (!res.ok) return;
    const dates = await res.json();

    if (!dates || dates.length === 0) {
      dateList.innerHTML = `<div class="match-card" style="justify-content: center; color: var(--muted-brown);">No upcoming dates scheduled.</div>`;
      return;
    }

    dateList.innerHTML = dates.map(d => {
      const m = d.match;
      const other = m.user1.userId == currentUserId ? m.user2 : m.user1;
      const loc = d.location;
      const statusLabel = d.status.replace(/_/g, ' ');
      return `
        <div class="match-card">
          <div class="match-details">
            <h3>${other.name} — ${loc.name}</h3>
            <p>${loc.address || loc.category || 'Somewhere fun'}</p>
            <p style="margin-top: 5px; text-transform: capitalize; color: var(--muted-brown);">${statusLabel}</p>
          </div>
          <div class="match-actions">
            ${d.status !== 'accepted_by_both' ? `
              <button class="btn btn-buzz" onclick="respondToDate(${d.suggestionId}, 'accept')">Accept</button>
              <button class="btn btn-unlike" onclick="respondToDate(${d.suggestionId}, 'reject')"><i class="fa fa-times"></i></button>
            ` : '<span style="color: var(--honey);">✓ Confirmed</span>'}
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Failed to load dates', e);
  }
}"""

new_loadDates = """async function loadDates() {
  if (!currentUserId) return;
  const confirmedList = document.getElementById('calendar-confirmed-list');
  const awaitingList = document.getElementById('calendar-awaiting-list');
  try {
    const res = await fetch(`${API_BASE}/dates/user/${currentUserId}`);
    if (!res.ok) return;
    const dates = await res.json();

    const confirmedDates = dates.filter(d => d.status === 'accepted_by_both');
    const awaitingDates = dates.filter(d => d.status !== 'accepted_by_both');

    function renderDateCard(d, isAwaiting) {
        const m = d.match;
        const other = m.user1.userId == currentUserId ? m.user2 : m.user1;
        const loc = d.location;
        if (isAwaiting) {
            return `
            <div class="bg-surface-container-highest/40 p-1 rounded-2xl">
                <div class="bg-surface-container-lowest p-5 rounded-xl border border-primary/5 shadow-sm">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="material-symbols-outlined text-tertiary">hourglass_top</span>
                        <span class="text-sm font-bold text-on-surface-variant">Pending Proposal</span>
                    </div>
                    <p class="text-sm text-secondary leading-relaxed mb-4">
                        <span class="font-bold text-primary">${other.name}</span> proposed <span class="italic text-primary-dim">${loc.name || loc.category || 'Somewhere fun'}</span>
                    </p>
                    <div class="flex gap-2">
                        <button class="flex-grow py-2 rounded-full bg-primary-container text-on-primary-container font-bold text-xs hover:scale-[1.02] transition-transform" onclick="respondToDate(${d.suggestionId}, 'accept')">Accept</button>
                        <button class="flex-grow py-2 rounded-full bg-surface-container-high text-secondary font-bold text-xs hover:scale-[1.02] transition-transform" onclick="respondToDate(${d.suggestionId}, 'reject')">Decline</button>
                    </div>
                </div>
            </div>`;
        } else {
            return `
            <div class="bg-surface-container-low hover:bg-surface-container-high p-4 rounded-xl transition-all group relative overflow-hidden">
                <div class="flex gap-4">
                    <div class="w-16 h-16 hexagon-mask bg-primary p-0.5 flex-shrink-0">
                        <img class="w-full h-full object-cover hexagon-mask" src="${other.profilePicUrl || 'https://i.pravatar.cc/150'}">
                    </div>
                    <div class="flex-grow">
                        <h4 class="font-bold text-primary">${loc.name || loc.category || 'Somewhere fun'}</h4>
                        <p class="text-xs text-secondary font-medium">with ${other.name}</p>
                        <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-primary uppercase tracking-tighter">
                            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">calendar_today</span> Upcoming</span>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    }
    
    if(confirmedList) confirmedList.innerHTML = confirmedDates.length ? confirmedDates.map(d => renderDateCard(d, false)).join('') : '<p class="text-sm text-secondary italic">No confirmed dates yet.</p>';
    if(awaitingList) awaitingList.innerHTML = awaitingDates.length ? awaitingDates.map(d => renderDateCard(d, true)).join('') : '<p class="text-sm text-secondary italic">No dates pending.</p>';
  } catch (e) {
    console.error('Failed to load dates', e);
  }
}"""
js = js.replace(old_loadDates, new_loadDates)


# Load preferences to update buttons visually
old_loadPref = """    if (preferredGenderSelect && pref.preferredGender) preferredGenderSelect.value = pref.preferredGender;
    if (dateMoodSelect && pref.dateMood) dateMoodSelect.value = pref.dateMood;
    if (maxPriceTierInput && pref.maxPriceTier != null) maxPriceTierInput.value = pref.maxPriceTier;

    if (openerTextarea) openerTextarea.value = pref.opener || '';"""

new_loadPref = """    if (preferredGenderSelect && pref.preferredGender) {
      preferredGenderSelect.value = pref.preferredGender;
      document.querySelectorAll('#gender-btns button').forEach(b => {
          if (b.innerText.toLowerCase() === pref.preferredGender.toLowerCase() || (pref.preferredGender==='any' && b.innerText==='Any')) {
              b.className = "flex-1 py-4 px-6 rounded-full bg-tertiary-container text-on-tertiary-container font-bold whitespace-nowrap shadow-sm";
          } else {
              b.className = "flex-1 py-4 px-6 rounded-full bg-surface-container-highest text-secondary font-bold whitespace-nowrap hover:bg-surface-variant transition-colors";
          }
      });
    }
    if (dateMoodSelect && pref.dateMood) {
      dateMoodSelect.value = pref.dateMood;
      document.querySelectorAll('#mood-btns button').forEach(b => {
          if (b.innerText.toLowerCase() === pref.dateMood.toLowerCase()) {
              b.className = "p-4 rounded-xl bg-tertiary-container/10 border-2 border-tertiary-container text-on-tertiary-container font-bold text-center";
          } else {
              b.className = "p-4 rounded-xl bg-surface-container-low border-2 border-transparent text-secondary font-semibold text-center hover:bg-surface-container-high transition-all";
          }
      });
    }
    if (maxPriceTierInput && pref.maxPriceTier != null) {
      maxPriceTierInput.value = pref.maxPriceTier;
      updatePriceDisplay(pref.maxPriceTier);
    }
    if (document.getElementById('distanceLabel') && pref.maxDistance != null) document.getElementById('distanceLabel').innerText = pref.maxDistance + ' miles';

    if (openerTextarea) openerTextarea.value = pref.opener || '';"""

js = js.replace(old_loadPref, new_loadPref)

with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
