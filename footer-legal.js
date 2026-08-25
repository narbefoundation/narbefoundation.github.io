/*!
 * NARBE Foundation - Shared privacy & legal footer
 * ------------------------------------------------
 * Injects a persistent Privacy Policy link plus a collapsible summary into the
 * footer of every page, so the policy only has to be maintained in one place.
 *
 * Drop-in: <script src="footer-legal.js" defer></script> before </body>.
 * No CSS edits required - styles are injected by this file.
 *
 * The canonical policy always lives at privacy.html. The summary below is a
 * plain-language digest, NOT a replacement, and every panel links out to the
 * full text.
 */
(function () {
  'use strict';

  var POLICY_URL = 'privacy.html';
  var CONTACT = 'info@narbefoundation.org';

  var CSS = [
    '.footer-legal p{color:#94a3b8;font-size:.9rem;margin-bottom:.5rem;}',
    '.footer-policy{margin-top:1.25rem;}',
    '.footer-policy-links{display:flex;flex-wrap:wrap;justify-content:center;',
    'align-items:center;gap:.5rem 1.25rem;margin-bottom:.75rem;}',
    '.footer-policy-links a{color:#cbd5e1;font-size:.9rem;text-decoration:none;',
    'border-bottom:1px solid rgba(203,213,225,.4);padding-bottom:1px;}',
    '.footer-policy-links a:hover,.footer-policy-links a:focus-visible{color:#fff;',
    'border-bottom-color:#fff;}',
    '.footer-policy-toggle{display:inline-flex;align-items:center;gap:.5rem;',
    'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);',
    'color:#e2e8f0;font:inherit;font-size:.9rem;padding:.5rem 1rem;border-radius:999px;',
    'cursor:pointer;transition:background .2s ease;}',
    '.footer-policy-toggle:hover{background:rgba(255,255,255,.16);}',
    '.footer-policy-toggle:focus-visible{outline:3px solid #a78bfa;outline-offset:2px;}',
    '.footer-policy-chevron{transition:transform .25s ease;font-size:.7em;line-height:1;}',
    '.footer-policy-toggle[aria-expanded="true"] .footer-policy-chevron{transform:rotate(180deg);}',
    '.footer-policy-panel{display:grid;grid-template-rows:0fr;transition:grid-template-rows .3s ease;}',
    '.footer-policy-panel[data-open="true"]{grid-template-rows:1fr;}',
    '.footer-policy-inner{overflow:hidden;}',
    '.footer-policy-card{max-width:760px;margin:1rem auto 0;text-align:left;',
    'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);',
    'border-radius:10px;padding:1.25rem 1.5rem;}',
    '.footer-policy-card h3{font-size:.95rem;color:#fff;margin:0 0 .75rem;}',
    '.footer-policy-card ul{list-style:none;margin:0 0 1rem;padding:0;}',
    '.footer-policy-card li{color:#cbd5e1;font-size:.88rem;line-height:1.6;',
    'margin-bottom:.55rem;padding-left:1.4rem;position:relative;}',
    '.footer-policy-card li::before{content:"\\2713";position:absolute;left:0;',
    'color:#a78bfa;font-weight:700;}',
    '.footer-policy-card a{color:#ddd6fe;}',
    '.footer-policy-more{font-size:.88rem;color:#94a3b8;margin:0;}',
    '@media (prefers-reduced-motion:reduce){.footer-policy-panel,',
    '.footer-policy-chevron{transition:none;}}'
  ].join('');

  /* Plain-language digest of privacy.html. Keep in sync when the policy changes. */
  var SUMMARY = [
    'We collect what you give us - switch kit applications, emails, newsletter signups, and donations - and we use it only for the reason you gave it.',
    'We never sell, rent, or trade your information, and we never share our donor list.',
    'Processed switch kit applications are moved off Google Drive onto an offline hard drive, and the online copies are deleted.',
    'This site uses Google Analytics, MailerLite, and Givebutter. No advertising or social media tracking pixels, ever.',
    'Your accessibility toolbar settings are saved in your own browser and never sent to us.',
    'Photos, videos, and stories are never posted publicly without your clear permission - and you can ask us to take something down.',
    'You can ask what we have, ask us to correct it, or ask us to delete it, any time.'
  ];

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    }
    (children || []).forEach(function (c) {
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function injectStyles() {
    if (document.getElementById('footer-policy-styles')) return;
    var style = el('style', { id: 'footer-policy-styles' });
    style.appendChild(document.createTextNode(CSS));
    document.head.appendChild(style);
  }

  function build() {
    // The legal block sits inside <footer> on every page; fall back just in case.
    var host = document.querySelector('footer .footer-legal') ||
               document.querySelector('.footer-legal');
    if (!host || host.querySelector('.footer-policy')) return;

    injectStyles();

    var onPolicyPage = /(^|\/)privacy\.html$/i.test(window.location.pathname);
    var panelId = 'footer-policy-panel';

    // --- always-visible links (notice must not depend on opening the panel)
    var links = el('div', { 'class': 'footer-policy-links' }, [
      el('a', { href: POLICY_URL }, ['Privacy Policy']),
      el('a', { href: POLICY_URL + '#donor-privacy' }, ['Donor Privacy']),
      el('a', { href: POLICY_URL + '#cookies' }, ['Cookies']),
      el('a', { href: 'mailto:' + CONTACT }, ['Contact'])
    ]);

    // --- collapsible summary
    var toggle = el('button', {
      type: 'button',
      'class': 'footer-policy-toggle',
      'aria-expanded': 'false',
      'aria-controls': panelId
    }, ['Privacy & Legal Summary ', el('span', { 'class': 'footer-policy-chevron', 'aria-hidden': 'true' }, ['▾'])]);

    var list = el('ul', {});
    SUMMARY.forEach(function (line) { list.appendChild(el('li', {}, [line])); });

    var more = el('p', { 'class': 'footer-policy-more' }, [
      onPolicyPage ? 'You are reading the full policy on this page.'
                   : 'This is a summary only. ',
      onPolicyPage ? '' : el('a', { href: POLICY_URL }, ['Read the full Privacy Policy →'])
    ].filter(function (x) { return x !== ''; }));

    var card = el('div', { 'class': 'footer-policy-card' }, [
      el('h3', {}, ['What we do with your information']),
      list,
      more
    ]);

    var panel = el('div', { 'class': 'footer-policy-panel', id: panelId, 'data-open': 'false' }, [
      el('div', { 'class': 'footer-policy-inner' }, [card])
    ]);

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      panel.setAttribute('data-open', String(!open));
    });

    var wrap = el('div', { 'class': 'footer-policy' }, [links, toggle, panel]);
    host.appendChild(wrap);

    // Deep links such as footer.html#cookies should open the panel on arrival.
    if (/^#(privacy|cookies|donor)/i.test(window.location.hash)) {
      toggle.click();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
