

<!-- SMOOTH SCROLL -->

  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let lenis = null;
  if (isDesktop) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }


<!-- SMOOTH SCROLL -->

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      if (!lenis) return; // touch: laat native scroll het doen
      e.preventDefault();
      lenis.scrollTo(target);
    });
  });


<!-- LOGO WALL -->

  function initLogoWallCycle() {
    const loopDelay = 1.5; // Loop Duration
    const duration = 0.9; // Animation Duration
    document.querySelectorAll('[data-logo-wall-cycle-init]').forEach((root) => {
      const list = root.querySelector('[data-logo-wall-list]');
      const items = Array.from(list.querySelectorAll('[data-logo-wall-item]'));
      const shuffleFront = root.getAttribute('data-logo-wall-shuffle') !== 'false';
      const originalTargets = items.map((item) => item.querySelector('[data-logo-wall-target]')).filter(Boolean);
      let visibleItems = [];
      let visibleCount = 0;
      let pool = [];
      let pattern = [];
      let patternIndex = 0;
      let tl;
      function isVisible(el) {
        return window.getComputedStyle(el).display !== 'none';
      }
      function shuffleArray(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      }
      function setup() {
        if (tl) {
          tl.kill();
        }
        visibleItems = items.filter(isVisible);
        visibleCount = visibleItems.length;
        pattern = shuffleArray(Array.from({ length: visibleCount }, (_, i) => i));
        patternIndex = 0;
        // remove all injected targets
        items.forEach((item) => {
          item.querySelectorAll('[data-logo-wall-target]').forEach((old) => old.remove());
        });
        pool = originalTargets.map((n) => n.cloneNode(true));
        let front, rest;
        if (shuffleFront) {
          const shuffledAll = shuffleArray(pool);
          front = shuffledAll.slice(0, visibleCount);
          rest = shuffleArray(shuffledAll.slice(visibleCount));
        } else {
          front = pool.slice(0, visibleCount);
          rest = shuffleArray(pool.slice(visibleCount));
        }
        pool = front.concat(rest);
        for (let i = 0; i < visibleCount; i++) {
          const parent = visibleItems[i].querySelector('[data-logo-wall-target-parent]') || visibleItems[i];
          parent.appendChild(pool.shift());
        }
        tl = gsap.timeline({ repeat: -1, repeatDelay: loopDelay });
        tl.call(swapNext);
        tl.play();
      }
      function swapNext() {
        const nowCount = items.filter(isVisible).length;
        if (nowCount !== visibleCount) {
          setup();
          return;
        }
        if (!pool.length) return;
        const idx = pattern[patternIndex % visibleCount];
        patternIndex++;
        const container = visibleItems[idx];
        const parent = container.querySelector('[data-logo-wall-target-parent]') || container.querySelector('*:has(> [data-logo-wall-target])') || container;
        const existing = parent.querySelectorAll('[data-logo-wall-target]');
        if (existing.length > 1) return;
        const current = parent.querySelector('[data-logo-wall-target]');
        const incoming = pool.shift();
        gsap.set(incoming, { yPercent: 50, autoAlpha: 0 });
        parent.appendChild(incoming);
        if (current) {
          gsap.to(current, {
            yPercent: -50,
            autoAlpha: 0,
            duration,
            ease: 'expo.inOut',
            onComplete: () => {
              current.remove();
              pool.push(current);
            },
          });
        }
        gsap.to(incoming, {
          yPercent: 0,
          autoAlpha: 1,
          duration,
          delay: 0.1,
          ease: 'expo.inOut',
        });
      }
      setup();
      ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => tl.play(),
        onLeave: () => tl.pause(),
        onEnterBack: () => tl.play(),
        onLeaveBack: () => tl.pause(),
      });
      document.addEventListener('visibilitychange', () => (document.hidden ? tl.pause() : tl.play()));
    });
  }
  // Initialize Logo Wall Cycle
  document.addEventListener('DOMContentLoaded', () => {
    initLogoWallCycle();
  });


