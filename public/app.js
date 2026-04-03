let currentUserId = localStorage.getItem('currentUserId') || null;

const API_BASE = 'http://localhost:3000';

// Initialize session if exists
if (currentUserId) {
  // Execute immediately to prevent split-second flash of landing page
  document.getElementById('page-landing').classList.remove('active');
  document.getElementById('page-landing').classList.add('hidden');
  document.getElementById('page-signup').classList.remove('active');
  document.getElementById('page-signup').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  
  loadCurrentUser().then((isValid) => {
    if (isValid === false) return; // session was invalid and was cleared
    loadPreferences().then(() => {
      document.querySelector('[data-page="discover"]').click();
    }).catch(() => {
      document.querySelector('[data-page="discover"]').click();
    });
  });
}

function logoutUser() {
  currentUserId = null;
  localStorage.removeItem('currentUserId');
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('page-landing').classList.remove('hidden');
  document.getElementById('page-landing').classList.add('active');
}

// Page navigation logic
document.querySelectorAll('.nav-item').forEach((btn) => {
  if (btn.classList.contains('logout')) return; // Skip logout button
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-item:not(.logout)').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const pageId = e.currentTarget.getAttribute('data-page');
    document.querySelectorAll('main .page').forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) targetPage.classList.add('active', 'flex');

    if (pageId === 'discover') loadDiscover();
    if (pageId === 'chats') loadChats();
    if (pageId === 'calendar') loadDates();
  });
});

function showMainApp() {
  document.getElementById('page-landing').classList.remove('active');
  document.getElementById('page-landing').classList.add('hidden');
  document.getElementById('page-signup').classList.remove('active');
  document.getElementById('page-signup').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  loadCurrentUser().then((isValid) => {
    if (isValid === false) return; // session was invalid
    loadPreferences().then(() => {
      document.querySelector('[data-page="discover"]').click();
    }).catch(() => {
      document.querySelector('[data-page="discover"]').click();
    });
  });
}


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

window.openChat = async function(convId, name, img) {
    // Reveal chat pane on mobile directly if hidden
    const rightPane = document.querySelector('#page-chats > div:nth-child(2)');
    if (rightPane) {
      rightPane.classList.remove('hidden');
      rightPane.classList.add('flex');
    }

    // Assign active background to the selected chat in the left list
    document.querySelectorAll('#chat-list > div').forEach(div => {
      div.classList.remove('bg-[#e4ddc0]');
    });
    const activeDiv = document.querySelector(`#chat-list > div[data-convid="${convId}"]`);
    if(activeDiv) activeDiv.classList.add('bg-[#e4ddc0]');

    document.getElementById('active-chat-name').innerText = name;
    document.getElementById('active-chat-img').src = img;
    const container = document.getElementById('messages-container');
    container.innerHTML = `<p class="text-center text-secondary italic">Loading messages...</p>`;

    // Save state globally for sending
    window.currentConversationId = convId;
    window.currentChatName = name;
    window.currentChatImg = img;
    
    try {
        // Add cache buster to force fresh data from backend that includes our newly added senderId column!
        const res = await fetch(`${API_BASE}/messaging/conversation/${convId}/messages?t=${new Date().getTime()}`);
        const messages = await res.json();
        const myImgUrl = document.getElementById('sidebar-img')?.src || '/assets/BeeProfileIcon.png';

        container.innerHTML = `
            <div class="flex justify-center my-4">
                <span class="px-4 py-1 bg-surface-container-high rounded-full text-[10px] font-bold text-secondary uppercase tracking-widest">Matched recently</span>
            </div>
        `;

        if (messages.length === 0) {
            container.innerHTML += `<p class="text-center text-secondary italic">Say hi to ${name}!</p>`;
        } else {
            messages.forEach(msg => {
                const senderId = msg.senderId;
                // Coerce both to numbers to guarantee strict match (e.g. 1 === 1)
                const isMine = Number(senderId) === Number(currentUserId);
                if(isMine) {
                    container.innerHTML += `
                        <div style="display:flex;align-items:flex-end;justify-content:flex-end;width:100%;" class="animate-fade-in">
                            <div class="honey-gradient text-white px-3 py-2 rounded-3xl rounded-br-sm max-w-[70%] shadow-md">
                                <p class="text-sm font-medium leading-relaxed">${msg.messageBody}</p>
                            </div>
                        </div>
                    `;
                } else {
                    container.innerHTML += `
                        <div style="display:flex;align-items:flex-end;justify-content:flex-start;width:100%;" class="animate-fade-in">
                            <div class="bg-white text-on-surface px-3 py-2 rounded-3xl rounded-bl-sm max-w-[70%] shadow-sm border border-outline-variant/30">
                                <p class="text-sm font-medium leading-relaxed">${msg.messageBody}</p>
                            </div>
                        </div>
                    `;
                }
            });
        }
        setTimeout(() => {
             container.parentElement.scrollTop = container.parentElement.scrollHeight;
        }, 50);
    } catch (e) {
        console.error(e);
        container.innerHTML = `<p class="text-center text-error italic">Failed to load messages.</p>`;
    }
};

