

// <!--  SMOOTH SCROLL -->

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


// <!--  SMOOTH SCROLL -->

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      if (!lenis) return; // touch: laat native scroll het doen
      e.preventDefault();
      lenis.scrollTo(target);
    });
  });

//<!-- LENIS ANCHOR LINK -->

// Scroll-To Anchor Lenis
function initScrollToAnchorLenis() {
  document.querySelectorAll("[data-anchor-target]").forEach(element => {
    element.addEventListener("click", function () {
      const targetScrollToAnchorLenis = this.getAttribute("data-anchor-target");

      lenis.scrollTo(targetScrollToAnchorLenis, {
        easing: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
        duration: 1.2,
        offset: 0 // Option to create an offset when there is a fixed navigation for example
      });
    });
  });
}

// Initialize Scroll-To Anchor Lenis
document.addEventListener('DOMContentLoaded', () => {
  initScrollToAnchorLenis();
});


// <!--  LOGO WALL -->

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


// <!--  STICKY STEPS -->

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




// <!--  SWIPER SLIDER -->

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


// <!--  REVEAL ANIMATION -->

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


// <!--  STICKY BALLS -->

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


// <!--  BACKGROUND SHAPES ANIMATION -->

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


// <!--  STICKY BALLS -->

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


// <!--  LOTTIES -->

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


// <!--  SWIPER MOBILE -->

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


// <!--  ACCORDION -->

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


// <!--  NAV SCROLLED -->

  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top+=50',
    onEnter: () => document.querySelector('.mega-nav').classList.add('is-scrolled'),
    onLeaveBack: () => document.querySelector('.mega-nav').classList.remove('is-scrolled'),
  });


// <!--  TEXT ANIMATION -->

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


/* // <!--  
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
--> */

// <!-- BUNNY LIGHT BOX -->