<!-- STICKY STEPS -->

  function initStickyStepsBasic() {
    const containers = document.querySelectorAll('[data-sticky-steps-init]');
    if (!containers.length) return;
    containers.forEach((container) => {
      const items = [...container.querySelectorAll('[data-sticky-steps-item]')];
      if (!items.length) return;
      function updateSteps() {
        const viewportCenter = window.innerHeight / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;
        items.forEach((item, index) => {
          const anchor = item.querySelector('[data-sticky-steps-anchor]');
          if (!anchor) return;
          const rect = anchor.getBoundingClientRect();
          const anchorCenter = rect.top + rect.height / 2;
          const distance = Math.abs(viewportCenter - anchorCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        items.forEach((item, index) => {
          let status = 'active';
          if (index < closestIndex) status = 'before';
          if (index > closestIndex) status = 'after';
          item.setAttribute('data-sticky-steps-item-status', status);
        });
      }
      window.addEventListener('scroll', updateSteps);
      window.addEventListener('resize', updateSteps);
      requestAnimationFrame(updateSteps);
    });
  }
  // Initialize Sticky Steps (Basic)
  document.addEventListener('DOMContentLoaded', function () {
    initStickyStepsBasic();
  });




<!-- SWIPER SLIDER -->

  function initSwiperSlider() {
    const swiperSliderGroups = document.querySelectorAll('[data-swiper-group]');
    swiperSliderGroups.forEach((swiperGroup) => {
      const swiperSliderWrap = swiperGroup.querySelector('[data-swiper-wrap]');
      if (!swiperSliderWrap) return;
      const scope = swiperGroup.closest('.section') || document;
      const prevButton = scope.querySelector('[data-swiper-prev]');
      const nextButton = scope.querySelector('[data-swiper-next]');
      const progressFill = scope.querySelector('.swiper-progress__fill');
      function updateProgress(swiper) {
        if (!progressFill) return;
        const total = swiper.slides.length - 1;
        const minPct = 10; // starting fill for slide 0
        const pct = total > 0 ? minPct + (swiper.activeIndex / total) * (100 - minPct) : minPct;
        progressFill.style.width = pct + '%';
      }
      function updateProgressFromTouch(swiper) {
        if (!progressFill) return;
        const total = swiper.slides.length - 1;
        if (total <= 0) return;
        const minPct = 10;
        const rawPct = (-swiper.translate / swiper.snapGrid[total]) * 100;
        const pct = minPct + (Math.min(Math.max(rawPct, 0), 100) / 100) * (100 - minPct);
        progressFill.style.width = pct + '%';
      }
      new Swiper(swiperSliderWrap, {
        slidesPerView: 'auto',
        speed: 600,
        grabCursor: true,
        slidesOffsetAfter: (() => {
          const slide = swiperSliderWrap.querySelector('.swiper-slide');
          const slideW = slide ? slide.getBoundingClientRect().width : 304;
          return Math.max(0, swiperSliderWrap.clientWidth - slideW);
        })(),
        navigation: {
          nextEl: nextButton,
          prevEl: prevButton,
        },
        pagination: {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true,
        },
        keyboard: {
          enabled: true,
          onlyInViewport: false,
        },
        on: {
          init(swiper) {
            updateProgress(swiper);
          },
          slideChange(swiper) {
            updateProgress(swiper);
          },
          sliderMove(swiper) {
            updateProgressFromTouch(swiper);
          },
        },
      });
    });
  }
  document.addEventListener('DOMContentLoaded', initSwiperSlider);


<!-- REVEAL ANIMATION -->

  gsap.registerPlugin(ScrollTrigger);
  function initContentRevealScroll() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      document.querySelectorAll('[data-reveal-group]').forEach((groupEl) => {
        // Skip reveal op mobiel als dit element ook een mobile-swiper is (reveal breekt de swiper)
        if (groupEl.hasAttribute('data-mobile-swiper') && window.innerWidth <= 991) {
          gsap.set(groupEl, { clearProps: 'all' });
          Array.from(groupEl.children).forEach((child) => gsap.set(child, { clearProps: 'all', autoAlpha: 1, y: 0 }));
          return;
        }
        // Config from attributes or defaults (group-level)
        const groupStaggerSec = (parseFloat(groupEl.getAttribute('data-stagger')) || 100) / 1000; // ms → sec
        const groupDistance = groupEl.getAttribute('data-distance') || '2em';
        const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';
        const animDuration = 0.8;
        const animEase = 'power4.inOut';
        // Reduced motion: show immediately
        if (prefersReduced) {
          gsap.set(groupEl, { clearProps: 'all', y: 0, autoAlpha: 1 });
          return;
        }
        // If no direct children, animate the group element itself
        const directChildren = Array.from(groupEl.children).filter((el) => el.nodeType === 1);
        if (!directChildren.length) {
          gsap.set(groupEl, { y: groupDistance, autoAlpha: 0 });
          ScrollTrigger.create({
            trigger: groupEl,
            start: triggerStart,
            once: true,
            onEnter: () =>
              gsap.to(groupEl, {
                y: 0,
                autoAlpha: 1,
                duration: animDuration,
                ease: animEase,
                onComplete: () => gsap.set(groupEl, { clearProps: 'all' }),
              }),
          });
          return;
        }
        // Build animation slots: item or nested (deep layers allowed)
        const slots = [];
        directChildren.forEach((child) => {
          const nestedGroup = child.matches('[data-reveal-group-nested]') ? child : child.querySelector(':scope [data-reveal-group-nested]');
          if (nestedGroup) {
            const includeParent = child.getAttribute('data-ignore') !== 'true' && (child.getAttribute('data-ignore') === 'false' || nestedGroup.getAttribute('data-ignore') === 'false');
            const nestedChildren = Array.from(nestedGroup.children).filter((el) => el.nodeType === 1 && el.getAttribute('data-ignore') !== 'true');
            slots.push({
              type: 'nested',
              parentEl: child,
              nestedEl: nestedGroup,
              includeParent,
              nestedChildren,
            });
          } else {
            if (child.getAttribute('data-ignore') === 'true') return;
            slots.push({ type: 'item', el: child });
          }
        });
        // Initial hidden state
        slots.forEach((slot) => {
          if (slot.type === 'item') {
            // If the element itself is a nested group, force group distance (prevents it from using its own data-distance)
            const isNestedSelf = slot.el.matches('[data-reveal-group-nested]');
            const d = isNestedSelf ? groupDistance : slot.el.getAttribute('data-distance') || groupDistance;
            gsap.set(slot.el, { y: d, autoAlpha: 0 });
          } else {
            // Parent follows the group's distance when included, regardless of nested's data-distance
            if (slot.includeParent) gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
            // Children use nested group's own distance (fallback to group distance)
            const nestedD = slot.nestedEl.getAttribute('data-distance') || groupDistance;
            slot.nestedChildren.forEach((target) => gsap.set(target, { y: nestedD, autoAlpha: 0 }));
          }
        });
        // Extra safety: if a nested parent is included, re-assert its distance to the group's value
        slots.forEach((slot) => {
          if (slot.type === 'nested' && slot.includeParent) {
            gsap.set(slot.parentEl, { y: groupDistance });
          }
        });
        // Reveal sequence
        ScrollTrigger.create({
          trigger: groupEl,
          start: triggerStart,
          once: true,
          onEnter: () => {
            const tl = gsap.timeline();
            slots.forEach((slot, slotIndex) => {
              const slotTime = slotIndex * groupStaggerSec;
              if (slot.type === 'item') {
                tl.to(
                  slot.el,
                  {
                    y: 0,
                    autoAlpha: 1,
                    duration: animDuration,
                    ease: animEase,
                    onComplete: () => gsap.set(slot.el, { clearProps: 'all' }),
                  },
                  slotTime,
                );
              } else {
                // Optionally include the parent at the same slot time (parent uses group distance)
                if (slot.includeParent) {
                  tl.to(
                    slot.parentEl,
                    {
                      y: 0,
                      autoAlpha: 1,
                      duration: animDuration,
                      ease: animEase,
                      onComplete: () => gsap.set(slot.parentEl, { clearProps: 'all' }),
                    },
                    slotTime,
                  );
                }
                // Nested children use nested stagger (ms → sec); fallback to group stagger
                const nestedMs = parseFloat(slot.nestedEl.getAttribute('data-stagger'));
                const nestedStaggerSec = isNaN(nestedMs) ? groupStaggerSec : nestedMs / 1000;
                slot.nestedChildren.forEach((nestedChild, nestedIndex) => {
                  tl.to(
                    nestedChild,
                    {
                      y: 0,
                      autoAlpha: 1,
                      duration: animDuration,
                      ease: animEase,
                      onComplete: () => gsap.set(nestedChild, { clearProps: 'all' }),
                    },
                    slotTime + nestedIndex * nestedStaggerSec,
                  );
                });
              }
            });
          },
        });
      });
    });
    return () => ctx.revert();
  }
  // Initialize Elements Reveal on Scroll
  document.addEventListener('DOMContentLoaded', () => {
    initContentRevealScroll();
  });