window.sendMessageContent = async function() {
    if (!window.currentConversationId) return;
    const inputEl = document.getElementById('chat-input-box');
    const msg = inputEl.value.trim();
    if (!msg) return;
    
    try {
        const res = await fetch(`${API_BASE}/messaging/conversation/${window.currentConversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderId: Number(currentUserId), messageBody: msg })
        });
        if (res.ok) {
            inputEl.value = '';
            // Refresh current chat view
            await openChat(window.currentConversationId, window.currentChatName, window.currentChatImg);
            loadChats(); // refresh preview in side panel
        }
    } catch (e) {
        console.error(e);
    }
};

// Auth UI Logic

function openAuthOverlay(mode) {
  if (mode === 'signup') {
    document.getElementById('page-landing').classList.remove('active');
    document.getElementById('page-landing').classList.add('hidden');
    document.getElementById('page-signup').classList.remove('hidden');
    document.getElementById('page-signup').classList.add('active', 'flex');
  } else {
    document.getElementById('page-signup').classList.remove('active', 'flex');
    document.getElementById('page-signup').classList.add('hidden');
    document.getElementById('page-landing').classList.remove('hidden');
    document.getElementById('page-landing').classList.add('active', 'flex');
  }
}

function closeAuthOverlay() {
  openAuthOverlay('login');
}

async function submitAuth(mode) {
  if (mode === 'signup') {
    await registerUser();
  } else {
    await loginUser();
  }
}

async function loadCurrentUser() {
  if (!currentUserId) return false;
  try {
    const res = await fetch(`${API_BASE}/users/${currentUserId}`);
    if (!res.ok) {
      logoutUser();
      return false;
    }
    const user = await res.json();

    const sidebarName = document.getElementById('sidebar-name');
    const sidebarOcc = document.getElementById('sidebar-occ');
    const sidebarImg = document.getElementById('sidebar-img');

    if (sidebarName) {
      sidebarName.innerText = `${user.name || 'New Bee'}, ${user.age || ''}`.trim();
    }
    if (sidebarOcc) {
      sidebarOcc.innerText = user.occupation || 'Just joined';
    }
    if (sidebarImg) {
      sidebarImg.src = user.profilePicUrl || '/assets/BeeProfileIcon.png';
    }

    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const occInput = document.getElementById('occupation');
    const datingPrefSelect = document.getElementById('datingPreference');

    if (emailInput) emailInput.value = user.email || '';
    if (nameInput) nameInput.value = user.name || '';
    if (ageInput) ageInput.value = user.age != null ? user.age : '';
    if (occInput) occInput.value = user.occupation || '';
    if (datingPrefSelect && user.datingPreference) {
      datingPrefSelect.value = user.datingPreference;
    }

    const addressInput = document.getElementById('address');
    const phoneInput = document.getElementById('phoneNumber');
    const privacyInput = document.getElementById('privacySetting');

    if (addressInput) addressInput.value = user.address || '';
    if (phoneInput) phoneInput.value = user.phoneNumber || '';
    if (privacyInput && user.privacySetting) privacyInput.value = user.privacySetting;

    return true;
  } catch (err) {
    console.error('Failed to load current user', err);
    return false;
  }
}

async function loginUser() {
  const email = document.getElementById('auth-email-login').value;
  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || "Login failed. Are you sure you signed up?");
      return;
    }

    const user = await res.json();
    currentUserId = user.userId;
    localStorage.setItem('currentUserId', currentUserId);

    await loadCurrentUser();
    await loadPreferences();

    showMainApp();
  } catch (err) {
    console.error(err);
    alert("Server error during login.");
  }
}

async function registerUser() {
  const email = document.getElementById('auth-email-signup').value;
  const name = document.getElementById('auth-name').value;
  const age = Number(document.getElementById('auth-age').value) || 18;
  const gender = document.getElementById('auth-gender').value;
  const occupation = document.getElementById('auth-occupation')?.value || '';
  const datingPreference = document.getElementById('auth-dating-preference')?.value || 'unsure';
  
  // New fields from onboarding
  const address = document.getElementById('auth-address')?.value || '';
  const phoneNumber = document.getElementById('auth-phone')?.value || '';
  const privacySetting = document.querySelector('input[name="privacy"]:checked')?.value || 'public';

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, age, gender, datingPreference, occupation, address, phoneNumber, privacySetting })
    });

    if (!res.ok) {
      alert("Registration failed. Are you banned?");
      return;
    }

    const user = await res.json();
    currentUserId = user.userId;
    localStorage.setItem('currentUserId', currentUserId);

    document.getElementById('email').value = user.email || email;
    document.getElementById('name').value = user.name || name;
    document.getElementById('age').value = user.age || age;
    if(document.getElementById('sidebar-name')) document.getElementById('sidebar-name').innerText = `${user.name || name}, ${user.age || age}`;

    // Automatically spool up a preferences record 
    await savePreferences(true);
    await loadCurrentUser();
    await loadPreferences();

    showMainApp();
    // Move slightly forward to preferences initially to allow users to build their parameters natively
    setTimeout(() => {
      document.querySelector('[data-page="preferences"]').click();
    }, 100);
  } catch (err) {
    console.error(err);
    alert("Server error during registration.");
  }
}

async function saveProfile() {
  const email = document.getElementById('email').value;
  const name = document.getElementById('name').value;
  const age = Number(document.getElementById('age').value);
  const occupation = document.getElementById('occupation').value;
  const datingPreference = document.getElementById('datingPreference').value;
  const address = document.getElementById('address')?.value || '';
  const phoneNumber = document.getElementById('phoneNumber')?.value || '';
  const privacySetting = document.getElementById('privacySetting')?.value || 'public';

  if (!currentUserId) {
    if (!email || !name || !age) return alert("Email, name, and age required");
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, age, gender: document.getElementById('auth-gender')?.value || 'other', datingPreference, occupation, address, phoneNumber, privacySetting })
      });
      if (!res.ok) return alert("Failed to register.");
      const user = await res.json();
      currentUserId = user.userId;
      localStorage.setItem('currentUserId', currentUserId);
      await savePreferences(true);
      document.getElementById('sidebar-name').innerText = `${name}, ${age}`;
      document.getElementById('sidebar-occ').innerText = occupation;
      alert("Profile created successfully!");
    } catch (e) { console.error(e); }
  } else {
    try {
      await fetch(`${API_BASE}/users/${currentUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, age, occupation, datingPreference, address, phoneNumber, privacySetting })
      });
      await savePreferences(true); // synchronize opener
      await loadCurrentUser();
      document.getElementById('sidebar-name').innerText = `${name}, ${age}`;
      document.getElementById('sidebar-occ').innerText = occupation;
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    }
  }
}

