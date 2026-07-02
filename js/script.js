document.addEventListener("DOMContentLoaded", () => {
  const formatNumber = (number) => String(number).padStart(2, "0");
  const menuToggle = document.querySelector(".menu-toggle");
  const globalNav = document.querySelector(".global-nav");
  const hero = document.querySelector(".hero");
  const heroImage = document.querySelector(".hero__image");
  const footer = document.querySelector(".site-footer");

  if (footer && "IntersectionObserver" in window) {
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          document.body.classList.toggle("is-cta-near-footer", entry.isIntersecting);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.02,
      }
    );

    ctaObserver.observe(footer);
  }

  if (hero && heroImage) {
    const pcHeroImages = [
      "images/mv/mv.png",
      "images/mv/mv2.png",
      "images/mv/mv3.png",
    ];
    const spHeroImages = [
      "images/mv/mv-sp.png",
      "images/mv/mv2.png",
      "images/mv/mv3.png",
    ];
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    let heroImages = mediaQuery.matches ? spHeroImages : pcHeroImages;
    let currentHeroIndex = 0;
    let activeHeroLayer = 0;
    let heroTimerId = null;

    hero.classList.add("is-slider-ready");
    heroImage.classList.add("hero__image--fade", "is-active");
    heroImage.src = heroImages[0];

    const secondHeroImage = heroImage.cloneNode(true);
    secondHeroImage.classList.remove("is-active");
    secondHeroImage.setAttribute("aria-hidden", "true");
    hero.insertBefore(secondHeroImage, hero.firstChild);

    const heroLayers = [heroImage, secondHeroImage];

    const showHeroImage = (nextIndex) => {
      const nextLayer = activeHeroLayer === 0 ? 1 : 0;
      heroLayers[nextLayer].src = heroImages[nextIndex];
      heroLayers[nextLayer].classList.add("is-active");
      heroLayers[activeHeroLayer].classList.remove("is-active");
      activeHeroLayer = nextLayer;
      currentHeroIndex = nextIndex;
    };

    const startHeroSlider = () => {
      window.clearInterval(heroTimerId);
      heroTimerId = window.setInterval(() => {
        showHeroImage((currentHeroIndex + 1) % heroImages.length);
      }, 5000);
    };

    const resetHeroImages = () => {
      heroImages = mediaQuery.matches ? spHeroImages : pcHeroImages;
      currentHeroIndex = 0;
      activeHeroLayer = 0;
      heroLayers[0].src = heroImages[0];
      heroLayers[1].src = heroImages[1] || heroImages[0];
      heroLayers[0].classList.add("is-active");
      heroLayers[1].classList.remove("is-active");
      startHeroSlider();
    };

    mediaQuery.addEventListener("change", resetHeroImages);
    startHeroSlider();
  }

  const concept = document.querySelector(".concept");

  if (concept) {
    const revealTargets = [
      concept.querySelector(".section-title"),
      concept.querySelector(".concept__subtitle"),
      ...concept.querySelectorAll(".concept__text p"),
      concept.querySelector(".concept__image--forest"),
      concept.querySelector(".concept__image--stars"),
    ].filter(Boolean);

    revealTargets.forEach((target, index) => {
      target.classList.add("js-concept-reveal");
      target.style.setProperty("--reveal-delay", `${index * 0.12}s`);
    });

    const showConcept = () => {
      concept.classList.add("is-visible");
    };

    if ("IntersectionObserver" in window) {
      const conceptObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              showConcept();
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.18,
        }
      );

      conceptObserver.observe(concept);
    } else {
      showConcept();
    }
  }

  const setupRevealSection = (sectionSelector, itemSelector, revealClass, delayProperty) => {
    const section = document.querySelector(sectionSelector);

    if (!section) {
      return;
    }

    const items = section.querySelectorAll(itemSelector);

    items.forEach((item, index) => {
      item.classList.add(revealClass);
      item.style.setProperty(delayProperty, `${index * 0.15}s`);
    });

    const showSection = () => {
      section.classList.add("is-visible");
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, currentObserver) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              showSection();
              currentObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.18,
        }
      );

      observer.observe(section);
    } else {
      showSection();
    }
  };

  setupRevealSection(".room", ".room-card", "js-room-reveal", "--room-reveal-delay");
  setupRevealSection(".dining", ".dining-card, .dining__content", "js-dining-reveal", "--dining-reveal-delay");
  setupRevealSection(".experience", ".experience-card", "js-experience-reveal", "--experience-reveal-delay");

  const room = document.querySelector(".room");

  if (room) {
    const slider = room.querySelector(".room-slider");
    const track = room.querySelector(".room-track");
    const pagination = room.querySelector("[data-room-pagination]");
    const current = pagination?.querySelector("[data-pagination-current]");
    const prevButton = pagination?.querySelector("[data-pagination-prev]");
    const nextButton = pagination?.querySelector("[data-pagination-next]");
    const dotsContainer = pagination?.querySelector("[data-room-dots]");
    const originalCards = track ? Array.from(track.querySelectorAll(".room-card")) : [];

    if (slider && track && pagination && dotsContainer && originalCards.length > 0) {
      const total = originalCards.length;
      let currentIndex = 0;
      let autoplayId = null;

      originalCards.forEach((card, index) => {
        card.dataset.roomSlide = String(index);
      });

      originalCards.forEach((card, index) => {
        const clone = card.cloneNode(true);
        clone.dataset.roomSlide = String(index);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });

      const allCards = Array.from(track.querySelectorAll(".room-card"));
      const dots = originalCards.map((_, index) => {
        const dot = document.createElement("button");
        dot.className = "section-pagination__dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `ROOM ${index + 1}`);
        dot.addEventListener("click", () => {
          goTo(index);
          startAutoplay();
        });
        dotsContainer.appendChild(dot);
        return dot;
      });

      const getStep = () => {
        const cardWidth = originalCards[0].getBoundingClientRect().width;
        const styles = getComputedStyle(track);
        const gap = parseFloat(styles.columnGap || styles.gap) || 0;
        return cardWidth + gap;
      };

      const setPosition = (withAnimation = true) => {
        track.style.transition = withAnimation ? "transform 0.7s ease" : "none";
        track.style.transform = `translateX(${-getStep() * currentIndex}px)`;
      };

      const updateState = () => {
        const activeIndex = currentIndex % total;

        if (current) {
          current.textContent = formatNumber(activeIndex + 1);
        }

        allCards.forEach((card) => {
          card.classList.toggle("is-active", Number(card.dataset.roomSlide) === activeIndex);
        });

        dots.forEach((dot, index) => {
          dot.classList.toggle("is-active", index === activeIndex);
          dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
        });
      };

      const goTo = (index) => {
        currentIndex = index;
        setPosition();
        updateState();
      };

      const goNext = () => {
        currentIndex += 1;
        setPosition();
        updateState();
      };

      const goPrev = () => {
        if (currentIndex === 0) {
          currentIndex = total;
          setPosition(false);
          track.offsetHeight;
        }

        currentIndex -= 1;
        setPosition();
        updateState();
      };

      const stopAutoplay = () => {
        if (autoplayId !== null) {
          window.clearInterval(autoplayId);
          autoplayId = null;
        }
      };

      const startAutoplay = () => {
        stopAutoplay();
        autoplayId = window.setInterval(goNext, 4500);
      };

      track.addEventListener("transitionend", () => {
        if (currentIndex >= total) {
          currentIndex = 0;
          setPosition(false);
          updateState();
        }
      });

      window.addEventListener("resize", () => {
        setPosition(false);
      });

      nextButton?.addEventListener("click", () => {
        goNext();
        startAutoplay();
      });

      prevButton?.addEventListener("click", () => {
        goPrev();
        startAutoplay();
      });

      room.addEventListener("mouseenter", stopAutoplay);
      room.addEventListener("mouseleave", startAutoplay);
      room.addEventListener("focusin", stopAutoplay);
      room.addEventListener("focusout", startAutoplay);

      setPosition(false);
      updateState();
      startAutoplay();
    }
  }

  const dining = document.querySelector(".dining");

  if (dining) {
    const slider = dining.querySelector(".dining-slider");
    const track = dining.querySelector(".dining-track");
    const pagination = dining.querySelector("[data-dining-pagination]");
    const current = pagination?.querySelector("[data-pagination-current]");
    const prevButton = pagination?.querySelector("[data-pagination-prev]");
    const nextButton = pagination?.querySelector("[data-pagination-next]");
    const dotsContainer = pagination?.querySelector("[data-dining-dots]");
    const originalCards = track ? Array.from(track.querySelectorAll(".dining-card")) : [];

    if (slider && track && pagination && dotsContainer && originalCards.length > 0) {
      const total = originalCards.length;
      let currentIndex = 0;
      let autoplayId = null;

      originalCards.forEach((card, index) => {
        card.dataset.diningSlide = String(index);
      });

      originalCards.forEach((card, index) => {
        const clone = card.cloneNode(true);
        clone.dataset.diningSlide = String(index);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });

      const allCards = Array.from(track.querySelectorAll(".dining-card"));
      const dots = originalCards.map((_, index) => {
        const dot = document.createElement("button");
        dot.className = "section-pagination__dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `DINING ${index + 1}`);
        dot.addEventListener("click", () => {
          goTo(index);
          startAutoplay();
        });
        dotsContainer.appendChild(dot);
        return dot;
      });

      const getStep = () => {
        const cardWidth = originalCards[0].getBoundingClientRect().width;
        const styles = getComputedStyle(track);
        const gap = parseFloat(styles.columnGap || styles.gap) || 0;
        return cardWidth + gap;
      };

      const setPosition = (withAnimation = true) => {
        track.style.transition = withAnimation ? "transform 0.7s ease" : "none";
        track.style.transform = `translateX(${-getStep() * currentIndex}px)`;
      };

      const updateState = () => {
        const activeIndex = currentIndex % total;

        if (current) {
          current.textContent = formatNumber(activeIndex + 1);
        }

        allCards.forEach((card) => {
          card.classList.toggle("is-active", Number(card.dataset.diningSlide) === activeIndex);
        });

        dots.forEach((dot, index) => {
          dot.classList.toggle("is-active", index === activeIndex);
          dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
        });
      };

      const goTo = (index) => {
        currentIndex = index;
        setPosition();
        updateState();
      };

      const goNext = () => {
        currentIndex += 1;
        setPosition();
        updateState();
      };

      const goPrev = () => {
        if (currentIndex === 0) {
          currentIndex = total;
          setPosition(false);
          track.offsetHeight;
        }

        currentIndex -= 1;
        setPosition();
        updateState();
      };

      const stopAutoplay = () => {
        if (autoplayId !== null) {
          window.clearInterval(autoplayId);
          autoplayId = null;
        }
      };

      const startAutoplay = () => {
        stopAutoplay();
        autoplayId = window.setInterval(goNext, 4000);
      };

      track.addEventListener("transitionend", () => {
        if (currentIndex >= total) {
          currentIndex = 0;
          setPosition(false);
          updateState();
        }
      });

      window.addEventListener("resize", () => {
        setPosition(false);
      });

      nextButton?.addEventListener("click", () => {
        goNext();
        startAutoplay();
      });

      prevButton?.addEventListener("click", () => {
        goPrev();
        startAutoplay();
      });

      dining.addEventListener("mouseenter", stopAutoplay);
      dining.addEventListener("mouseleave", startAutoplay);
      dining.addEventListener("focusin", stopAutoplay);
      dining.addEventListener("focusout", startAutoplay);

      setPosition(false);
      updateState();
      startAutoplay();
    }
  }

  document.querySelectorAll(".faq").forEach((faq) => {
    const closeAllFaqCards = () => {
      faq.querySelectorAll(".faq-card").forEach((card) => {
        card.classList.remove("is-open");
        card.querySelector(".faq-card__question")?.setAttribute("aria-expanded", "false");

        const icon = card.querySelector(".faq-card__arrow");
        if (icon) {
          icon.textContent = "+";
        }
      });
    };

    faq.querySelectorAll(".faq-card").forEach((card) => {
      const question = card.querySelector(".faq-card__question");
      const icon = card.querySelector(".faq-card__arrow");

      if (!question) {
        return;
      }

      question.setAttribute("role", "button");
      question.setAttribute("tabindex", "0");
      question.setAttribute("aria-expanded", "false");

      if (icon) {
        icon.textContent = "+";
      }
    });

    const toggleFaqCard = (card) => {
      const isOpen = card.classList.contains("is-open");
      closeAllFaqCards();

      if (!isOpen) {
        card.classList.add("is-open");
        card.querySelector(".faq-card__question")?.setAttribute("aria-expanded", "true");

        const icon = card.querySelector(".faq-card__arrow");
        if (icon) {
          icon.textContent = "−";
        }
      }
    };

    faq.addEventListener("click", (event) => {
      const question = event.target.closest(".faq-card__question");

      if (!question || !faq.contains(question)) {
        return;
      }

      const card = question.closest(".faq-card");
      if (card) {
        toggleFaqCard(card);
      }
    });

    faq.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      const question = event.target.closest(".faq-card__question");
      if (!question || !faq.contains(question)) {
        return;
      }

      event.preventDefault();
      const card = question.closest(".faq-card");
      if (card) {
        toggleFaqCard(card);
      }
    });
  });

  if (menuToggle && globalNav) {
    const closeMenu = () => {
      document.body.classList.remove("is-menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    };

    const openMenu = () => {
      document.body.classList.add("is-menu-open");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close menu");
    };

    menuToggle.addEventListener("click", () => {
      if (document.body.classList.contains("is-menu-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    globalNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  document.querySelectorAll("[data-slider-pagination]").forEach((pagination) => {
    const section = pagination.closest("section");
    const current = pagination.querySelector("[data-pagination-current]");
    const prevButton = pagination.querySelector("[data-pagination-prev]");
    const nextButton = pagination.querySelector("[data-pagination-next]");
    const cards = section ? Array.from(section.querySelectorAll(".room-card, .dining-card")) : [];
    const total = Number(pagination.dataset.total) || cards.length || 1;
    let currentIndex = 0;

    const updatePagination = () => {
      if (current) {
        current.textContent = formatNumber(currentIndex + 1);
      }

      cards.forEach((card, index) => {
        card.classList.toggle("is-active", index === currentIndex % cards.length);
      });
    };

    prevButton?.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + total) % total;
      updatePagination();
    });

    nextButton?.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % total;
      updatePagination();
    });

    updatePagination();
  });

  document.querySelectorAll("[data-faq-slider]").forEach((slider) => {
    const section = slider.closest(".faq");
    const track = slider.querySelector(".faq-track");
    const pagination = section?.querySelector("[data-faq-pagination]");
    const prevButton = pagination?.querySelector("[data-faq-prev]");
    const nextButton = pagination?.querySelector("[data-faq-next]");
    const dotsContainer = pagination?.querySelector("[data-faq-dots]");
    const originalCards = track ? Array.from(track.querySelectorAll(".faq-card")) : [];

    if (!track || !pagination || !dotsContainer || originalCards.length === 0) {
      return;
    }

    const total = originalCards.length;
    let currentIndex = 0;
    let autoplayId = null;
    let isPaused = false;

    originalCards.forEach((card, index) => {
      card.dataset.faqSlide = String(index);
    });

    originalCards.forEach((card, index) => {
      const clone = card.cloneNode(true);
      clone.dataset.faqSlide = String(index);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    const allCards = Array.from(track.querySelectorAll(".faq-card"));
    const dots = originalCards.map((_, index) => {
      const dot = document.createElement("button");
      dot.className = "faq-pagination__dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `FAQ ${index + 1}`);
      dot.addEventListener("click", () => {
        goTo(index);
      });
      dotsContainer.appendChild(dot);
      return dot;
    });

    const getStep = () => {
      const cardWidth = originalCards[0].getBoundingClientRect().width;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return cardWidth + gap;
    };

    const setPosition = (withAnimation = true) => {
      track.style.transition = withAnimation ? "transform 0.65s ease" : "none";
      track.style.transform = `translateX(${-getStep() * currentIndex}px)`;
    };

    const updateState = () => {
      const activeIndex = currentIndex % total;

      allCards.forEach((card) => {
        card.classList.toggle("faq-card--active", Number(card.dataset.faqSlide) === activeIndex);
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeIndex);
        dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
      });
    };

    const goTo = (index) => {
      currentIndex = index;
      setPosition();
      updateState();
    };

    const goNext = () => {
      currentIndex += 1;
      setPosition();
      updateState();
    };

    const goPrev = () => {
      if (currentIndex === 0) {
        currentIndex = total;
        setPosition(false);
        track.offsetHeight;
      }

      currentIndex -= 1;
      setPosition();
      updateState();
    };

    const startAutoplay = () => {
      stopAutoplay();
      autoplayId = window.setInterval(goNext, 3000);
    };

    const stopAutoplay = () => {
      if (autoplayId !== null) {
        window.clearInterval(autoplayId);
        autoplayId = null;
      }
    };

    track.addEventListener("transitionend", () => {
      if (currentIndex >= total) {
        currentIndex = 0;
        setPosition(false);
        updateState();
      }
    });

    window.addEventListener("resize", () => {
      setPosition(false);
    });

    nextButton?.addEventListener("click", goNext);
    prevButton?.addEventListener("click", goPrev);

    section?.addEventListener("mouseenter", () => {
      isPaused = true;
      stopAutoplay();
    });

    section?.addEventListener("mouseleave", () => {
      isPaused = false;
      startAutoplay();
    });

    section?.addEventListener("focusin", () => {
      isPaused = true;
      stopAutoplay();
    });

    section?.addEventListener("focusout", () => {
      isPaused = false;
      startAutoplay();
    });

    setPosition(false);
    updateState();

    if (!isPaused) {
      startAutoplay();
    }
  });
});
