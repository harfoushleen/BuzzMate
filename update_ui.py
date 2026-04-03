import os

with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

styles_addition = """    .hexagon-mask { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
    .liquid-nectar-gradient { background: radial-gradient(circle at top left, #fdc003 0%, #755700 100%); }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4ddc0; border-radius: 10px; }
    .honeycomb-pattern { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='42' viewBox='0 0 24 42'%3E%3Cpath fill='%23755700' fill-opacity='0.03' d='M12 0l12 6.928v13.856L12 27.712 0 20.784V6.928L12 0zm0 41.568l12-6.928V20.784L12 27.712l-12-6.928v13.856l12 6.928z'/%3E%3C/svg%3E"); }
  </style>"""
if '.hexagon-mask' not in html:
    html = html.replace('  </style>', styles_addition)

logo_addition = """        <div>
           <div class="px-6 pt-6 pb-2 text-center flex items-center justify-center gap-2">
             <span class="material-symbols-outlined text-3xl text-[#755700] font-black" style="font-variation-settings: 'FILL' 1;">hive</span>
             <h2 class="text-2xl font-black text-[#755700] font-['Plus_Jakarta_Sans']">BuzzMate</h2>
           </div>
           <!-- Profile Top Box -->"""
if 'text-3xl text-[#755700]' not in html:
    html = html.replace('        <div>\n           <!-- Profile Top Box -->', logo_addition)

html = html.replace('<div class="mx-auto max-w-4xl p-8" id="pages-container">', '<div class="w-full h-full" id="pages-container">')

