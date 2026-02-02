// 1) Navbar + active links + smooth scroll + year
(function () {
    const navbar = document.getElementById('navbar');
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    function updateActive() {
        const navH = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-height')) || 64;
        const fromTop = window.scrollY + navH + 12;
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            const sec = document.querySelector(href);
            if (!sec) return;
            const top = sec.offsetTop;
            const bottom = top + sec.offsetHeight;
            if (fromTop >= top && fromTop < bottom) a.classList.add('active');
            else a.classList.remove('active');
        });
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
        updateActive();
    }, { passive: true });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const navH = parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue('--nav-height')) || 64;
            const top = target.getBoundingClientRect().top +
                window.pageYOffset - navH - 8;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    updateActive();
})();


// 2) Dynamic Skills from data/skills.json
(function () {
    const skillsGrid = document.getElementById('skills-grid');
    if (!skillsGrid) return;

    const SKILLS_JSON_URL = 'data/skills.json';
    const ICON_BASE_PATH = 'assets/icons/';

    async function loadSkills() {
        try {
            const res = await fetch(SKILLS_JSON_URL);
            if (!res.ok) throw new Error('Failed to load skills');
            const skills = await res.json();

            skillsGrid.innerHTML = '';

            skills.forEach(skill => {
                const name = skill.name || 'Unnamed Skill';
                const file = skill.file || '';
                const logoPath = file ? ICON_BASE_PATH + file : '';

                const card = document.createElement('div');
                card.className = 'skill-card';

                const logoHtml = logoPath
                    ? `<div class="skill-logo-wrap">
                           <img src="${logoPath}" alt="${name} logo"
                                onerror="this.style.display='none';
                                this.parentElement.textContent='${(name[0] || '?').toUpperCase()}';">
                       </div>`
                    : `<div class="skill-logo-wrap"
                           style="color:var(--accent-primary);font-weight:700;font-size:1.2rem;">
                           ${(name[0] || '?').toUpperCase()}
                       </div>`;

                card.innerHTML = `
                    ${logoHtml}
                    <div class="skill-name">${name}</div>
                `;

                skillsGrid.appendChild(card);
            });
        } catch (e) {
            console.error('Error loading skills:', e);
            skillsGrid.innerHTML = `
                <div style="color:var(--text-secondary);font-size:0.9rem;">
                    Unable to load skills at the moment.
                </div>
            `;
        }
    }

    loadSkills();
})();