<!-- STICKY BALLS -->

  gsap.to('.scroll-ball', {
    scrollTrigger: {
      trigger: '[data-stickyball-trigger]',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
    },
    top: '100%',
    ease: 'none',
  });


<!-- BACKGROUND SHAPES ANIMATION -->

  gsap.registerPlugin(ScrollTrigger);

  // Hero background blobs, ambient float animation
  const shapes = gsap.utils.toArray('.hero-bg-shape');
  shapes.forEach((shape, i) => {
    const direction = i % 2 === 0 ? 1 : -1;
    gsap.to(shape, {
      y: 100 * direction,
      rotation: 20 * direction,
      duration: 6 + i * 1.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });

  // Scroll-driven downward shift, different distance per blob
  const scrollShift = {
    '.hero-bg-shape.is-1': 70,
    '.hero-bg-shape.is-2': 40,
    '.hero-bg-shape.is-3': 20, // placeholder, change to whatever you want
  };

  Object.entries(scrollShift).forEach(([selector, value]) => {
    gsap.to(selector, {
      yPercent: value,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });
  });


<!-- STICKY BALLS -->

  function initStickyLine() {
    const desktopEl = document.querySelector('[data-stickyball-trigger="desktop"]');
    if (!desktopEl) return;
    const fill = desktopEl.querySelector('.scroll-line.is-fill');
    const hasFill = desktopEl.querySelector('.scroll-line.has-fill');
    const firstVisual = document.querySelector('.sticky-steps__visual');
    if (!fill || !hasFill || !firstVisual) return;
    let scrollFillTween = null;
    function layout() {
      if (scrollFillTween) {
        scrollFillTween.scrollTrigger?.kill();
        scrollFillTween.kill();
        scrollFillTween = null;
      }
      fill.style.height = '';
      fill.style.top = '';
      hasFill.style.height = '';
      hasFill.style.top = '';
      gsap.set(fill, { clearProps: 'transform,height' });
      const savedScroll = window.scrollY;
      window.scrollTo(0, 0);
      const elRect = desktopEl.getBoundingClientRect();
      const visRect = firstVisual.getBoundingClientRect();
      const offsetTop = visRect.top - elRect.top;
      const lineHeight = elRect.height - offsetTop;
      window.scrollTo(0, savedScroll);
      hasFill.style.top = offsetTop + 'px';
      hasFill.style.height = lineHeight + 'px';
      fill.style.top = offsetTop + 'px';
      fill.style.height = '0px';
      scrollFillTween = gsap.to(fill, {
        height: lineHeight,
        ease: 'none',
        scrollTrigger: {
          trigger: desktopEl,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
    }
    function init() {
      layout();
      ScrollTrigger.refresh();
    }
    if (document.readyState === 'complete') {
      init();
    } else {
      window.addEventListener('load', init);
    }
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        layout();
        ScrollTrigger.refresh();
      }, 150);
    });
  }
  window.addEventListener('DOMContentLoaded', initStickyLine);

  /* ---------- added: .scroll-ball-image fade in/out ---------- */
  function initScrollBallImage() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // covers desktop + any other data-stickyball-trigger elements
    const triggers = document.querySelectorAll('[data-stickyball-trigger]');

    triggers.forEach((triggerEl) => {
      const ball = triggerEl.querySelector('.scroll-ball-image'); // deep child
      if (!ball) return;

      // start hidden, no flash before refresh
      gsap.set(ball, { opacity: 0 });

      const fade = (to) =>
        gsap.to(ball, {
          opacity: to,
          duration: 0.3,
          ease: 'power1.out',
          overwrite: 'auto', // prevents overlapping fades
        });

      ScrollTrigger.create({
        trigger: triggerEl,
        start: 'top 20%',     // fade in here (scrolling down)
        end: 'bottom 80%',    // fade out here (scrolling down)
        onEnter: () => fade(1),       // entered range going down
        onLeave: () => fade(0),       // passed end going down
        onEnterBack: () => fade(1),   // re-entered range going up (reverse)
        onLeaveBack: () => fade(0),   // left range going up (reverse)
        onRefresh: (self) => {
          // keep correct resting state after load / resize / layout change
          gsap.set(ball, { opacity: self.isActive ? 1 : 0 });
        },
      });
    });
  }
  window.addEventListener('DOMContentLoaded', initScrollBallImage);


