let currentLang = localStorage.getItem('idex_lang') || 'tr';
let activeFilter = 'all';

function updateLangButtonClasses(trId, enId, lang) {
    const trBtn = document.getElementById(trId);
    const enBtn = document.getElementById(enId);
    if (!trBtn || !enBtn) return;

    trBtn.className = lang === 'tr' ? 'lang-btn active' : 'lang-btn';
    enBtn.className = lang === 'en' ? 'lang-btn active' : 'lang-btn';
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('idex_lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    updateLangButtonClasses('lang-tr', 'lang-en', lang);
    updateLangButtonClasses('lang-tr-mobile', 'lang-en-mobile', lang);

    if (document.getElementById('filters-container')) renderFilters();
    if (document.getElementById('instructors-grid')) renderInstructors();
    if (document.getElementById('projects-grid')) renderProjects();
}

function renderFilters() {
    const container = document.getElementById('filters-container');
    if (!container) return;
    const t = translations[currentLang];
    container.innerHTML = `
        <button class="filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">${t.filter_all}</button>
        <button class="filter-btn ${activeFilter === 'y1' ? 'active' : ''}" data-filter="y1">${t.filter_y1}</button>
        <button class="filter-btn ${activeFilter === 'y2' ? 'active' : ''}" data-filter="y2">${t.filter_y2}</button>
        <button class="filter-btn ${activeFilter === 'y3' ? 'active' : ''}" data-filter="y3">${t.filter_y3}</button>
        <button class="filter-btn ${activeFilter === 'y4' ? 'active' : ''}" data-filter="y4">${t.filter_y4}</button>
    `;

    container.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            activeFilter = btn.getAttribute('data-filter');
            renderFilters();
            renderProjects();
        });
    });
}

function renderInstructors() {
    const grid = document.getElementById('instructors-grid');
    if (!grid) return;
    let html = '';

    instructors.forEach((inst) => {
        const avatarUrl = inst.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${inst.name}&backgroundColor=030303,1a1a1a&shape1Color=ffffff&shape2Color=444444`;
        const roleName = inst.role[currentLang];

        html += `
            <div class="person-card">
                <div class="person-photo museum-img-wrapper">
                    <img src="${avatarUrl}" alt="${inst.name}">
                </div>
                <div>
                    <h3 class="person-name">${inst.name}</h3>
                    <p class="person-role">${roleName}</p>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}

function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    let html = '';

    const filteredProjects = projects.filter(proj => {
        if (activeFilter === 'all') return true;
        const yearText = `${proj.year.tr} ${proj.year.en}`;
        if (activeFilter === 'y1') return yearText.includes('1');
        if (activeFilter === 'y2') return yearText.includes('2');
        if (activeFilter === 'y3') return yearText.includes('3');
        if (activeFilter === 'y4') return yearText.includes('4');
        return true;
    });

    filteredProjects.forEach(proj => {
        const yearName = proj.year[currentLang];
        const titleName = proj.title[currentLang];

        html += `
            <div class="project-card" onclick="openModal(${proj.id})">
                <div class="project-image-wrap museum-img-wrapper">
                    <img src="${proj.image}" alt="${titleName}">
                </div>
                <div class="project-meta">
                    <span class="project-year">${yearName}</span>
                    <h3 class="project-title">${titleName}</h3>
                    <p class="project-student">${proj.student}</p>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}

const modal = document.getElementById('project-modal');

function openModal(projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    document.getElementById('modal-title').innerText = proj.title[currentLang];
    document.getElementById('modal-student').innerText = proj.student;
    document.getElementById('modal-year').innerText = proj.year[currentLang];
    document.getElementById('modal-image').src = proj.image;
    document.getElementById('modal-pdf-btn').href = proj.pdf;

    const toolsContainer = document.getElementById('modal-tools-container');
    toolsContainer.innerHTML = proj.tools.map(tool => `<span>${tool}</span>`).join('');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
});
