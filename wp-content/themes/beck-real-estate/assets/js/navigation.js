/* Keep WordPress's dialog, focus trap and scroll lock; enhance only submenus. */
(function () {
	'use strict';
	function init() {
		var header = document.querySelector('.site-header');
		if (!header) return;
		var compact = window.matchMedia('(max-width: 1199px)');
		var panels = header.querySelectorAll('.wp-block-navigation__responsive-container');
		panels.forEach(function (panel, panelIndex) {
			var entries = [];
			panel.querySelectorAll('.has-child').forEach(function (item, index) {
				var toggle = Array.from(item.children).find(function (child) {
					return child.matches('button.wp-block-navigation-submenu__toggle');
				});
				var submenu = Array.from(item.children).find(function (child) {
					return child.classList.contains('wp-block-navigation__submenu-container');
				});
				if (!toggle || !submenu) return;
				item.classList.add('beck-submenu-ready');
				if (!submenu.id) submenu.id = 'beck-submenu-' + panelIndex + '-' + index;
				toggle.setAttribute('aria-controls', submenu.id);
				entries.push({ item: item, toggle: toggle });
			});
			function close(entry) {
				entries.forEach(function (candidate) {
					if (!entry.item.contains(candidate.item)) return;
					candidate.item.classList.remove('beck-submenu-open');
					candidate.toggle.setAttribute('aria-expanded', 'false');
				});
			}
			function reset() { entries.forEach(close); }
			panel.addEventListener('click', function (event) {
				if (!compact.matches || !panel.classList.contains('is-menu-open')) return;
				var button = event.target.closest('button.wp-block-navigation-submenu__toggle');
				var entry = entries.find(function (candidate) { return candidate.toggle === button; });
				if (!entry) return; // Links keep their own destinations, at every depth.
				event.preventDefault();
				event.stopImmediatePropagation();
				var opening = !entry.item.classList.contains('beck-submenu-open');
				entries.forEach(function (candidate) {
					if (candidate.item.parentElement === entry.item.parentElement || entry.item.contains(candidate.item)) close(candidate);
				});
				entry.item.classList.toggle('beck-submenu-open', opening);
				entry.toggle.setAttribute('aria-expanded', String(opening));
			}, true);
			panel.addEventListener('keydown', function (event) {
				if (!compact.matches || event.key !== 'Escape' || !panel.classList.contains('is-menu-open')) return;
				var item = event.target.closest('.beck-submenu-open');
				var entry = entries.find(function (candidate) { return candidate.item === item; });
				if (!entry) return; // Let WordPress close the dialog when no group is open.
				event.preventDefault();
				event.stopImmediatePropagation();
				entries.forEach(function (candidate) { if (item.contains(candidate.item)) close(candidate); });
				entry.toggle.focus();
			}, true);
			new MutationObserver(function () {
				if (!panel.classList.contains('is-menu-open') || compact.matches) reset();
			}).observe(panel, { attributes: true, attributeFilter: ['class'] });
			compact.addEventListener('change', function () {
				reset();
				// A dialog opened on mobile must release its native scroll lock on desktop.
				if (!compact.matches && panel.classList.contains('is-menu-open')) {
					var closeButton = panel.querySelector('.wp-block-navigation__responsive-container-close');
					if (closeButton) closeButton.click();
				}
			});
		});
		header.classList.add('beck-navigation-ready');
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
})();