<!-- LOTTIES -->

  gsap.registerPlugin(ScrollTrigger);
  function initLottieAnimations() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('[data-lottie]').forEach((target) => {
      let anim;
      const shouldLoop = target.getAttribute('data-lottie-loop') !== 'false';
      ScrollTrigger.create({
        trigger: target,
        start: 'top bottom+=50%',
        end: 'bottom top-=25%',
        onEnter: handleEnter,
        onEnterBack: handleEnter,
        onLeave: handleLeave,
        onLeaveBack: handleLeave,
      });
      function handleEnter() {
        if (!target.hasAttribute('data-lottie-fired')) {
          target.setAttribute('data-lottie-fired', 'true');
          anim = lottie.loadAnimation({
            container: target,
            renderer: 'svg',
            loop: shouldLoop,
            autoplay: !reduceMotion,
            path: target.getAttribute('data-lottie-src'),
          });
          anim.addEventListener('DOMLoaded', () => {
            if (reduceMotion) {
              const frame = parseInt(target.getAttribute('data-lottie-frame') || '0', 10);
              anim.goToAndStop(frame, true);
            }
          });
        } else if (anim && !reduceMotion) {
          if (!shouldLoop) {
            anim.goToAndPlay(0, true);
          } else {
            anim.play();
          }
        }
      }
      function handleLeave() {
        if (anim && !reduceMotion) {
          anim.pause();
        }
      }
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    initLottieAnimations();
  });


