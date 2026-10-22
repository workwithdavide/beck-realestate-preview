/**
 * BECK Real Estate — Motion.
 *
 * Leitlinie aus dem Brand-Board: "Subtil. Weich. Langsam. Hochwertig."
 * Kein Framework, kein Scroll-Hijacking, alles respektiert
 * prefers-reduced-motion und funktioniert ohne JS (Inhalte bleiben sichtbar).
 */
(function () {
	'use strict';

	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

	/* ------------------------------------------------------------------ */
	/* 1. Reveal beim Scrollen                                             */
	/* ------------------------------------------------------------------ */
	/*
	 * Klassen statt data-Attribute: Gutenberg validiert das gespeicherte
	 * Markup gegen die save()-Ausgabe des Blocks — zusätzliche Attribute
	 * würden "unerwarteter Inhalt" auslösen, eine className nicht.
	 *
	 * .beck-reveal        — einzelnes Element blendet ein
	 * .beck-reveal-group  — direkte Kinder blenden gestaffelt ein
	 */

	function collectRevealTargets() {
		var targets = Array.prototype.slice.call(document.querySelectorAll('.beck-reveal'));

		Array.prototype.forEach.call(
			document.querySelectorAll('.beck-reveal-group'),
			function (group) {
				Array.prototype.forEach.call(group.children, function (child, index) {
					child.classList.add('beck-reveal');
					child.style.setProperty('--beck-reveal-delay', index * 110 + 'ms');

					if (targets.indexOf(child) === -1) {
						targets.push(child);
					}
				});
			}
		);

		return targets;
	}

	function initReveal() {
		var targets = collectRevealTargets();

		if (!targets.length) {
			return;
		}

		if (reduced.matches || !('IntersectionObserver' in window)) {
			return; // Ohne Animation bleibt alles einfach sichtbar.
		}

		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) {
						return;
					}

					entry.target.classList.add('is-revealed');
					observer.unobserve(entry.target);
				});
			},
			{ rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
		);

		targets.forEach(function (el) {
			// Erst jetzt verstecken — so bleibt die Seite ohne JS vollständig lesbar.
			el.classList.add('is-reveal-armed');

			// Was schon im Viewport liegt, kommt sofort (kein leerer First Paint).
			if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
				window.requestAnimationFrame(function () {
					el.classList.add('is-revealed');
				});
				return;
			}

			observer.observe(el);
		});
	}

	/* ------------------------------------------------------------------ */
	/* 2. Dezenter Parallax                                                */
	/* ------------------------------------------------------------------ */

	function initParallax() {
		var layers = document.querySelectorAll('.beck-parallax');

		if (!layers.length || reduced.matches) {
			return;
		}

		var ticking = false;

		function update() {
			var viewport = window.innerHeight;

			Array.prototype.forEach.call(layers, function (layer) {
				var rect = layer.getBoundingClientRect();

				if (rect.bottom < 0 || rect.top > viewport) {
					return;
				}

				// Zart per Default; .beck-parallax--strong verdoppelt den Ausschlag.
				var strength = layer.classList.contains('beck-parallax--strong') ? 0.16 : 0.08;
				var progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;

				layer.style.transform =
					'translate3d(0, ' + (progress * strength * 100).toFixed(2) + 'px, 0)';
			});

			ticking = false;
		}

		function onScroll() {
			if (ticking) {
				return;
			}
			ticking = true;
			window.requestAnimationFrame(update);
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		update();
	}

	/* ------------------------------------------------------------------ */
	/* 3. Header-Zustand                                                   */
	/* ------------------------------------------------------------------ */

	function initHeader() {
		var header = document.querySelector('.site-header');

		if (!header) {
			return;
		}

		// Umschaltpunkt: sobald der Hero (oder 80px) durchgescrollt ist.
		var hero = document.querySelector('.beck-hero');
		var ticking = false;

		// Der Hero zieht sich per CSS um genau diese Höhe nach oben.
		function measure() {
			document.documentElement.style.setProperty(
				'--beck-header-h',
				header.offsetHeight + 'px'
			);
		}

		measure();

		if ('ResizeObserver' in window) {
			new ResizeObserver(measure).observe(header);
		}

		function update() {
			var threshold = hero ? hero.offsetHeight - header.offsetHeight : 80;
			header.classList.toggle('is-scrolled', window.scrollY > threshold);
			ticking = false;
		}

		function onScroll() {
			if (ticking) {
				return;
			}
			ticking = true;
			window.requestAnimationFrame(update);
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		update();
	}

	/* ------------------------------------------------------------------ */
	/* 4. Hero-Video: bei reduzierter Bewegung pausieren                   */
	/* ------------------------------------------------------------------ */

	function initHeroVideo() {
		var video = document.querySelector('.beck-hero__media video');

		if (!video) {
			return;
		}

		function apply() {
			if (reduced.matches) {
				video.pause();
				video.removeAttribute('autoplay');
			} else {
				var playing = video.play();
				if (playing && typeof playing.catch === 'function') {
					playing.catch(function () {
						/* Autoplay blockiert — Poster bleibt stehen, das ist ok. */
					});
				}
			}
		}

		apply();

		if (typeof reduced.addEventListener === 'function') {
			reduced.addEventListener('change', apply);
		}
	}

	function init() {
		initReveal();
		initParallax();
		initHeader();
		initHeroVideo();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