new_discover = """         <!-- DISCOVER -->
         <section id="page-discover" class="page w-full min-h-screen p-8 lg:p-12">
            <!-- Header Section -->
            <header class="mb-12">
                <div class="flex justify-between items-end mb-8">
                    <div>
                        <h2 class="text-4xl lg:text-5xl font-extrabold font-headline tracking-tight text-on-background mb-2">The Hive</h2>
                        <p class="text-secondary font-medium italic">Discover suggested matches</p>
                    </div>
                </div>
                <!-- Countdown Banner -->
                <div class="relative overflow-hidden bg-primary-container rounded-xl p-6 flex items-center justify-between shadow-sm border-none">
                    <div class="honeycomb-pattern absolute inset-0 opacity-10"></div>
                    <div class="relative z-10 flex items-center gap-4">
                        <div class="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center">
                            <span class="material-symbols-outlined" data-icon="hourglass_empty">hourglass_empty</span>
                        </div>
                        <div>
                            <p class="text-on-primary-container font-headline font-bold text-lg">5 Days until Hive Regeneration</p>
                            <p class="text-on-primary-container/70 text-sm"><br></p>
                        </div>
                    </div>
                    <div class="relative z-10 hidden md:flex gap-2">
                        <div class="bg-surface-container-lowest/40 backdrop-blur-md rounded-lg px-4 py-2 text-center min-w-[60px]">
                            <span class="block text-xl font-bold">05</span>
                            <span class="text-[10px] uppercase tracking-wider">Days</span>
                        </div>
                        <div class="bg-surface-container-lowest/40 backdrop-blur-md rounded-lg px-4 py-2 text-center min-w-[60px]">
                            <span class="block text-xl font-bold">14</span>
                            <span class="text-[10px] uppercase tracking-wider">Hrs</span>
                        </div>
                    </div>
                </div>
            </header>
            <div class="flex flex-col">
                <section class="flex-1">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="discover-card">
                        <!-- Card dynamic population -->
                    </div>
                </section>
            </div>
         </section>

         <!-- CHATS (Messages) -->
         <section id="page-chats" class="page flex-1 flex flex-col md:flex-row h-full">
            <!-- Left Pane: Conversation List -->
            <div class="w-full md:w-96 flex flex-col bg-surface-container-low overflow-hidden border-r border-outline-variant h-full">
                <!-- Chat List -->
                <div class="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 pt-4" id="chat-list">
                    <!-- Dynamic List -->
                </div>
            </div>
            <!-- Right Pane: Active Chat Window -->
            <div class="hidden md:flex flex-1 flex-col bg-surface overflow-hidden h-full">
                <!-- Chat Header -->
                <div class="px-8 py-4 bg-surface-bright flex items-center justify-between shadow-sm z-10 border-b border-outline-variant">
                    <div class="flex items-center gap-4" id="chat-header-info">
                        <div class="w-12 h-12 hexagon-mask bg-primary p-0.5">
                            <img src="https://i.pravatar.cc/150" class="w-full h-full object-cover hexagon-mask" id="active-chat-img">
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-on-surface leading-tight" id="active-chat-name">Select a Chat</h3>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-primary">
                            <span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
                        </button>
                    </div>
                </div>
                <!-- Chat Messages -->
                <div class="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-[0.98]">
                    <div class="flex justify-center my-4">
                        <span class="px-4 py-1 bg-surface-container-high rounded-full text-[10px] font-bold text-secondary uppercase tracking-widest">Matched today</span>
                    </div>
                    <div id="messages-container" class="space-y-4">
                        <p class="text-center text-secondary italic">Select a conversation to start messaging!</p>
                    </div>
                </div>
                <!-- Chat Input -->
                <div class="p-6 bg-surface-bright border-t border-outline-variant">
                    <div class="max-w-4xl mx-auto flex items-center gap-4 bg-surface-container-lowest p-2 rounded-full shadow-lg shadow-on-surface/5">
                        <input class="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-4 shadow-none" placeholder="Type a sweet message..." type="text">
                        <div class="flex items-center gap-2">
                            <button class="w-12 h-12 liquid-nectar-gradient text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform">
                                <span class="material-symbols-outlined" data-icon="send" style="font-variation-settings: 'FILL' 1;">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
         </section>

         <!-- CALENDAR -->
         <section id="page-calendar" class="page w-full p-8">
            <div class="max-w-7xl mx-auto grid grid-cols-12 gap-8">
                <!-- Calendar Section -->
                <div class="col-span-12 lg:col-span-8 space-y-6">
                    <!-- Calendar Header -->
                    <div class="flex items-center justify-between bg-surface-container-low p-6 rounded-xl">
                        <div class="flex items-center gap-6">
                            <h2 class="text-3xl font-black text-primary tracking-tight">October 2023</h2>
                            <div class="flex items-center gap-2">
                                <button class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-highest hover:bg-primary-container transition-colors">
                                    <span class="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-highest hover:bg-primary-container transition-colors">
                                    <span class="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- Monthly Grid (Placeholder Visual Grid) -->
                    <div class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
                        <div class="grid grid-cols-7 bg-surface-container-low">
                            <div class="py-4 text-center text-xs font-bold uppercase tracking-widest text-secondary">Mon</div>
                            <div class="py-4 text-center text-xs font-bold uppercase tracking-widest text-secondary">Tue</div>
                            <div class="py-4 text-center text-xs font-bold uppercase tracking-widest text-secondary">Wed</div>
                            <div class="py-4 text-center text-xs font-bold uppercase tracking-widest text-secondary">Thu</div>
                            <div class="py-4 text-center text-xs font-bold uppercase tracking-widest text-secondary">Fri</div>
                            <div class="py-4 text-center text-xs font-bold uppercase tracking-widest text-secondary">Sat</div>
                            <div class="py-4 text-center text-xs font-bold uppercase tracking-widest text-secondary">Sun</div>
                        </div>
                        <div class="grid grid-cols-7 auto-rows-[120px]">
                            <div class="border-r border-b border-surface-container p-2 opacity-30">25</div>
                            <div class="border-r border-b border-surface-container p-2 opacity-30">26</div>
                            <div class="border-r border-b border-surface-container p-2 opacity-30">27</div>
                            <div class="border-r border-b border-surface-container p-2 opacity-30">28</div>
                            <div class="border-r border-b border-surface-container p-2 opacity-30">29</div>
                            <div class="border-r border-b border-surface-container p-2 opacity-30">30</div>
                            <div class="border-b border-surface-container p-2">1</div>
                            <div class="border-r border-b border-surface-container p-2">2</div>
                            <div class="border-r border-b border-surface-container p-2">3</div>
                            <div class="border-r border-b border-surface-container p-2 bg-primary-container/10">
                                <div class="flex justify-between items-start">
                                    <span>4</span>
                                </div>
                                <div class="mt-2 bg-primary-container text-on-primary-container text-[10px] font-bold p-1 rounded-md truncate">Date w/ Sarah</div>
                            </div>
                            <div class="border-r border-b border-surface-container p-2">5</div>
                            <div class="border-r border-b border-surface-container p-2">6</div>
                            <div class="border-r border-b border-surface-container p-2">7</div>
                            <div class="border-b border-surface-container p-2">8</div>
                            <div class="border-r border-b border-surface-container p-2">9</div>
                            <div class="border-r border-b border-surface-container p-2">10</div>
                            <div class="border-r border-b border-surface-container p-2">11</div>
                            <div class="border-r border-b border-surface-container p-2 bg-tertiary-container/10">
                                <span>12</span>
                                <div class="mt-2 bg-tertiary-container/30 text-on-tertiary-container text-[10px] font-bold p-1 rounded-md truncate border border-tertiary/20">Proposed: Coffee</div>
                            </div>
                            <div class="border-r border-b border-surface-container p-2">13</div>
                            <div class="border-r border-b border-surface-container p-2">14</div>
                            <div class="border-b border-surface-container p-2">15</div>
                            
                            <div class="border-r border-b border-surface-container p-2">16</div>
                            <div class="border-r border-b border-surface-container p-2 font-black text-primary bg-surface-container-low">17<div class="mt-2 h-1 w-full bg-primary rounded-full"></div></div>
                            <div class="border-r border-b border-surface-container p-2">18</div>
                            <div class="border-r border-b border-surface-container p-2">19</div>
                            <div class="border-r border-b border-surface-container p-2 bg-primary-container/10">
                                <span>20</span>
                                <div class="mt-2 bg-primary-container text-on-primary-container text-[10px] font-bold p-1 rounded-md truncate">Jazz Night w/ Leo</div>
                            </div>
                            <div class="border-r border-b border-surface-container p-2">21</div>
                            <div class="border-b border-surface-container p-2">22</div>
                            
                            <div class="border-r border-surface-container p-2">23</div>
                            <div class="border-r border-surface-container p-2">24</div>
                            <div class="border-r border-surface-container p-2">25</div>
                            <div class="border-r border-surface-container p-2">26</div>
                            <div class="border-r border-surface-container p-2">27</div>
                            <div class="border-r border-surface-container p-2">28</div>
                            <div class="p-2">29</div>
                        </div>
                    </div>
                </div>
                <!-- Side Panels -->
                <div class="col-span-12 lg:col-span-4 space-y-8">
                    <!-- Confirmed Dates -->
                    <section>
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-on-surface">Confirmed Dates</h3>
                        </div>
                        <div class="space-y-4" id="calendar-confirmed-list">
                            <p class="text-secondary italic">Loading...</p>
                        </div>
                    </section>
                    <!-- Proposed Dates -->
                    <section>
                        <h3 class="text-xl font-bold text-on-surface mb-4">Awaiting confirmation</h3>
                        <div class="space-y-4" id="calendar-awaiting-list">
                            <p class="text-secondary italic">Loading...</p>
                        </div>
                    </section>
                </div>
            </div>
         </section>

         <!-- PREFERENCES -->
         <section id="page-preferences" class="page w-full p-8 max-w-3xl mx-auto">
            <div class="mb-10">
                <h2 class="font-headline font-extrabold text-4xl text-on-surface tracking-tight mb-2">Preferences</h2>
                <p class="text-secondary font-medium">Fine-tune your hive to find the perfect match.</p>
            </div>
            <form id="preferences-form" class="space-y-12">
                <!-- Age Range Section -->
                <div class="space-y-6">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">calendar_month</span>
                        <h3 class="font-headline font-bold text-xl">Age Range</h3>
                    </div>
                    <div class="bg-surface-container-low p-6 rounded-xl space-y-8">
                        <div class="flex justify-between items-end">
                            <div class="flex flex-col gap-2 w-[45%]">
                                <label class="font-label text-xs font-bold text-secondary uppercase tracking-widest">Min Age</label>
                                <input class="bg-surface-container-lowest border-none rounded-md p-4 font-bold text-primary focus:ring-2 focus:ring-primary-container/20 transition-all font-body outline-none" type="number" id="minAge" value="21">
                            </div>
                            <div class="flex flex-col gap-2 w-[45%]">
                                <label class="font-label text-xs font-bold text-secondary uppercase tracking-widest">Max Age</label>
                                <input class="bg-surface-container-lowest border-none rounded-md p-4 font-bold text-primary focus:ring-2 focus:ring-primary-container/20 transition-all font-body outline-none" type="number" id="maxAge" value="35">
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Distance Section -->
                <div class="space-y-6">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">distance</span>
                        <h3 class="font-headline font-bold text-xl">Maximum Distance</h3>
                    </div>
                    <div class="bg-surface-container-low p-6 rounded-xl">
                        <div class="flex justify-between mb-4">
                            <span class="font-bold text-primary">Radius</span>
                            <span class="font-bold text-on-surface" id="distanceLabel">25 miles</span>
                        </div>
                        <input class="w-full h-2 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer" max="100" min="1" type="range" id="maxDistance" value="25" oninput="document.getElementById('distanceLabel').innerText = this.value + ' miles'">
                    </div>
                </div>
                <!-- Preferred Gender Section -->
                <div class="space-y-6">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">wc</span>
                        <h3 class="font-headline font-bold text-xl">Preferred Gender</h3>
                    </div>
                    <input type="hidden" id="preferredGender" value="any">
                    <div class="flex gap-3 overflow-x-auto pb-2" id="gender-btns">
                        <button class="flex-1 py-4 px-6 rounded-full bg-surface-container-highest text-secondary font-bold whitespace-nowrap hover:bg-surface-variant transition-colors" type="button" onclick="setGenderPref('male', this)">Male</button>
                        <button class="flex-1 py-4 px-6 rounded-full bg-surface-container-highest text-secondary font-bold whitespace-nowrap hover:bg-surface-variant transition-colors" type="button" onclick="setGenderPref('female', this)">Female</button>
                        <button class="flex-1 py-4 px-6 rounded-full bg-tertiary-container text-on-tertiary-container font-bold whitespace-nowrap shadow-sm" type="button" onclick="setGenderPref('any', this)">Any</button>
                    </div>
                </div>
                <!-- Date Mood Section -->
                <div class="space-y-6">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">mood</span>
                        <h3 class="font-headline font-bold text-xl">Date Mood</h3>
                    </div>
                    <input type="hidden" id="dateMood" value="unsure">
                    <div class="grid grid-cols-2 gap-3" id="mood-btns">
                        <button class="p-4 rounded-xl bg-surface-container-low border-2 border-transparent text-secondary font-semibold text-center hover:bg-surface-container-high transition-all" type="button" onclick="setMoodPref('casual', this)">Casual</button>
                        <button class="p-4 rounded-xl bg-surface-container-low border-2 border-transparent text-secondary font-semibold text-center hover:bg-surface-container-high transition-all" type="button" onclick="setMoodPref('romantic', this)">Romantic</button>
                        <button class="p-4 rounded-xl bg-surface-container-low border-2 border-transparent text-secondary font-semibold text-center hover:bg-surface-container-high transition-all" type="button" onclick="setMoodPref('adventurous', this)">Adventurous</button>
                        <button class="p-4 rounded-xl bg-tertiary-container text-on-tertiary-container font-bold text-center" type="button" onclick="setMoodPref('unsure', this)">Unsure</button>
                    </div>
                </div>
                <!-- Bio Section -->
                <div class="space-y-6">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">edit_note</span>
                        <h3 class="font-headline font-bold text-xl">About Your Hive</h3>
                    </div>
                    <textarea id="opener" class="w-full bg-surface-container-lowest border-none rounded-xl p-6 font-body text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-all shadow-sm resize-none outline-none" placeholder="Tell the bees about yourself..." rows="4"></textarea>
                </div>
                <!-- Price Tier Section -->
                <div class="space-y-6">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">payments</span>
                        <h3 class="font-headline font-bold text-xl">Max Price Tier</h3>
                    </div>
                    <div class="bg-surface-container-low p-6 rounded-xl">
                        <div class="flex justify-between items-center px-4" id="price-display">
                            <span class="text-2xl font-black text-primary">$</span>
                            <span class="text-2xl font-black text-primary">$$</span>
                            <span class="text-2xl font-black text-primary">$$$</span>
                            <span class="text-2xl font-black text-outline-variant">$$$$</span>
                            <span class="text-2xl font-black text-outline-variant">$$$$$</span>
                        </div>
                        <input class="w-full h-2 mt-6 bg-surface-container-highest rounded-full appearance-none accent-primary cursor-pointer" max="5" min="1" type="range" id="maxPriceTier" value="3" oninput="updatePriceDisplay(this.value)">
                    </div>
                </div>
                <!-- Hobbies Section -->
                <div class="space-y-6">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">interests</span>
                        <h3 class="font-headline font-bold text-xl">Hobbies & Interests</h3>
                    </div>
                    <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" id="hobbies-container">
                        <label class="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-container-low hover:bg-primary-container/20 transition-all cursor-pointer has-[:checked]:bg-tertiary-container has-[:checked]:text-on-tertiary-container text-secondary">
                            <input type="checkbox" value="movies" class="hidden">
                            <span class="material-symbols-outlined text-primary scale-125 group-has-[:checked]:text-on-tertiary-container">movie</span>
                            <span class="text-xs font-bold uppercase tracking-wider group-has-[:checked]:text-on-tertiary-container text-center">Movies</span>
                        </label>
                        <label class="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-container-low hover:bg-primary-container/20 transition-all cursor-pointer has-[:checked]:bg-tertiary-container has-[:checked]:text-on-tertiary-container text-secondary">
                            <input type="checkbox" value="sports" class="hidden">
                            <span class="material-symbols-outlined text-primary scale-125 group-has-[:checked]:text-on-tertiary-container">sports_soccer</span>
                            <span class="text-xs font-bold uppercase tracking-wider group-has-[:checked]:text-on-tertiary-container text-center">Sports</span>
                        </label>
                        <label class="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-container-low hover:bg-primary-container/20 transition-all cursor-pointer has-[:checked]:bg-tertiary-container has-[:checked]:text-on-tertiary-container text-secondary">
                            <input type="checkbox" value="travel" class="hidden">
                            <span class="material-symbols-outlined text-primary scale-125 group-has-[:checked]:text-on-tertiary-container">flight</span>
                            <span class="text-xs font-bold uppercase tracking-wider group-has-[:checked]:text-on-tertiary-container text-center">Travel</span>
                        </label>
                        <label class="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-container-low hover:bg-primary-container/20 transition-all cursor-pointer has-[:checked]:bg-tertiary-container has-[:checked]:text-on-tertiary-container text-secondary">
                            <input type="checkbox" value="music" class="hidden">
                            <span class="material-symbols-outlined text-primary scale-125 group-has-[:checked]:text-on-tertiary-container">music_note</span>
                            <span class="text-xs font-bold uppercase tracking-wider group-has-[:checked]:text-on-tertiary-container text-center">Music</span>
                        </label>
                        <label class="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-container-low hover:bg-primary-container/20 transition-all cursor-pointer has-[:checked]:bg-tertiary-container has-[:checked]:text-on-tertiary-container text-secondary">
                            <input type="checkbox" value="art" class="hidden">
                            <span class="material-symbols-outlined text-primary scale-125 group-has-[:checked]:text-on-tertiary-container">palette</span>
                            <span class="text-xs font-bold uppercase tracking-wider group-has-[:checked]:text-on-tertiary-container text-center">Art</span>
                        </label>
                        <label class="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-container-low hover:bg-primary-container/20 transition-all cursor-pointer has-[:checked]:bg-tertiary-container has-[:checked]:text-on-tertiary-container text-secondary">
                            <input type="checkbox" value="gaming" class="hidden">
                            <span class="material-symbols-outlined text-primary scale-125 group-has-[:checked]:text-on-tertiary-container">sports_esports</span>
                            <span class="text-xs font-bold uppercase tracking-wider group-has-[:checked]:text-on-tertiary-container text-center">Gaming</span>
                        </label>
                        <label class="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-container-low hover:bg-primary-container/20 transition-all cursor-pointer has-[:checked]:bg-tertiary-container has-[:checked]:text-on-tertiary-container text-secondary">
                            <input type="checkbox" value="food" class="hidden">
                            <span class="material-symbols-outlined text-primary scale-125 group-has-[:checked]:text-on-tertiary-container">restaurant</span>
                            <span class="text-xs font-bold uppercase tracking-wider group-has-[:checked]:text-on-tertiary-container text-center">Food</span>
                        </label>
                        <label class="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-container-low hover:bg-primary-container/20 transition-all cursor-pointer has-[:checked]:bg-tertiary-container has-[:checked]:text-on-tertiary-container text-secondary">
                            <input type="checkbox" value="reading" class="hidden">
                            <span class="material-symbols-outlined text-primary scale-125 group-has-[:checked]:text-on-tertiary-container">menu_book</span>
                            <span class="text-xs font-bold uppercase tracking-wider group-has-[:checked]:text-on-tertiary-container text-center">Reading</span>
                        </label>
                        <label class="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-surface-container-low hover:bg-primary-container/20 transition-all cursor-pointer has-[:checked]:bg-tertiary-container has-[:checked]:text-on-tertiary-container text-secondary">
                            <input type="checkbox" value="photography" class="hidden">
                            <span class="material-symbols-outlined text-primary scale-125 group-has-[:checked]:text-on-tertiary-container">photo_camera</span>
                            <span class="text-xs font-bold uppercase tracking-wider group-has-[:checked]:text-on-tertiary-container text-center">Photo</span>
                        </label>
                    </div>
                </div>
                
                <div class="pt-6">
                    <button class="honey-gradient w-full py-5 rounded-full text-on-primary font-headline font-extrabold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" type="button" onclick="savePreferences()">
                        Save Hive Preferences
                    </button>
                </div>
            </form>
         </section>
"""

start_idx = html.find('         <!-- DISCOVER -->')
end_idx = html.find('         <!-- PROFILE -->')
if start_idx != -1 and end_idx != -1:
    html = html[:start_idx] + new_discover + '         <!-- PROFILE -->\n         <section id="page-profile" class="page w-full max-w-4xl mx-auto p-8">\n' + html[end_idx+35:]

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