async function uploadProfilePicOnboarding() {
  if (!currentUserId) return alert("Please finish creating your profile by clicking 'Next Step' first!");
  const fileInput = document.getElementById('auth-profile-pic');
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/users/${currentUserId}/upload-picture`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.profilePicUrl) {
      if (document.getElementById('sidebar-img')) document.getElementById('sidebar-img').src = data.profilePicUrl;
      alert("Profile picture uploaded!");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to upload picture.");
  }
}

async function uploadProfilePic() {
  if (!currentUserId) return alert("Please save your profile first to get an ID!");
  const fileInput = document.getElementById('profilePicInput');
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/users/${currentUserId}/upload-picture`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.profilePicUrl) {
      document.getElementById('sidebar-img').src = data.profilePicUrl;
      alert("Profile picture uploaded!");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to upload picture.");
  }
}

async function connectGoogleCalendarOnboarding() {
  if (!currentUserId) {
    return alert("Please finish creating your profile by clicking 'Next Step' before connecting your calendar.");
  }
  await connectGoogleCalendar();
}

async function connectGoogleCalendar() {
  if (!currentUserId) return alert("Please save your profile first before connecting Calendar!");

  // Synchronous popup block-bypass
  const popup = window.open('', 'google_auth', 'width=500,height=600');

  try {
    const res = await fetch(`${API_BASE}/users/auth/google/url?userId=${currentUserId}`);
    const data = await res.json();
    if (data.url && popup) {
      popup.location.href = data.url;
      // Note: we can't reliably detect when the user finishes OAuth from a cross-origin popup,
      // but the callback redirects to a script that runs `window.close()`.
    } else if (popup) {
      popup.close();
      alert("Failed to get auth URL");
    }
  } catch (err) {
    if (popup) popup.close();
    console.error(err);
    alert("Error fetching Google Auth URL.");
  }
}

