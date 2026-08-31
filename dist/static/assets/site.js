(() => {
  const button = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');
  if (button && menu) {
    const closeMenu = () => {
      button.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    };
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 920) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }
  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  document.querySelectorAll('[data-email-form]').forEach((form) => {
    const status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const subject = data.get('_subject') || 'TechCommons website enquiry';
      const lines = [];
      for (const [key, value] of data.entries()) {
        if (key.startsWith('_') || !String(value).trim()) continue;
        lines.push(`${key}: ${value}`);
      }
      const mailto = `mailto:techcommons.org@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      if (status) {
        status.textContent = 'Your email is ready. Send it from your email app to complete the enquiry.';
        status.focus();
      }
      window.location.href = mailto;
    });
  });

  document.querySelectorAll('[data-map-load]').forEach((button) => {
    button.addEventListener('click', () => {
      const shell = button.closest('[data-map-shell]');
      const iframe = document.createElement('iframe');
      iframe.title = 'Map showing the proposed Dougherty Community Centre venue in Chatswood';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.src = 'https://www.google.com/maps?q=Dougherty%20Community%20Centre%2C%207%20Victor%20Street%2C%20Chatswood%20NSW%202067&output=embed';
      shell.querySelector('.map-placeholder').replaceWith(iframe);
    }, { once: true });
  });
})();