<!-- SWIPER MOBILE -->

  function initMobileSwipers() {
    const MOBILE_BP = 767;
    const instances = new Map();
    const isMobile = () => window.innerWidth <= MOBILE_BP;
    function buildSwiper(el) {
      if (instances.has(el)) return;
      const originalChildren = Array.from(el.children);
      const wrapper = document.createElement('div');
      wrapper.className = 'swiper-wrapper';
      originalChildren.forEach((child) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.appendChild(child);
        wrapper.appendChild(slide);
      });
      el.appendChild(wrapper);
      el.classList.add('swiper', 'is-swiper-mobile');
      const swiper = new Swiper(el, {
        slidesPerView: parseFloat(el.dataset.mobileSwiperPerView) || 1.15,
        spaceBetween: parseInt(el.dataset.mobileSwiperGap) || 16,
        grabCursor: true,
      });
      instances.set(el, { swiper, originalChildren, wrapper });
    }
    function destroySwiper(el) {
      const inst = instances.get(el);
      if (!inst) return;
      inst.swiper.destroy(true, true);
      inst.originalChildren.forEach((child) => el.appendChild(child));
      inst.wrapper.remove();
      el.classList.remove('swiper', 'is-swiper-mobile');
      instances.delete(el);
    }
    function sync() {
      const targets = document.querySelectorAll('[data-mobile-swiper]');
      targets.forEach((el) => {
        if (isMobile()) {
          buildSwiper(el);
        } else {
          destroySwiper(el);
        }
      });
    }
    sync();
    let resizeTimer = null;
    let lastIsMobile = isMobile();
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const now = isMobile();
        if (now !== lastIsMobile) {
          lastIsMobile = now;
          sync();
        }
      }, 150);
    });
  }
  document.addEventListener('DOMContentLoaded', initMobileSwipers);


<!-- ACCORDION -->

  function initAccordionCSS() {
    document.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
      const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';
      accordion.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-accordion-toggle]');
        if (!toggle) return; // Exit if the clicked element is not a toggle
        const singleAccordion = toggle.closest('[data-accordion-status]');
        if (!singleAccordion) return; // Exit if no accordion container is found
        const isActive = singleAccordion.getAttribute('data-accordion-status') === 'active';
        singleAccordion.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');
        // When [data-accordion-close-siblings="true"]
        if (closeSiblings && !isActive) {
          accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
            if (sibling !== singleAccordion) sibling.setAttribute('data-accordion-status', 'not-active');
          });
        }
      });
    });
  }
  // Initialize Accordion CSS
  document.addEventListener('DOMContentLoaded', () => {
    initAccordionCSS();
  });


