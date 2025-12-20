// main.js
// 1) Navbar + active links + smooth scroll + year
(function(){
    const navbar = document.getElementById('navbar');
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    function updateActive(){
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;
        const fromTop = window.scrollY + navH + 12;
        links.forEach(a=>{
            const href = a.getAttribute('href');
            if(!href || !href.startsWith('#')) return;
            const sec = document.querySelector(href);
            if(!sec) return;
            const top = sec.offsetTop;
            const bottom = top + sec.offsetHeight;
            if(fromTop >= top && fromTop < bottom) a.classList.add('active');
            else a.classList.remove('active');
        });
    }

    window.addEventListener('scroll', ()=>{
        if(window.scrollY > 20) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
        updateActive();
    }, { passive:true });

    document.querySelectorAll('a[href^="#"]').forEach(a=>{
        a.addEventListener('click', function(e){
            const target = document.querySelector(this.getAttribute('href'));
            if(target){
                e.preventDefault();
                const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;
                const top = target.getBoundingClientRect().top + window.pageYOffset - navH - 8;
                window.scrollTo({ top: top, behavior:'smooth' });
            }
        });
    });

    updateActive();
})();


// 2) GitHub Projects Carousel with dynamic <reponame>.png logos
(function(){
    const carousel = document.getElementById('projects-carousel');
    const btnPrev = document.getElementById('projects-prev');
    const btnNext = document.getElementById('projects-next');

    if(!carousel) return;

    const GITHUB_USERNAME = 'cyrax3589';
    const REPOS_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;

    const PROJECT_PRIORITY = {
        "Car_Rental_Management_System": 1,
        "Real-Time-Sentiment-Analysis-Using-Twitter": 2,
        "Reddit-Sentiment-Analyzer": 3,
        "AI-Website-Sentiment-Analyzer": 4,
        "debabrata_kuiry": 101
    };
    const DEFAULT_PRIORITY = 100;

    // Build URL for <reponame>.png at repo root on main branch
    function buildRepoLogoUrl(repoName){
        const branch = 'main'; // change if your default branches differ
        return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/${branch}/${repoName}.png`;
    }

    async function fetchRepos(){
        try{
            const res = await fetch(REPOS_API_URL);
            if(!res.ok) throw new Error('API error');
            const data = await res.json();

            const filtered = data.filter(r => !r.fork && !r.archived);

            filtered.sort((a, b)=>{
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

            top.forEach(repo=>{
                const card = document.createElement('div');
                card.className = 'project-card';

                const stars = repo.stargazers_count || 0;
                const lang = repo.language || 'Multi-tech';
                const desc = repo.description || 'Project description coming soon.';

                const logoUrl = buildRepoLogoUrl(repo.name);

                card.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                        <div style="font-weight:700;max-width:70%;word-wrap:break-word;">
                            ${repo.name}
                        </div>
                        <div class="project-logo-wrapper" style="display:flex;align-items:center;justify-content:center;min-width:56px;min-height:56px;">
                            <img src="${logoUrl}" alt="${repo.name} logo"
                                 style="width:56px;height:56px;border-radius:18px;object-fit:cover;box-shadow:0 0 0 2px rgba(148,163,184,0.45);"
                                 onerror="
                                     this.onerror=null;
                                     this.remove();
                                     this.parentElement.textContent='📦';
                                     this.parentElement.style.fontSize='1.6rem';
                                 ">
                        </div>
                    </div>
                    <div style="color:#22c55e;font-weight:600;margin-bottom:10px">
                        ⭐ ${stars} • ${lang}
                    </div>
                    <p class="description-text">
                        ${desc}
                    </p>
                    <a href="${repo.html_url}" target="_blank" rel="noopener"
                       style="color:var(--accent-primary);font-weight:600;font-size:0.95rem;text-decoration:none">
                        View on GitHub →
                    </a>
                `;
                carousel.appendChild(card);
            });

            if(top.length === 0){
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `
                    <div style="font-weight:700;margin-bottom:8px">No public repositories found</div>
                    <p class="description-text">
                        Once your GitHub repositories are public, they will appear here automatically.
                    </p>
                `;
                carousel.appendChild(card);
            }
        }catch(e){
            console.error(e);
        }
    }

    function scrollByCard(direction){
        const firstCard = carousel.querySelector('.project-card');
        if(!firstCard) return;
        const cardWidth = firstCard.getBoundingClientRect().width + 16;
        carousel.scrollBy({ left: direction * cardWidth, behavior:'smooth' });
    }

    if(btnPrev) btnPrev.addEventListener('click', ()=> scrollByCard(-1));
    if(btnNext) btnNext.addEventListener('click', ()=> scrollByCard(1));

    fetchRepos();
})();


