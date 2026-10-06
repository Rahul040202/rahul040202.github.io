const CONTENT_FILES = {
  projects: 'content/projects.json',
  writings: 'content/writings.json',
  experience: 'content/experience.json',
  about: 'content/about.json'
};

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const tagsMarkup = tags => (tags || []).map(tag => `<span>${escapeHTML(tag)}</span>`).join('');
const highlightText = (text, keywords = []) => {
  const terms = [...new Set(keywords.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!terms.length) return escapeHTML(text);
  const escapedTerms = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const expression = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  const matches = new Set(terms.map(term => term.toLocaleLowerCase()));
  return String(text).split(expression).map(part => matches.has(part.toLocaleLowerCase())
    ? `<mark class="keyword-highlight">${escapeHTML(part)}</mark>`
    : escapeHTML(part)).join('');
};
const imageFitClass = item => item.imageFit === 'contain' ? ' fit-contain' : '';
const coverImage = item => `<img class="card-cover${imageFitClass(item)}" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.alt || '')}" loading="lazy">`;

function projectCard(project) {
  const demo = project.demo ? `<div class="card-face card-back" aria-hidden="true" inert><div class="demo-heading"><span class="eyebrow">Project demo</span><button class="button card-action" type="button" data-card-action="details">← Back to details</button></div><div class="demo-preview"><img src="${escapeHTML(project.demo)}" alt="${escapeHTML(project.demoAlt || `Demo for ${project.title}`)}" class="demo-image${project.demoFit === 'contain' ? ' fit-contain' : ''}" loading="lazy" /></div></div>` : '';
  const demoButton = project.demo ? '<button class="button primary card-action" type="button" data-card-action="demo" aria-expanded="false">Demo ↗</button>' : '';
  return `<article class="card project-card${project.demo ? ' has-demo' : ''}"><div class="project-card-inner"><div class="card-face card-front">${coverImage(project)}<div class="card-body"><h2>${escapeHTML(project.title)}</h2><p>${escapeHTML(project.description)}</p><p class="outcome">${escapeHTML(project.outcome)}</p><div class="tags">${tagsMarkup(project.tags)}</div><div class="card-actions"><a class="button card-action" href="${escapeHTML(project.url || '#/projects')}">View GitHub →</a>${demoButton}</div></div></div>${demo}</div></article>`;
}

function writingCard(post) {
  return `<article class="card">${coverImage(post)}<div class="card-body"><p class="eyebrow">${escapeHTML(post.platform)} · ${escapeHTML(post.format)}</p><h2>${escapeHTML(post.title)}</h2><p>${escapeHTML(post.summary)}</p>${post.url ? `<a class="card-link" href="${escapeHTML(post.url)}">Read article →</a>` : ''}</div></article>`;
}

async function loadContent() {
  try {
    const [projects, writings, experience, about] = await Promise.all(
      Object.entries(CONTENT_FILES).map(async ([key, path]) => {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Could not load ${path}`);
        return [key, await response.json()];
      })
    );
    const data = Object.fromEntries([projects, writings, experience, about]);
    document.querySelector('#projects-list').innerHTML = data.projects.map(projectCard).join('');
    document.querySelector('#featured-projects').innerHTML = data.projects.slice(0, 2).map(projectCard).join('');
    document.querySelectorAll('.project-card [data-card-action]').forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.project-card');
        const showingDemo = button.dataset.cardAction === 'demo';
        card.classList.toggle('is-flipped', showingDemo);
        card.querySelector('.card-front').inert = showingDemo;
        card.querySelector('.card-front').setAttribute('aria-hidden', String(showingDemo));
        const back = card.querySelector('.card-back');
        back.inert = !showingDemo;
        back.setAttribute('aria-hidden', String(!showingDemo));
        const toggle = card.querySelector('[data-card-action="demo"]');
        if (toggle) toggle.setAttribute('aria-expanded', String(showingDemo));
      });
    });
    document.querySelector('#writing-list').innerHTML = data.writings.map(writingCard).join('');
    document.querySelector('#experience-list').innerHTML = data.experience.map(job =>
      `<article class="job"><h2 class="job-heading"><span class="job-role">${escapeHTML(job.role)}</span><span class="job-company">${escapeHTML(job.company)}</span></h2><small>${escapeHTML(job.dates)}</small><ul>${(job.highlights || []).map(item => `<li>${highlightText(item, job.highlightKeywords)}</li>`).join('')}</ul>${job.skills?.length ? `<div class="tags job-skills" aria-label="Skills used">${tagsMarkup(job.skills)}</div>` : ''}</article>`
    ).join('');
    const educationMarkup = (data.about.education || []).map(item =>
      `<article class="about-entry education-entry"><h3>${escapeHTML(item.degree)}</h3><p class="about-entry-institution">${escapeHTML(item.institution)}</p><div class="about-meta"><span>${escapeHTML(item.location)}</span><span>${escapeHTML(item.dates)}</span></div></article>`
    ).join('');
    const achievementMarkup = (data.about.achievements || []).map(item =>
      `<article class="about-entry"><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.event)}</p></article>`
    ).join('');
    const publicationMarkup = (data.about.publications || []).map(item =>
      `<article class="about-entry publication-entry"><h3>${escapeHTML(item.title)}</h3><div class="about-meta"><span>${escapeHTML(item.venue)}</span><span>${escapeHTML(item.year)}</span></div></article>`
    ).join('');
    const certificationMarkup = (data.about.certifications || []).map(item =>
      `<article class="about-entry certification-entry"><p class="about-entry-issuer">${escapeHTML(item.issuer)}</p><h3>${escapeHTML(item.name)}</h3></article>`
    ).join('');
    const aboutSections = [
      ['education', 'Education', educationMarkup],
      ['achievements', 'Achievements', achievementMarkup],
      ['publications', 'Publications', publicationMarkup],
      ['certifications', 'Certifications', certificationMarkup]
    ];
    const aboutCards = Object.fromEntries(aboutSections
      .filter(([key]) => data.about[key]?.length)
      .map(([key, title, entries]) => [key, `<section class="about-card"><h2>${escapeHTML(title)}</h2><div class="about-entries">${entries}</div></section>`]));
    document.querySelector('#about-details').innerHTML = [
      ['education', 'achievements'],
      ['publications', 'certifications']
    ].map(column => `<div class="about-column">${column.map(key => aboutCards[key] || '').join('')}</div>`).join('');
    document.querySelector('#skills-details').innerHTML = `<h2 class="skills-heading">Skills</h2>${Object.entries(data.about.skills || {}).map(([group, skills]) =>
      `<section class="skill-group"><h3 class="panel-heading">${escapeHTML(group)}</h3><div class="tags">${tagsMarkup(skills)}</div></section>`
    ).join('')}`;
  } catch (error) {
    console.error('Portfolio content could not be loaded.', error);
  }
}

loadContent();
