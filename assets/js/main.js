// ===============================
// Mobile Menu
// ===============================

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", () => {

        const open = navLinks.classList.toggle("active");

        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");

        menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    });

}


// ===============================
// Hero Slider
// ===============================

const slides = document.querySelectorAll(".slide");

if (slides.length > 0) {

    let currentSlide = 0;

    function showSlide(index) {

        slides.forEach(slide => {

            slide.classList.remove("active");

        });

        slides[index].classList.add("active");

    }

    showSlide(0);

    setInterval(() => {

        slides[currentSlide].classList.remove("active");

        currentSlide++;

        if (currentSlide >= slides.length) {

            currentSlide = 0;

        }

        slides[currentSlide].classList.add("active");

    }, 5000);

}
// ===============================
// Header shadow on scroll + close mobile menu on link tap
// ===============================

const header = document.querySelector("header");

if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
}

if (menuBtn && navLinks) {
    navLinks.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
            navLinks.classList.remove("active");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.setAttribute("aria-label", "Open menu");
        }
    });
}
