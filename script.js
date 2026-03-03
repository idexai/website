let currentLang = localStorage.getItem('idex_lang') || 'tr';
let globalSearchQuery = '';
let globalClassFilter = 'all';

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
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        if (translations[lang][key]) {
            el.setAttribute('aria-label', translations[lang][key]);
        }
    });

    updateLangButtonClasses('lang-tr', 'lang-en', lang);
    updateLangButtonClasses('lang-tr-mobile', 'lang-en-mobile', lang);

    if (document.getElementById('instructors-grid')) renderInstructors();
    if (document.getElementById('projects-grid-eggdrop')) {
        renderGlobalFilterBar();
        renderExhibitions();
    }
}

function setupDesignThinkingTimeline() {
    const stepButtons = document.querySelectorAll('.dt-step-btn');
    if (!stepButtons.length) return;

    stepButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.dt-step').forEach((step) => step.classList.remove('is-active'));
            stepButtons.forEach((item) => item.removeAttribute('aria-current'));

            const parentStep = btn.closest('.dt-step');
            if (parentStep) parentStep.classList.add('is-active');
            btn.setAttribute('aria-current', 'step');
        });
    });
}

function renderInstructors() {
    const grid = document.getElementById('instructors-grid');
    if (!grid) return;
    let html = '';

    instructors.forEach((inst) => {
        const displayName = typeof inst.name === 'object' ? (inst.name[currentLang] || inst.name.tr || inst.name.en) : inst.name;
        const avatarUrl = inst.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${displayName}&backgroundColor=030303,1a1a1a&shape1Color=ffffff&shape2Color=444444`;
        const roleName = inst.role[currentLang];

        html += `
            <div class="person-card">
                <div class="person-photo museum-img-wrapper">
                    <img src="${avatarUrl}" alt="${displayName}">
                </div>
                <div>
                    <h3 class="person-name">${displayName}</h3>
                    <p class="person-role">${roleName}</p>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}

function getProjectGroup(project) {
    const yearText = `${project.year.tr} ${project.year.en}`;
    return yearText.includes('1') ? 'eggdrop' : 'hotbeverage';
}

function getProjectYearLevel(project) {
    const yearText = `${project.year.tr} ${project.year.en}`;
    if (yearText.includes('1')) return 1;
    if (yearText.includes('2')) return 2;
    if (yearText.includes('3')) return 3;
    if (yearText.includes('4')) return 4;
    return null;
}

function renderProjectGrid(gridId, projectGroup, searchQuery, yearFilter = 'all') {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    let html = '';
    const searchText = searchQuery.toLocaleLowerCase('tr-TR');
    const filteredProjects = projects.filter(proj => (
        getProjectGroup(proj) === projectGroup
        && (yearFilter === 'all' || getProjectYearLevel(proj) === Number(yearFilter.replace('y', '')))
        && (!searchText || proj.student.toLocaleLowerCase('tr-TR').includes(searchText))
    ));

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

function renderExhibitions() {
    renderProjectGrid('projects-grid-eggdrop', 'eggdrop', globalSearchQuery, globalClassFilter);
    renderProjectGrid('projects-grid-hotbeverage', 'hotbeverage', globalSearchQuery, globalClassFilter);
}

function renderGlobalFilterBar() {
    const classSelect = document.getElementById('global-class-filter');
    const searchInput = document.getElementById('global-student-search-input');
    if (!classSelect || !searchInput) return;
    const t = translations[currentLang];
    const allOption = classSelect.querySelector('option[value="all"]');
    if (allOption) {
        allOption.textContent = currentLang === 'tr'
            ? `Tümü (${projects.length})`
            : `All (${projects.length})`;
    }
    searchInput.placeholder = t.student_search_placeholder;
    searchInput.value = globalSearchQuery;
    classSelect.value = globalClassFilter;

    classSelect.onchange = () => {
        globalClassFilter = classSelect.value;
        renderExhibitions();
    };

    searchInput.oninput = () => {
        globalSearchQuery = searchInput.value.trim();
        renderExhibitions();
    };
}

function setupGlobalFilterVisibility() {
    const exhibitionSection = document.getElementById('sergi');
    const filterBar = document.getElementById('global-filter-bar');
    if (!exhibitionSection || !filterBar) return;

    const updateVisibility = () => {
        const rect = exhibitionSection.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08;
        filterBar.classList.toggle('visible', inView);
    };

    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    updateVisibility();
}

const modal = document.getElementById('project-modal');

function openModal(projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    document.getElementById('modal-title').innerText = proj.title[currentLang];
    document.getElementById('modal-student').innerText = proj.student;
    document.getElementById('modal-year').innerText = proj.year[currentLang];
    const shortDescEl = document.getElementById('modal-short-desc');
    if (shortDescEl) {
        const shortDesc = proj.short_desc?.[currentLang] || '';
        shortDescEl.innerText = shortDesc;
        shortDescEl.style.display = shortDesc ? 'block' : 'none';
    }
    document.getElementById('modal-image').src = proj.image;
    document.getElementById('modal-pdf-btn').href = proj.pdf;

    const toolsContainer = document.getElementById('modal-tools-container');
    toolsContainer.innerHTML = proj.tools.map(tool => `<span>${tool}</span>`).join('');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
    setupGlobalFilterVisibility();
    setupDesignThinkingTimeline();
});
