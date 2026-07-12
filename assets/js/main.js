// ===============================
// Mobile Menu
// ===============================

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

menuBtn.addEventListener("click", () => {

    navLinks.classList.toggle("active");

});

// ===============================
// Hero Slider
// ===============================

let slides = document.querySelectorAll(".slide");

let currentSlide = 0;

function showSlide(index){

    slides.forEach((slide)=>{

        slide.classList.remove("active");

    });

    slides[index].classList.add("active");

}

setInterval(()=>{

    slides[currentSlide].classList.remove("active");

    currentSlide++;

    if(currentSlide>=slides.length){

        currentSlide=0;

    }

    slides[currentSlide].classList.add("active");

},5000);

// ===============================
// Sticky Navbar Shadow
// ===============================

window.addEventListener("scroll",()=>{

    const header=document.querySelector("header");

    if(window.scrollY>30){

        header.style.boxShadow="0 10px 25px rgba(0,0,0,.12)";

    }

    else{

        header.style.boxShadow="0 5px 15px rgba(0,0,0,.08)";

    }

});