function initBunnyLightboxPlayer() {
  var player = document.querySelector('[data-bunny-lightbox-init]');
  if (!player) return;

  var wrapper = player.closest('[data-bunny-lightbox-status]');
  if (!wrapper) return;

  var video = player.querySelector('video');
  if (!video) return;

  try { video.pause(); } catch(_) {}
  try { video.removeAttribute('src'); video.load(); } catch(_) {}

  // Attribute helpers (collapsed)
  function setAttr(el, name, val) {
    var str = (typeof val === 'boolean') ? (val ? 'true' : 'false') : String(val);
    if (el.getAttribute(name) !== str) el.setAttribute(name, str);
  }
  function setStatus(s) { setAttr(player, 'data-player-status', s); }
  function setMutedState(v) { video.muted = !!v; setAttr(player, 'data-player-muted', video.muted); }
  function setFsAttr(v) { setAttr(player, 'data-player-fullscreen', !!v); }
  function setActivated(v) { setAttr(player, 'data-player-activated', !!v); }
  if (!player.hasAttribute('data-player-activated')) setActivated(false);

  // Elements
  var timeline = player.querySelector('[data-player-timeline]');
  var progressBar = player.querySelector('[data-player-progress]');
  var bufferedBar = player.querySelector('[data-player-buffered]');
  var handle = player.querySelector('[data-player-timeline-handle]');
  var timeDurationEls = player.querySelectorAll('[data-player-time-duration]');
  var timeProgressEls = player.querySelectorAll('[data-player-time-progress]');
  var playerPlaceholderImg = player.querySelector('[data-bunny-lightbox-placeholder]');

  // Flags
  var updateSize = player.getAttribute('data-player-update-size'); // "true" | "cover" | "false" | null
  var autoplay = player.getAttribute('data-player-autoplay') === 'true';
  var initialMuted = player.getAttribute('data-player-muted') === 'true';

  var pendingPlay = false;

  video.loop = false;
  setMutedState(initialMuted);

  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.playsInline = true;
  if (typeof video.disableRemotePlayback !== 'undefined') video.disableRemotePlayback = true;
  if (autoplay) video.autoplay = false;

  var isSafariNative = !!video.canPlayType('application/vnd.apple.mpegurl');
  var canUseHlsJs = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

  // Load/attach only when opened
  var isAttached = false;
  var currentSrc = '';
  var forcedType = ''; // "hls" | "mp4" | "progressive" | "" (auto-detect)
  var lastPauseBy = '';
  var rafId;
  var autoStartOnReady = false;

  // Helper: source type detection
  // HLS if the path ends in .m3u8/.m3u, or if data-bunny-lightbox-type="hls" is set.
  // Everything else (mp4, webm, ogv, mov) is treated as a progressive file and
  // handed straight to the video element, bypassing hls.js.
  function isHlsSrc(src) {
    if (forcedType === 'hls') return true;
    if (forcedType === 'mp4' || forcedType === 'progressive' || forcedType === 'file') return false;
    if (!src) return false;
    var path = String(src).split('#')[0].split('?')[0];
    return /\.m3u8?$/i.test(path);
  }

  function attachProgressive(src, onReady) {
    if (player._hls) { try { player._hls.destroy(); } catch(_) {} player._hls = null; }
    video.preload = 'auto';
    video.src = src;
    video.addEventListener('loadedmetadata', onReady, { once: true });
    try { video.load(); } catch(_) {}
  }

  // Clamp setup for [data-bunny-lightbox-calc-height]
  function setupLightboxClamp(player, wrapper, video, updateSize) {
    var calcBox = wrapper.querySelector('[data-bunny-lightbox-calc-height]');
    if (!calcBox) return;

    function getRatio() {
      if (updateSize === 'cover') return null;

      if (updateSize === 'true') {
        if (video.videoWidth && video.videoHeight) return video.videoWidth / video.videoHeight;
        var before = player.querySelector('[data-player-before]');
        if (before && before.style && before.style.paddingTop) {
          var pct = parseFloat(before.style.paddingTop);
          if (pct > 0) return 100 / pct;
        }
        var r = player.getBoundingClientRect();
        if (r.height > 0) return r.width / r.height;
        return 16/9;
      }

      var beforeFalse = player.querySelector('[data-player-before]');
      if (beforeFalse && beforeFalse.style && beforeFalse.style.paddingTop) {
        var pad = parseFloat(beforeFalse.style.paddingTop);
        if (pad > 0) return 100 / pad;
      }
      var rb = player.getBoundingClientRect();
      if (rb.height > 0) return rb.width / rb.height;
      return 16/9;
    }

    function applyClamp() {
      if (updateSize === 'cover') {
        calcBox.style.maxWidth = '';
        calcBox.style.maxHeight = '';
        return;
      }

      var parent = wrapper;
      var cs = getComputedStyle(parent);
      var pt = parseFloat(cs.paddingTop)    || 0;
      var pb = parseFloat(cs.paddingBottom) || 0;
      var pl = parseFloat(cs.paddingLeft)   || 0;
      var pr = parseFloat(cs.paddingRight)  || 0;

      var cw = (parent.clientWidth  - pl - pr);
      var ch = (parent.clientHeight - pt - pb);
      if (cw <= 0 || ch <= 0) return;

      var ratio = getRatio();
      if (!ratio) {
        calcBox.style.maxWidth = '';
        calcBox.style.maxHeight = '';
        return;
      }

      var hIfFullWidth = cw / ratio;

      if (hIfFullWidth <= ch) {
        calcBox.style.maxWidth  = '100%';
        calcBox.style.maxHeight = (hIfFullWidth / ch * 100) + '%';
      } else {
        calcBox.style.maxHeight = '100%';
        calcBox.style.maxWidth  = ((ch * ratio) / cw * 100) + '%';
      }
    }

    var rafPending = false;
    function debouncedApply() {
      if (rafPending) return;
      if (wrapper.getAttribute('data-bunny-lightbox-status') !== 'active') return;
      rafPending = true;
      requestAnimationFrame(function(){ 
        rafPending = false; 
        applyClamp(); 
      });
    }

    var ro = new ResizeObserver(debouncedApply);
    ro.observe(wrapper);

    window.addEventListener('resize', debouncedApply);
    window.addEventListener('orientationchange', debouncedApply);

    if (updateSize === 'true') {
      video.addEventListener('loadedmetadata', debouncedApply);
      video.addEventListener('loadeddata', debouncedApply);
      video.addEventListener('playing', debouncedApply);
    }

    player._applyClamp = debouncedApply;
    debouncedApply();
  }

  setupLightboxClamp(player, wrapper, video, updateSize);

  // Unified attach pipeline
  function withAttach(src, onReady) {
    // Progressive file (mp4/webm/mov): never route through hls.js
    if (!isHlsSrc(src)) {
      attachProgressive(src, onReady);
      return;
    }
    if (isSafariNative) {
      video.preload = 'auto';
      video.src = src;
      video.addEventListener('loadedmetadata', onReady, { once: true });
      return;
    }
    if (canUseHlsJs) {
      var hls = new Hls({ maxBufferLength: 10 });
      player._hls = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, function(){ hls.loadSource(src); });
      hls.on(Hls.Events.MANIFEST_PARSED, function(){ onReady(); });
      hls.on(Hls.Events.LEVEL_LOADED, function(e, data){
        if (data && data.details && isFinite(data.details.totalduration) && timeDurationEls.length) {
          setText(timeDurationEls, formatTime(data.details.totalduration));
        }
      });
      return;
    }
    video.preload = 'auto';
    video.src = src;
    video.addEventListener('loadedmetadata', onReady, { once: true });
  }

  function attachMediaFor(src) {
    if (currentSrc === src && isAttached) return;
    if (player._hls) { try { player._hls.destroy(); } catch(_) {} player._hls = null; }
    if (timeDurationEls.length) setText(timeDurationEls, '00:00');

    currentSrc = src;
    isAttached = true;

    withAttach(src, function onReady(){
      readyIfIdle(player, pendingPlay);
      updateBeforeRatioIOSSafe();
      if (typeof player._applyClamp === 'function') player._applyClamp();
      if (timeDurationEls.length && video.duration) setText(timeDurationEls, formatTime(video.duration));

      if (autoStartOnReady && wrapper.getAttribute('data-bunny-lightbox-status') === 'active') {
        setStatus('loading');
        safePlay(video);
        autoStartOnReady = false;
      }
    });
  }

  function ensureOpenUI(isActive) {
    var state = isActive ? 'active' : 'not-active';
    if (wrapper.getAttribute('data-bunny-lightbox-status') !== state) {
      wrapper.setAttribute('data-bunny-lightbox-status', state);
    }
    if (isActive && typeof player._applyClamp === 'function') player._applyClamp();
  }

  // Centralized open policy
  function isSameSrc(next){ return currentSrc && currentSrc === next; }
  function planOnOpen(next) {
    var same = isSameSrc(next);
    if (!same) {
      try { if (!video.paused && !video.ended) video.pause(); } catch(_) {}
      if (player._hls) { try { player._hls.destroy(); } catch(_) {} player._hls = null; }
      isAttached = false; currentSrc = '';
      if (timeDurationEls.length) setText(timeDurationEls, '00:00');
      setActivated(false);
      setStatus('idle');

      attachMediaFor(next);
      autoStartOnReady = !!autoplay;
      pendingPlay = !!autoplay;
      return;
    }
    autoStartOnReady = !!autoplay;
    if (autoplay) {
      setStatus('loading');
      safePlay(video);
    } else {
      try { if (!video.paused && !video.ended) video.pause(); } catch(_) {}
      setActivated(false);
      setStatus('paused');
    }
  }

  // Open/Close API
  function openLightbox(src, placeholderUrl, type) {
    if (!src) return;

    forcedType = (type || '').toLowerCase();

    function activate() {
      ensureOpenUI(true);
      planOnOpen(src);
    }

    if (playerPlaceholderImg && placeholderUrl) {
      var needsSwap = playerPlaceholderImg.getAttribute('src') !== placeholderUrl;
      if (needsSwap || !playerPlaceholderImg.complete || !playerPlaceholderImg.naturalWidth) {
        playerPlaceholderImg.onload = function(){ playerPlaceholderImg.onload = null; activate(); };
        playerPlaceholderImg.onerror = function(){ playerPlaceholderImg.onerror = null; activate(); };
        if (needsSwap) playerPlaceholderImg.setAttribute('src', placeholderUrl);
        else playerPlaceholderImg.dispatchEvent(new Event('load'));
      } else {
        activate();
      }
    } else {
      activate();
    }
  }

  function togglePlay() {
    if (video.paused || video.ended) {
      pendingPlay = true;
      lastPauseBy = '';
      setStatus('loading');
      safePlay(video);
    } else {
      lastPauseBy = 'manual';
      video.pause();
    }
  }
  function toggleMute() { setMutedState(!video.muted); }

  player.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-player-control]');
    if (!btn || !player.contains(btn)) return;
    var type = btn.getAttribute('data-player-control');
    if (type === 'play' || type === 'pause' || type === 'playpause') togglePlay();
    else if (type === 'mute') toggleMute();
    else if (type === 'fullscreen') toggleFullscreen();
  });

  // Fullscreen helpers
  function isFsActive() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function enterFullscreen() {
    if (player.requestFullscreen) return player.requestFullscreen();
    if (video.requestFullscreen) return video.requestFullscreen();
    if (video.webkitSupportsFullscreen && typeof video.webkitEnterFullscreen === 'function') return video.webkitEnterFullscreen();
  }
  function exitFullscreen() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    if (video.webkitDisplayingFullscreen && typeof video.webkitExitFullscreen === 'function') return video.webkitExitFullscreen();
  }
  function toggleFullscreen() { if (isFsActive() || video.webkitDisplayingFullscreen) exitFullscreen(); else enterFullscreen(); }
  document.addEventListener('fullscreenchange', function() { setFsAttr(isFsActive()); });
  document.addEventListener('webkitfullscreenchange', function() { setFsAttr(isFsActive()); });
  video.addEventListener('webkitbeginfullscreen', function() { setFsAttr(true); });
  video.addEventListener('webkitendfullscreen', function() { setFsAttr(false); });

  // Time text (not in rAF)
  function updateTimeTexts() {
    if (timeDurationEls.length) setText(timeDurationEls, formatTime(video.duration));
    if (timeProgressEls.length) setText(timeProgressEls, formatTime(video.currentTime));
  }
  video.addEventListener('timeupdate', updateTimeTexts);
  video.addEventListener('loadedmetadata', function(){ updateTimeTexts(); updateBeforeRatioIOSSafe(); });
  video.addEventListener('loadeddata', function(){ updateBeforeRatioIOSSafe(); });
  video.addEventListener('playing', function(){ updateBeforeRatioIOSSafe(); });
  video.addEventListener('durationchange', updateTimeTexts);

  // rAF visuals (progress + handle only)
  function updateProgressVisuals() {
    if (!video.duration) return;
    var playedPct = (video.currentTime / video.duration) * 100;
    if (progressBar) progressBar.style.transform = 'translateX(' + (-100 + playedPct) + '%)';
    if (handle) handle.style.left = pctClamp(playedPct) + '%';
  }
  function pctClamp(p) { return p < 0 ? 0 : p > 100 ? 100 : p; }
  function loop() {
    updateProgressVisuals();
    if (!video.paused && !video.ended) rafId = requestAnimationFrame(loop);
  }

  // Buffered bar (not in rAF)
  function updateBufferedBar() {
    if (!bufferedBar || !video.duration || !video.buffered.length) return;
    var end = video.buffered.end(video.buffered.length - 1);
    var buffPct = (end / video.duration) * 100;
    bufferedBar.style.transform = 'translateX(' + (-100 + buffPct) + '%)';
  }
  video.addEventListener('progress', updateBufferedBar);
  video.addEventListener('loadedmetadata', updateBufferedBar);
  video.addEventListener('durationchange', updateBufferedBar);

  // Media event wiring
  video.addEventListener('play', function() { setActivated(true); cancelAnimationFrame(rafId); loop(); setStatus('playing'); });
  video.addEventListener('playing', function() { pendingPlay = false; setStatus('playing'); });
  video.addEventListener('pause', function() { pendingPlay = false; cancelAnimationFrame(rafId); updateProgressVisuals(); setStatus('paused'); });
  video.addEventListener('waiting', function() { setStatus('loading'); });
  video.addEventListener('canplay', function() { readyIfIdle(player, pendingPlay); });

  // Video ended
  video.addEventListener('ended', function () {
    pendingPlay = false;
    cancelAnimationFrame(rafId);
    updateProgressVisuals();
    setActivated(false);
    video.currentTime = 0;

    // Exit fullscreen if active
    if (document.fullscreenElement || document.webkitFullscreenElement || video.webkitDisplayingFullscreen) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (video.webkitExitFullscreen) video.webkitExitFullscreen();
    }

    closeLightbox();
  });

  // Scrubbing (pointer events)
  if (timeline) {
    var dragging = false, wasPlaying = false, targetTime = 0, lastSeekTs = 0, seekThrottle = 180, rect = null;
    window.addEventListener('resize', function() { if (!dragging) rect = null; });
    function getFractionFromX(x) {
      if (!rect) rect = timeline.getBoundingClientRect();
      var f = (x - rect.left) / rect.width; if (f < 0) f = 0; if (f > 1) f = 1; return f;
    }
    function previewAtFraction(f) {
      if (!video.duration) return;
      var pct = f * 100;
      if (progressBar) progressBar.style.transform = 'translateX(' + (-100 + pct) + '%)';
      if (handle) handle.style.left = pct + '%';
      if (timeProgressEls.length) setText(timeProgressEls, formatTime(f * video.duration));
    }
    function maybeSeek(now) {
      if (!video.duration) return;
      if ((now - lastSeekTs) < seekThrottle) return;
      lastSeekTs = now; video.currentTime = targetTime;
    }
    function onPointerDown(e) {
      if (!video.duration) return;
      dragging = true; wasPlaying = !video.paused && !video.ended; if (wasPlaying) video.pause();
      player.setAttribute('data-timeline-drag', 'true'); rect = timeline.getBoundingClientRect();
      var f = getFractionFromX(e.clientX); targetTime = f * video.duration; previewAtFraction(f); maybeSeek(performance.now());
      timeline.setPointerCapture && timeline.setPointerCapture(e.pointerId);
      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      e.preventDefault();
    }
    function onPointerMove(e) {
      if (!dragging) return;
      var f = getFractionFromX(e.clientX); targetTime = f * video.duration; previewAtFraction(f); maybeSeek(performance.now()); e.preventDefault();
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false; player.setAttribute('data-timeline-drag', 'false'); rect = null; video.currentTime = targetTime;
      if (wasPlaying) safePlay(video); else { updateProgressVisuals(); updateTimeTexts(); }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }
    timeline.addEventListener('pointerdown', onPointerDown, { passive: false });
    if (handle) handle.addEventListener('pointerdown', onPointerDown, { passive: false });
  }

  // Hover/idle detection (pointer-based)
  var hoverTimer;
  var hoverHideDelay = 3000;
  function setHover(state) {
    if (player.getAttribute('data-player-hover') !== state) {
      player.setAttribute('data-player-hover', state);
    }
  }
  function scheduleHide() { clearTimeout(hoverTimer); hoverTimer = setTimeout(function() { setHover('idle'); }, hoverHideDelay); }
  function wakeControls() { setHover('active'); scheduleHide(); }
  player.addEventListener('pointerdown', wakeControls);
  document.addEventListener('fullscreenchange', wakeControls);
  document.addEventListener('webkitfullscreenchange', wakeControls);
  var trackingMove = false;
  function onPointerMoveGlobal(e) {
    var r = player.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) wakeControls();
  }
  player.addEventListener('pointerenter', function() {
    wakeControls();
    if (!trackingMove) { trackingMove = true; window.addEventListener('pointermove', onPointerMoveGlobal, { passive: true }); }
  });
  player.addEventListener('pointerleave', function() {
    setHover('idle'); clearTimeout(hoverTimer);
    if (trackingMove) { trackingMove = false; window.removeEventListener('pointermove', onPointerMoveGlobal); }
  });

  // Close Function
  function closeLightbox() {
    ensureOpenUI(false);

    var hasPlayed = false;
    try {
      if (video.played && video.played.length) {
        for (var i = 0; i < video.played.length; i++) {
          if (video.played.end(i) > 0) { hasPlayed = true; break; }
        }
      } else {
        hasPlayed = video.currentTime > 0;
      }
    } catch (_) {}

    try { if (!video.paused && !video.ended) video.pause(); } catch (_) {}

    setActivated(false);
    setStatus(hasPlayed ? 'paused' : 'idle');
  }

  // Global open/close controls + ESC
  document.addEventListener('click', function(e) {
    var openBtn = e.target.closest('[data-bunny-lightbox-control="open"]');
    if (openBtn) {
      var src = openBtn.getAttribute('data-bunny-lightbox-src') || '';
      if (!src) return;
      var type = openBtn.getAttribute('data-bunny-lightbox-type') || '';
      var imgEl = openBtn.querySelector('[data-bunny-lightbox-placeholder]');
      var placeholderUrl = imgEl ? imgEl.getAttribute('src') : '';
      openLightbox(src, placeholderUrl, type);
      return;
    }
    var closeBtn = e.target.closest('[data-bunny-lightbox-control="close"]');
    if (closeBtn) {
      var closeInWrapper = closeBtn.closest('[data-bunny-lightbox-status]');
      if (closeInWrapper === wrapper) closeLightbox();
      return;
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLightbox();
  });

  // Helper: time/text/meta/ratio utilities
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return '00:00';
    var s = Math.floor(sec), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return h > 0 ? (h + ':' + pad2(m) + ':' + pad2(r)) : (pad2(m) + ':' + pad2(r));
  }
  function setText(nodes, text) { nodes.forEach(function(n){ n.textContent = text; }); }

  // Helper: Choose best HLS level by resolution --- */
  function bestLevel(levels) {
    if (!levels || !levels.length) return null;
    return levels.reduce(function(a, b) { return ((b.width||0) > (a.width||0)) ? b : a; }, levels[0]);
  }

  // Helper: Safe programmatic play
  function safePlay(video) {
    var p = video.play();
    if (p && typeof p.then === 'function') p.catch(function(){});
  }

  // Helper: Ready status guard
  function readyIfIdle(player, pendingPlay) {
    if (!pendingPlay &&
        player.getAttribute('data-player-activated') !== 'true' &&
        player.getAttribute('data-player-status') === 'idle') {
      player.setAttribute('data-player-status', 'ready');
    }
  }

  // Helper: Ratio Setter
  function setBeforeRatio(player, updateSize, w, h) {
    if (updateSize !== 'true' || !w || !h) return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;
    before.style.paddingTop = (h / w * 100) + '%';
  }
  function maybeSetRatioFromVideo(player, updateSize, video) {
    if (updateSize !== 'true') return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;
    var hasPad = before.style.paddingTop && before.style.paddingTop !== '0%';
    if (!hasPad && video.videoWidth && video.videoHeight) {
      setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
    }
  }

  // Helper: robust ratio setter for iOS Safari (with HLS fallback)
  function updateBeforeRatioIOSSafe() {
    if (updateSize !== 'true') return;
    var before = player.querySelector('[data-player-before]');
    if (!before) return;

    function apply(w, h) {
      if (!w || !h) return;
      before.style.paddingTop = (h / w * 100) + '%';
      if (typeof player._applyClamp === 'function') player._applyClamp();
    }

    if (video.videoWidth && video.videoHeight) { apply(video.videoWidth, video.videoHeight); return; }

    if (player._hls && player._hls.levels && player._hls.levels.length) {
      var lvls = player._hls.levels;
      var best = lvls.reduce(function(a, b) { return ((b.width||0) > (a.width||0)) ? b : a; }, lvls[0]);
      if (best && best.width && best.height) { apply(best.width, best.height); return; }
    }

    requestAnimationFrame(function () {
      if (video.videoWidth && video.videoHeight) { apply(video.videoWidth, video.videoHeight); return; }

      var master = (typeof currentSrc === 'string' && currentSrc) ? currentSrc : '';
      if (!master || master.indexOf('blob:') === 0) {
        var attrSrc = player.getAttribute('data-bunny-lightbox-src') || player.getAttribute('data-player-src') || '';
        if (attrSrc && attrSrc.indexOf('blob:') !== 0) master = attrSrc;
      }
      if (!master || !/^https?:/i.test(master)) return;

      // Manifest parsing only makes sense for HLS. Progressive files report
      // their dimensions on loadedmetadata, so there is nothing to fetch.
      if (!isHlsSrc(master)) return;

      fetch(master, { credentials: 'omit', cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error(); return r.text(); })
        .then(function (txt) {
          var lines = txt.split(/\r?\n/);
          var bestW = 0, bestH = 0, last = null;
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.indexOf('#EXT-X-STREAM-INF:') === 0) {
              last = line;
            } else if (last && line && line[0] !== '#') {
              var m = /RESOLUTION=(\d+)x(\d+)/.exec(last);
              if (m) {
                var W = parseInt(m[1], 10), H = parseInt(m[2], 10);
                if (W > bestW) { bestW = W; bestH = H; }
              }
              last = null;
            }
          }
          if (bestW && bestH) apply(bestW, bestH);
        })
        .catch(function () {});
    });
  }
}

// Initialize Bunny HTML HLS Lightbox
document.addEventListener('DOMContentLoaded', function() {
  initBunnyLightboxPlayer();
});

// <!--  BALL FADEIN OUT -->

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
