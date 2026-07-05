document.addEventListener("DOMContentLoaded", function () {
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var siteHeader = document.querySelector(".site-header");
    var navToggle = document.querySelector(".nav-toggle");
    var navMenu = document.querySelector(".nav-menu");
    var navLinks = document.querySelectorAll(".nav-links a");
    var bookingForm = document.getElementById("booking-form");
    var formMessage = document.getElementById("form-message");
    var dateInput = document.getElementById("reservation-date");
    var filterButtons = document.querySelectorAll(".filter-button");
    var menuCards = document.querySelectorAll(".menu-card");
    var sections = document.querySelectorAll("main section[id]");
    var revealItems = document.querySelectorAll(".reveal");
    var faqItems = document.querySelectorAll("[data-accordion-item]");
    var galleryButtons = document.querySelectorAll("[data-lightbox-image]");
    var lightbox = document.getElementById("gallery-lightbox");
    var lightboxDialog = lightbox ? lightbox.querySelector(".lightbox__dialog") : null;
    var lightboxImage = document.getElementById("lightbox-image");
    var lightboxTitle = document.getElementById("lightbox-title");
    var lightboxCloseButtons = document.querySelectorAll("[data-lightbox-close]");
    var testimonialTrack = document.getElementById("testimonial-track");
    var testimonialCards = testimonialTrack ? testimonialTrack.querySelectorAll(".testimonial-card") : [];
    var testimonialPrev = document.getElementById("testimonial-prev");
    var testimonialNext = document.getElementById("testimonial-next");
    var testimonialDots = document.querySelectorAll(".slider-dot");
    var testimonialStatus = document.getElementById("testimonial-status");
    var activeSlideIndex = 0;
    var testimonialIntervalId = null;
    var focusBeforeLightbox = null;

    if (navMenu && window.innerWidth < 1024) {
        navMenu.hidden = true;
    }

    function setMinReservationDate() {
        if (!dateInput) {
            return;
        }

        var today = new Date();
        var offsetDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
        dateInput.min = offsetDate.toISOString().split("T")[0];
    }

    function toggleMenu() {
        if (!navToggle || !navMenu) {
            return;
        }

        var isExpanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!isExpanded));
        navToggle.setAttribute("aria-label", isExpanded ? "Open primary menu" : "Close primary menu");
        navMenu.classList.toggle("is-open");
        navMenu.hidden = isExpanded;
        document.body.classList.toggle("is-menu-open", !isExpanded);
    }

    function closeMenu() {
        if (!navToggle || !navMenu) {
            return;
        }

        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open primary menu");
        navMenu.classList.remove("is-open");
        if (window.innerWidth < 1024) {
            navMenu.hidden = true;
        }
        document.body.classList.remove("is-menu-open");
    }

    function validateField(field) {
        var isValid = field.checkValidity();
        field.setAttribute("aria-invalid", String(!isValid));
        return isValid;
    }

    function updateActiveNav() {
        var scrollPosition = window.scrollY + 140;
        var currentId = "";

        if (siteHeader) {
            siteHeader.classList.toggle("is-scrolled", window.scrollY > 18);
        }

        sections.forEach(function (section) {
            if (section.offsetTop <= scrollPosition) {
                currentId = section.id;
            }
        });

        navLinks.forEach(function (link) {
            var isCurrent = link.getAttribute("href") === "#" + currentId;
            link.classList.toggle("is-current", isCurrent);
            if (isCurrent) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function filterMenu(category) {
        menuCards.forEach(function (card) {
            var shouldShow = category === "all" || card.getAttribute("data-category") === category;
            card.classList.toggle("is-hidden", !shouldShow);
        });
    }

    function openLightbox(imageSrc, title, trigger) {
        if (!lightbox || !lightboxDialog || !lightboxImage || !lightboxTitle) {
            return;
        }

        focusBeforeLightbox = trigger || document.activeElement;
        lightboxImage.src = imageSrc;
        lightboxImage.alt = title;
        lightboxTitle.textContent = title;
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-lightbox-open");
        lightboxDialog.focus();
    }

    function closeLightbox() {
        if (!lightbox || !lightboxImage || !lightboxTitle) {
            return;
        }

        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImage.src = "";
        lightboxImage.alt = "";
        lightboxTitle.textContent = "";
        document.body.classList.remove("is-lightbox-open");

        if (focusBeforeLightbox && typeof focusBeforeLightbox.focus === "function") {
            focusBeforeLightbox.focus();
        }
    }

    function updateTestimonialSlider(index) {
        if (!testimonialTrack || !testimonialCards.length) {
            return;
        }

        var visibleSlides = window.innerWidth >= 1024 ? 3 : 1;
        var maxIndex = visibleSlides === 3 ? 0 : testimonialCards.length - 1;
        activeSlideIndex = Math.max(0, Math.min(index, maxIndex));

        testimonialTrack.style.transform = "translateX(-" + activeSlideIndex * 100 + "%)";

        testimonialCards.forEach(function (card, cardIndex) {
            card.classList.toggle("is-active", cardIndex === activeSlideIndex);
        });

        testimonialDots.forEach(function (dot, dotIndex) {
            var isActive = dotIndex === activeSlideIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-pressed", String(isActive));
        });

        if (testimonialStatus) {
            testimonialStatus.textContent = "Showing testimonial " + (activeSlideIndex + 1) + " of " + testimonialCards.length + ".";
        }
    }

    function startTestimonialAutoplay() {
        window.clearInterval(testimonialIntervalId);

        if (!testimonialCards.length || window.innerWidth >= 1024 || prefersReducedMotion) {
            return;
        }

        testimonialIntervalId = window.setInterval(function () {
            var nextIndex = activeSlideIndex + 1 >= testimonialCards.length ? 0 : activeSlideIndex + 1;
            updateTestimonialSlider(nextIndex);
        }, 4800);
    }

    function handleRevealAnimations() {
        if (prefersReducedMotion || !("IntersectionObserver" in window) || !revealItems.length) {
            revealItems.forEach(function (item) {
                item.classList.add("is-visible");
            });
            return;
        }

        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.16,
            rootMargin: "0px 0px -40px 0px"
        });

        revealItems.forEach(function (item) {
            revealObserver.observe(item);
        });
    }

    if (navToggle) {
        navToggle.addEventListener("click", toggleMenu);
    }

    navLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            var targetId = link.getAttribute("href");
            var targetElement = targetId ? document.querySelector(targetId) : null;

            closeMenu();

            if (targetElement) {
                event.preventDefault();
                targetElement.scrollIntoView({
                    behavior: prefersReducedMotion ? "auto" : "smooth",
                    block: "start"
                });
            }
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMenu();
            closeLightbox();
        }

        if (event.key === "Tab" && lightbox && lightbox.classList.contains("is-open") && lightboxDialog) {
            var focusableElements = lightboxDialog.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
            var firstFocusable = focusableElements[0];
            var lastFocusable = focusableElements[focusableElements.length - 1];

            if (!firstFocusable || !lastFocusable) {
                return;
            }

            if (event.shiftKey && document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus();
            } else if (!event.shiftKey && document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus();
            }
        }
    });

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var category = button.getAttribute("data-filter");

            filterButtons.forEach(function (item) {
                item.classList.remove("is-active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("is-active");
            button.setAttribute("aria-pressed", "true");
            filterMenu(category);
        });
    });

    faqItems.forEach(function (item) {
        item.addEventListener("toggle", function () {
            if (!item.open) {
                return;
            }

            faqItems.forEach(function (otherItem) {
                if (otherItem !== item) {
                    otherItem.open = false;
                }
            });
        });
    });

    galleryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            openLightbox(button.getAttribute("data-lightbox-image"), button.getAttribute("data-lightbox-title") || "Gallery image", button);
        });
    });

    lightboxCloseButtons.forEach(function (button) {
        button.addEventListener("click", closeLightbox);
    });

    if (lightbox) {
        lightbox.addEventListener("click", function (event) {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }

    if (testimonialPrev) {
        testimonialPrev.addEventListener("click", function () {
            var nextIndex = activeSlideIndex === 0 ? testimonialCards.length - 1 : activeSlideIndex - 1;
            updateTestimonialSlider(nextIndex);
            startTestimonialAutoplay();
        });
    }

    if (testimonialNext) {
        testimonialNext.addEventListener("click", function () {
            var nextIndex = activeSlideIndex + 1 >= testimonialCards.length ? 0 : activeSlideIndex + 1;
            updateTestimonialSlider(nextIndex);
            startTestimonialAutoplay();
        });
    }

    testimonialDots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            updateTestimonialSlider(Number(dot.getAttribute("data-slide-target")));
            startTestimonialAutoplay();
        });
    });

    window.addEventListener("resize", function () {
        if (navMenu) {
            if (window.innerWidth >= 1024) {
                navMenu.hidden = false;
            } else if (!navMenu.classList.contains("is-open")) {
                navMenu.hidden = true;
            }
        }

        updateTestimonialSlider(activeSlideIndex);
        startTestimonialAutoplay();
    });

    window.addEventListener("scroll", updateActiveNav, { passive: true });
    updateActiveNav();
    handleRevealAnimations();
    updateTestimonialSlider(0);
    startTestimonialAutoplay();
    setMinReservationDate();

    if (bookingForm && formMessage) {
        var fields = bookingForm.querySelectorAll("input, select, textarea");

        fields.forEach(function (field) {
            field.addEventListener("blur", function () {
                validateField(field);
            });
        });

        bookingForm.addEventListener("submit", function (event) {
            event.preventDefault();

            var allValid = true;

            fields.forEach(function (field) {
                if (!validateField(field)) {
                    allValid = false;
                }
            });

            if (!allValid) {
                formMessage.classList.add("is-error");
                formMessage.textContent = "Please review the highlighted fields before submitting your reservation request.";
                return;
            }

            var guestName = bookingForm.elements.guestName.value.trim();
            var reservationDate = bookingForm.elements.reservationDate.value;
            var reservationTime = bookingForm.elements.reservationTime.value;

            formMessage.classList.remove("is-error");
            formMessage.textContent = "Thanks, " + guestName + ". Your request for " + reservationDate + " at " + reservationTime + " has been received.";
            bookingForm.reset();
            setMinReservationDate();

            fields.forEach(function (field) {
                field.removeAttribute("aria-invalid");
            });
        });
    }
});