async function savePreferences(silent = false) {
  if (!currentUserId) return;

  const selectedHobbies = Array.from(document.querySelectorAll('#hobbies-container input[type="checkbox"]:checked')).map(cb => cb.value);
  const preferences = {
    minAge: Number(document.getElementById('minAge').value) || 18,
    maxAge: Number(document.getElementById('maxAge').value) || 99,
    maxDistance: Number(document.getElementById('maxDistance').value) || 50,
    preferredGender: document.getElementById('preferredGender').value || 'any',
    dateMood: document.getElementById('dateMood').value || 'unsure',
    maxPriceTier: Number(document.getElementById('maxPriceTier').value) || 3,
    hobbies: selectedHobbies,
    opener: document.getElementById('opener').value
  };

  try {
    await fetch(`${API_BASE}/preferences/${currentUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });
    await loadPreferences();
    if (!silent) alert("Preferences saved!");
  } catch (err) {
    console.error(err);
  }
}

async function loadPreferences() {
  if (!currentUserId) return;
  try {
    const res = await fetch(`${API_BASE}/preferences/${currentUserId}`);
    if (!res.ok) return;
    const pref = await res.json();

    const minAgeInput = document.getElementById('minAge');
    const maxAgeInput = document.getElementById('maxAge');
    const maxDistanceInput = document.getElementById('maxDistance');
    const preferredGenderSelect = document.getElementById('preferredGender');
    const dateMoodSelect = document.getElementById('dateMood');
    const maxPriceTierInput = document.getElementById('maxPriceTier');
    const openerTextarea = document.getElementById('opener');
    const sidebarBio = document.getElementById('sidebar-bio');

    if (minAgeInput && pref.minAge != null) minAgeInput.value = pref.minAge;
    if (maxAgeInput && pref.maxAge != null) maxAgeInput.value = pref.maxAge;
    if (maxDistanceInput && pref.maxDistance != null) maxDistanceInput.value = pref.maxDistance;
    if (preferredGenderSelect && pref.preferredGender) {
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

    if (openerTextarea) openerTextarea.value = pref.opener || '';
    if (sidebarBio) sidebarBio.innerText = pref.opener || 'Passionate about finding my match!';

    const hobbiesContainer = document.getElementById('hobbies-container');
    if (hobbiesContainer && Array.isArray(pref.hobbies)) {
      const checkboxes = hobbiesContainer.querySelectorAll('input[type=\"checkbox\"]');
      checkboxes.forEach((cb) => {
        cb.checked = pref.hobbies.includes(cb.value);
      });
    }
  } catch (err) {
    console.error('Failed to load preferences', err);
  }
}

async function loadDiscover() {
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
              <img alt="${c.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="${c.profilePicUrl || '/assets/BeeProfileIcon.png'}">
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
}

async function swipe(targetId, type) {
  if (!currentUserId) return;
  try {
    await fetch(`${API_BASE}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: Number(currentUserId), receiverId: targetId, actionType: type })
    });
    alert(`You swiped ${type}!`);
    loadDiscover(); // load next
  } catch (e) {
    console.error(e);
  }
}



async function loadChats() {
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
      const isActive = window.currentConversationId === c.conversationId ? 'bg-[#e4ddc0]' : 'hover:bg-surface-container-high';
      return `
        <div data-convid="${c.conversationId}" class="${isActive} rounded-xl p-4 flex gap-4 cursor-pointer mb-3 transition-colors" onclick="openChat(${c.conversationId}, '${other.name}', '${other.profilePicUrl || '/assets/BeeProfileIcon.png'}')">
            <div class="w-14 h-14 hexagon-mask bg-outline-variant p-0.5 relative">
                <img class="w-full h-full object-cover hexagon-mask" src="${other.profilePicUrl || '/assets/BeeProfileIcon.png'}">
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
}

async function loadDates() {
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
                        <img class="w-full h-full object-cover hexagon-mask" src="${other.profilePicUrl || '/assets/BeeProfileIcon.png'}">
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
}

async function respondToDate(suggestionId, action) {
  if (!currentUserId) return;
  try {
    await fetch(`${API_BASE}/dates/${suggestionId}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: Number(currentUserId) })
    });
    alert(`Date ${action}ed!`);
    loadDates();
  } catch (e) {
    console.error(e);
  }
}

// Regeneration Timer Logic
function updateRegenerationTimer() {
    const now = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(0, 0, 0, 0);
    
    // If it's already Sunday exactly midnight, or past midnight on Sunday
    if (now.getDay() === 0 && now.getTime() > nextSunday.getTime() - 7*24*60*60*1000) {
        if (now > nextSunday) {
            nextSunday.setDate(nextSunday.getDate() + 7);
        }
    }
    
    const diffMs = nextSunday - now;
    if (diffMs < 0) return;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    const daysEl = document.getElementById('regen-days');
    const hrsEl = document.getElementById('regen-hrs');
    
    if (daysEl) daysEl.innerText = diffDays.toString().padStart(2, '0');
    if (hrsEl) hrsEl.innerText = diffHrs.toString().padStart(2, '0');
}
setInterval(updateRegenerationTimer, 1000 * 60 * 60);
document.addEventListener('DOMContentLoaded', updateRegenerationTimer);