<!-- NAV SCROLLED -->

  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top+=50',
    onEnter: () => document.querySelector('.mega-nav').classList.add('is-scrolled'),
    onLeaveBack: () => document.querySelector('.mega-nav').classList.remove('is-scrolled'),
  });


<!-- TEXT ANIMATION -->

gsap.registerPlugin(SplitText, ScrollTrigger);
const splitConfig = {
  lines: { duration: 0.8, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { stagger: 0.05, orangeHold: 0.3, resolve: 0.1 }
};
function initMaskTextScrollReveal() {
  document.querySelectorAll('[data-split="heading"]').forEach((heading) => {
    // Reset CSS visibility here (prevents hidden text issues)
    gsap.set(heading, { autoAlpha: 1 });
    // Capture the heading's natural text color (the final resting color)
    const finalColor = getComputedStyle(heading).color;
    // Always split all the way down to characters for letter-by-letter
    SplitText.create(heading, {
      type: "lines, words, chars",
      autoSplit: true,
      linesClass: "line",
      wordsClass: "word",
      charsClass: "letter",
      onSplit: function (instance) {
        const targets = instance.chars;
        const config = splitConfig.chars;
        // Resting state: regular color, dimmed down
        gsap.set(targets, { opacity: 0.2, color: finalColor });
        // Check if element is already in viewport
        const rect = heading.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight * 0.8;
        return gsap.to(targets, {
          opacity: 1,
          // Per letter: snap to orange, HOLD, then resolve to the real text color
          keyframes: [
            { color: "#FF4200", duration: 0 },          // instantly orange
            { color: "#FF4200", duration: config.orangeHold }, // stay orange
            { color: finalColor, duration: config.resolve, ease: "power2.out" } // fade to final
          ],
          duration: config.orangeHold + config.resolve,
          stagger: config.stagger,
          ease: "power2.out",
          scrollTrigger: isInViewport ? undefined : {
            trigger: heading,
            start: "clamp(top 80%)",
            once: true
          },
          // If in viewport, play immediately with slight delay for polish
          delay: isInViewport ? 0.1 : 0
        });
      }
    });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  document.fonts.ready.then(() => {
    initMaskTextScrollReveal();
  });
});


<!-- 
  document.querySelectorAll('[data-fade-ball="true"]').forEach((ball) => {
  gsap.set(ball, { opacity: 0 });

  ScrollTrigger.create({
    trigger: ball,
    start: "center 60%",
    end: "top 10%",
    scrub: true,
    markers: true, // temporary
    invalidateOnRefresh: true,
    onUpdate(self) {
      const p = self.progress;
      let opacity;
      if (p < 0.15) opacity = p / 0.15;
      else if (p > 0.85) opacity = 1 - (p - 0.85) / 0.15;
      else opacity = 1;
      gsap.set(ball, { opacity });
    },
  });

  // If the image isn't loaded yet, refresh once it is so the trigger range is correct
  if (!ball.complete) {
    ball.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }
});

window.addEventListener("load", () => ScrollTrigger.refresh());
-->

<!-- BALL FADEIN OUT -->

  function initFadeBall() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const balls = document.querySelectorAll('[data-fade-ball="true"]');

    balls.forEach((ball) => {
      gsap.set(ball, { opacity: 0 });

      const fade = (to) =>
        gsap.to(ball, {
          opacity: to,
          duration: 0.3,
          ease: 'power1.out',
          overwrite: 'auto', // no overlap if you scroll fast
        });

      ScrollTrigger.create({
        trigger: ball,            // trigger is itself
        start: 'top 60%',         // fade in here (scrolling down)
        end: 'top 20%',           // fade out here (scrolling down)
        markers: false,
        // no scrub -> instant callback-driven animations
        onEnter: () => fade(1),       // entered range going down
        onLeave: () => fade(0),       // passed end going down
        onEnterBack: () => fade(1),   // re-entered range going up
        onLeaveBack: () => fade(0),   // left range going up
        onRefresh: (self) => {
          // correct resting state after load / resize
          gsap.set(ball, { opacity: self.isActive ? 1 : 0 });
        },
      });
    });
  }
  window.addEventListener('DOMContentLoaded', initFadeBall);
