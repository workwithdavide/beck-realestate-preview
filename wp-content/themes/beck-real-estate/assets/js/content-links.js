/** Visible affordances for internal content links; navigation and footer stay unchanged. */
(function () {
 'use strict';
 function initContentLinkArrows() {
  document.querySelectorAll('main a[href]').forEach(function (link) {
   if (link.closest('header, footer, nav, .site-header, .site-footer, .wp-block-buttons, .wp-block-query-pagination, .beck-breadcrumb, .beck-siblings') || link.matches('.wp-element-button, .wp-block-button__link, [role="button"]')) return;
   if (!link.textContent.trim() || link.querySelector('img, svg, .beck-link-arrow')) return;
   var target;
   try { target = new URL(link.getAttribute('href'), window.location.href); } catch (error) { return; }
   if (target.origin !== window.location.origin || !/^https?:$/.test(target.protocol)) return;
   if (target.pathname === window.location.pathname && target.search === window.location.search && target.hash) return;
   link.classList.add('beck-forward-link');
   var arrow = document.createElement('span');
   arrow.className = 'beck-link-arrow';
   arrow.setAttribute('aria-hidden', 'true');
   arrow.textContent = '\u2192';
   link.appendChild(arrow);
  });
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initContentLinkArrows);
 else initContentLinkArrows();
})();
