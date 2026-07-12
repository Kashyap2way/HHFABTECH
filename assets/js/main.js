// Hero Swiper

const heroSwiper = new Swiper(".heroSwiper", {

    loop: true,

    autoplay: {

        delay: 3500,

        disableOnInteraction: false,

    },

    speed: 900,

    effect: "fade",

    pagination: {

        el: ".swiper-pagination",

        clickable: true,

    },

});