document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule-container');
    const searchBar = document.getElementById('search-bar');
    const noResults = document.getElementById('no-results');
    const loading = document.getElementById('loading');

    let allTalks = [];

    // Fetch talks from API
    fetch('/api/talks')
        .then(response => response.json())
        .then(data => {
            allTalks = data;
            loading.classList.add('hidden');
            renderSchedule(allTalks);
        })
        .catch(error => {
            console.error('Error fetching talks:', error);
            loading.textContent = 'Failed to load schedule. Please try again later.';
        });

    // Render schedule items
    function renderSchedule(items) {
        scheduleContainer.innerHTML = '';
        
        items.forEach(item => {
            if (item.type === 'break') {
                scheduleContainer.appendChild(createBreakCard(item));
            } else {
                scheduleContainer.appendChild(createTalkCard(item));
            }
        });
    }

    function createBreakCard(item) {
        const div = document.createElement('div');
        div.className = 'card lunch-card';
        div.innerHTML = `
            <span>🍽️ ${item.label}</span>
            <span class="time-range">${item.startTime} - ${item.endTime}</span>
        `;
        return div;
    }

    function createTalkCard(talk) {
        const initials = talk.speaker.split(' ').map(n => n[0]).join('');
        
        const div = document.createElement('div');
        div.className = 'card talk-card';
        div.dataset.categories = talk.categories.join(',').toLowerCase();
        
        div.innerHTML = `
            <div class="time-slot">${talk.startTime}</div>
            <div class="talk-content">
                <h2 class="talk-title">${talk.title}</h2>
                <div class="speaker-info">
                    <div class="avatar">${initials}</div>
                    <span class="speaker-name">${talk.speaker}</span>
                </div>
                <div class="tags-and-duration">
                    ${talk.categories.map(cat => `<span class="tag">${cat}</span>`).join('')}
                    <span class="duration-chip">60 min</span>
                </div>
                <div class="description-container">
                    <p class="description-text">${talk.description}</p>
                    <button class="read-more-btn">Read more</button>
                </div>
            </div>
        `;

        // Expand/Collapse logic
        const btn = div.querySelector('.read-more-btn');
        const text = div.querySelector('.description-text');
        btn.addEventListener('click', () => {
            const isExpanded = text.classList.toggle('expanded');
            btn.textContent = isExpanded ? 'Show less' : 'Read more';
        });

        // Tag click logic
        div.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = tag.textContent;
                searchBar.value = category;
                filterTalks(category);
            });
        });

        return div;
    }

    // Filter logic
    searchBar.addEventListener('input', (e) => {
        filterTalks(e.target.value);
    });

    function filterTalks(query) {
        const searchTerm = query.toLowerCase().trim();
        const cards = scheduleContainer.querySelectorAll('.talk-card');
        let visibleTalks = 0;

        cards.forEach(card => {
            const categories = card.dataset.categories;
            if (searchTerm === '' || categories.includes(searchTerm)) {
                card.classList.remove('hidden');
                visibleTalks++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Lunch break is always visible (it doesn't have .talk-card class)
        // Check if we should show "No results"
        if (visibleTalks === 0 && searchTerm !== '') {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }
    }
});