// 3) GitHub Projects Carousel
(function () {
    const carousel = document.getElementById('projects-carousel');
    const btnPrev = document.getElementById('projects-prev');
    const btnNext = document.getElementById('projects-next');
    if (!carousel) return;

    const GITHUB_USERNAME = 'cyrax3589';
    const REPOS_API_URL =
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;

    const PROJECT_PRIORITY = {
        'Car_Rental_Management_System': 1,
        'Real-Time-Sentiment-Analysis-Using-Twitter': 2,
        'Reddit-Sentiment-Analyzer': 3,
        'AI-Website-Sentiment-Analyzer': 4,
        'debabrata_kuiry': 101
    };
    const DEFAULT_PRIORITY = 100;

    function buildRepoLogoUrl(repoName) {
        return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/main/${repoName}.png`;
    }

    async function fetchRepos() {
        try {
            const res = await fetch(REPOS_API_URL);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();

            const filtered = data.filter(r => !r.fork && !r.archived);

            filtered.sort((a, b) => {
                const pa = PROJECT_PRIORITY[a.name] ?? DEFAULT_PRIORITY;
                const pb = PROJECT_PRIORITY[b.name] ?? DEFAULT_PRIORITY;
                if (pa !== pb) return pa - pb;
                if (b.stargazers_count !== a.stargazers_count) {
                    return b.stargazers_count - a.stargazers_count;
                }
                return new Date(b.updated_at) - new Date(a.updated_at);
            });

            const top = filtered.slice(0, 12);
            carousel.innerHTML = '';

            top.forEach(repo => {
                const card = document.createElement('div');
                card.className = 'project-card';

                card.innerHTML = `
                    <div style="display:flex;flex-direction:column;
                                align-items:center;text-align:center;margin-bottom:8px;">
                        <div class="project-logo-wrapper">
                            <img src="${buildRepoLogoUrl(repo.name)}"
                                 alt="${repo.name} logo"
                                 onerror="
                                     this.remove();
                                     this.parentElement.textContent='📦';
                                     this.parentElement.style.fontSize='2rem';
                                 ">
                        </div>
                        <div class="project-title">${repo.name}</div>
                    </div>

                    <p class="description-text">
                        ${repo.description || 'Project description coming soon.'}
                    </p>

                    <div style="margin-top:auto;">
                        <a href="${repo.html_url}" target="_blank" rel="noopener"
                           class="project-link">
                            View on GitHub →
                        </a>
                    </div>
                `;

                carousel.appendChild(card);
            });

            // VIEW ALL CARD (ALWAYS LAST)
            const viewAllCard = document.createElement('div');
            viewAllCard.className = 'project-card';
            viewAllCard.innerHTML = `
                <div style="display:flex;flex-direction:column;
                            align-items:center;justify-content:center;
                            text-align:center;height:100%;">
                    <div style="font-size:2rem;margin-bottom:6px;">
                    <img src="assets/icons/folder.png" alt="ViewAll Logo"
                         style="width:128px;height:128px;filter:invert(1);">
                    </div>
                    <div class="project-title" style="margin-bottom:6px;">
                        View All Projects
                    </div>
                    <a href="https://github.com/${GITHUB_USERNAME}?tab=repositories"
                       target="_blank" rel="noopener"
                       class="project-link">
                        View All →
                    </a>
                </div>
            `;
            carousel.appendChild(viewAllCard);

        } catch (e) {
            console.error(e);
        }
    }

    function scrollByCard(direction) {
        const firstCard = carousel.querySelector('.project-card');
        if (!firstCard) return;
        const cardWidth = firstCard.getBoundingClientRect().width + 16;
        carousel.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
    }

    if (btnPrev) btnPrev.addEventListener('click', () => scrollByCard(-1));
    if (btnNext) btnNext.addEventListener('click', () => scrollByCard(1));

    fetchRepos();
})();


// 4) Collaboration Projects Carousel
(function () {
    const collabCarousel = document.getElementById('collab-carousel');
    const collabPrev = document.getElementById('collab-prev');
    const collabNext = document.getElementById('collab-next');

    if (!collabCarousel) return;

    const COLLAB_PROJECTS = [
        {
            title: 'ECLIPSE',
            roleNote: 'Early Cancer Lesion Identification',
            description:
                'Standalone offline skin-cancer detection system built with Swin Transformer + DenseNet-169 + U-Net architecture, deployed as a Windows WPF MSI installer using ONNX for real-time local inference.',
            repoUrl: 'https://github.com/Vaibhav5012/ECLIPSE',
            logoUrl: 'assets/eclipse-logo.png',
            collaborators: [
                {
                    name: 'Anu-253',
                    github: 'https://github.com/Anu-253',
                    linkedin: 'https://www.linkedin.com/in/anagha-p-kulkarni-723498341/'
                },
                {
                    name: 'B Chiru Vaibhav',
                    github: 'https://github.com/Vaibhav5012',
                    linkedin: 'https://www.linkedin.com/in/bchiruvaibhav/'
                }
            ]
        }
    ];

    function renderCollabCards() {
        collabCarousel.innerHTML = '';

        if (COLLAB_PROJECTS.length === 0) {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-title" style="margin-bottom:8px">
                    No collaboration projects added yet
                </div>
                <p class="description-text">
                    As you join more team projects, list them here
                    to highlight shared work.
                </p>
            `;
            collabCarousel.appendChild(card);
            return;
        }

        COLLAB_PROJECTS.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';

            const logoHtml = project.logoUrl
                ? `<img src="${project.logoUrl}" alt="${project.title} logo">`
                : `<div style="font-size:2rem">🟡</div>`;

            const collaboratorsHtml = project.collaborators
                .map(c => `
                    <li style="margin-bottom:4px;">
                        <span style="font-weight:600">${c.name}</span>
                        <span style="color:var(--text-tertiary);font-size:0.85rem"> · </span>
                        <a href="${c.github}" target="_blank" rel="noopener"
                           style="color:var(--accent-primary);font-size:0.9rem;
                                  text-decoration:none;margin-right:6px">
                            GitHub
                        </a>
                        <a href="${c.linkedin}" target="_blank" rel="noopener"
                           style="color:var(--accent-primary);font-size:0.9rem;
                                  text-decoration:none">
                            LinkedIn
                        </a>
                    </li>
                `)
                .join('');

            card.innerHTML = `
                <div style="display:flex;flex-direction:column;
                            align-items:center;text-align:center;margin-bottom:8px;">
                    <div class="project-logo-wrapper">
                        ${logoHtml}
                    </div>
                    <div class="project-title" style="margin-bottom:2px;">
                        ${project.title}
                    </div>
                    <div style="font-size:0.9rem;color:#22c55e;font-weight:600;">
                        ${project.roleNote}
                    </div>
                </div>

                <p class="description-text">
                    ${project.description}
                </p>

                <a href="${project.repoUrl}" target="_blank" rel="noopener"
                   class="project-link" style="display:inline-block;margin-bottom:10px;">
                    View Collaboration Repo →
                </a>

                <div style="border-top:1px solid var(--border);
                            padding-top:8px;margin-top:4px">
                    <div style="font-size:0.85rem;color:var(--text-tertiary);
                                margin-bottom:4px">
                        Collaborators
                    </div>
                    <ul style="list-style:none;padding-left:0;margin:0">
                        ${collaboratorsHtml}
                    </ul>
                </div>
            `;

            collabCarousel.appendChild(card);
        });
    }

    function scrollCollabByCard(direction) {
        const firstCard = collabCarousel.querySelector('.project-card');
        if (!firstCard) return;

        const cardWidth = firstCard.getBoundingClientRect().width + 16;
        collabCarousel.scrollBy({
            left: direction * cardWidth,
            behavior: 'smooth'
        });
    }

    if (collabPrev) {
        collabPrev.addEventListener('click', () => scrollCollabByCard(-1));
    }

    if (collabNext) {
        collabNext.addEventListener('click', () => scrollCollabByCard(1));
    }

    renderCollabCards();
})();