// 3) Collaboration Projects Carousel (hard-coded data + optional logos)
(function(){
    const collabCarousel = document.getElementById('collab-carousel');
    const collabPrev = document.getElementById('collab-prev');
    const collabNext = document.getElementById('collab-next');

    if(!collabCarousel) return;

    const COLLAB_PROJECTS = [
        {
            title: "ECLIPSE",
            roleNote: "Early Cancer Lesion Identification",
            description: "Standalone offline skin-cancer detection system built with Swin Transformer + DenseNet-169 + U-Net architecture, deployed as a Windows WPF MSI installer using ONNX for real-time local inference.",
            repoUrl: "https://github.com/FRIEND_USERNAME/REPO_NAME",
            logoUrl: "assets/eclipse-logo.png",   // optional; remove or null for default icon
            collaborators: [
                {
                    name: "Anu22",
                    github: "https://github.com/ANU_GITHUB",
                    linkedin: "https://www.linkedin.com/in/ANU_LINKEDIN"
                },
                {
                    name: "Vaibhav",
                    github: "https://github.com/VAIBHAV_GITHUB",
                    linkedin: "https://www.linkedin.com/in/VAIBHAV_LINKEDIN"
                }
            ]
        }
    ];

    function renderCollabCards(){
        collabCarousel.innerHTML = "";

        if(COLLAB_PROJECTS.length === 0){
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div style="font-weight:700;margin-bottom:8px">No collaboration projects added yet</div>
                <p class="description-text">
                    As you join more team projects, list them here to highlight shared work.
                </p>
            `;
            collabCarousel.appendChild(card);
            return;
        }

        COLLAB_PROJECTS.forEach(project=>{
            const card = document.createElement('div');
            card.className = 'project-card';

            const logoHtml = project.logoUrl
                ? `<img src="${project.logoUrl}" alt="${project.title} logo"
                         style="width:56px;height:56px;border-radius:18px;object-fit:cover;box-shadow:0 0 0 2px rgba(148,163,184,0.45);">`
                : `<div style="font-size:1.6rem">🟡</div>`;

            const collaboratorsHtml = project.collaborators.map(c=>`
                <li style="margin-bottom:4px;">
                    <span style="font-weight:600">${c.name}</span>
                    <span style="color:var(--text-tertiary);font-size:0.85rem"> · </span>
                    <a href="${c.github}" target="_blank" rel="noopener"
                       style="color:var(--accent-primary);font-size:0.9rem;text-decoration:none;margin-right:6px">GitHub</a>
                    <a href="${c.linkedin}" target="_blank" rel="noopener"
                       style="color:var(--accent-primary);font-size:0.9rem;text-decoration:none">LinkedIn</a>
                </li>
            `).join("");

            card.innerHTML = `
                <div style="font-size:0.8rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;color:var(--text-tertiary);">
                    ${project.title}
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                    <div style="font-weight:700;max-width:70%;word-wrap:break-word;color:#22c55e;">
                        Early Cancer Lesion Identification Using Parallel Swin Encoder
                    </div>
                    ${logoHtml}
                </div>
                <p class="description-text">
                    ${project.description}
                </p>
                <a href="${project.repoUrl}" target="_blank" rel="noopener"
                   style="color:var(--accent-primary);font-weight:600;font-size:0.95rem;text-decoration:none;display:inline-block;margin-bottom:10px">
                    View Collaboration Repo →
                </a>
                <div style="border-top:1px solid var(--border);padding-top:8px;margin-top:4px">
                    <div style="font-size:0.85rem;color:var(--text-tertiary);margin-bottom:4px">Collaborators</div>
                    <ul style="list-style:none;padding-left:0;margin:0">
                        ${collaboratorsHtml}
                    </ul>
                </div>
            `;
            collabCarousel.appendChild(card);
        });
    }

    function scrollCollabByCard(direction){
        const firstCard = collabCarousel.querySelector('.project-card');
        if(!firstCard) return;
        const cardWidth = firstCard.getBoundingClientRect().width + 16;
        collabCarousel.scrollBy({ left: direction * cardWidth, behavior:'smooth' });
    }

    if(collabPrev) collabPrev.addEventListener('click', ()=> scrollCollabByCard(-1));
    if(collabNext) collabNext.addEventListener('click', ()=> scrollCollabByCard(1));

    renderCollabCards();
})();
