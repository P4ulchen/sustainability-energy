const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#siteNav');

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  toggle?.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}));

document.querySelector('#year').textContent = new Date().getFullYear();
