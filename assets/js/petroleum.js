/*==================================================
HH FABTECH - PETROLEUM PAGE
==================================================*/

/*==================================================
PETROLEUM COMPANY IMAGE SWITCHER
==================================================*/

function changeImage(company, button){

    const tankerImage = document.getElementById("tankerImage");

    if(!tankerImage) return;

    tankerImage.style.opacity = "0";

    setTimeout(function(){

        tankerImage.src = "assets/images/petroleum/" + company + ".png";
        tankerImage.style.opacity = "1";

    },250);

    document.querySelectorAll(".company-btn").forEach(function(btn){

        btn.classList.remove("active");

    });

    if(button){

        button.classList.add("active");

    }

}


/*==================================================
SPECIFICATION ACCORDION
==================================================*/

const accordion = document.querySelectorAll(".accordion-header");

accordion.forEach(item=>{

    item.addEventListener("click",()=>{

        const body = item.nextElementSibling;

        if(body.style.display==="block"){

            body.style.display="none";

        }

        else{

            document.querySelectorAll(".accordion-content").forEach(c=>{

                c.style.display="none";

            });

            body.style.display="block";

        }

    });

});


/*==================================================
PESO ACCESSORIES LOGO SLIDER
==================================================*/

document.addEventListener("DOMContentLoaded",function(){

    const track=document.querySelector(".logo-track");

    if(!track) return;

    const slides=track.querySelectorAll(".logo-slide");

    let current=0;

    function updateSlider(){

        slides.forEach(slide=>{

            slide.classList.remove("active","left","right");

        });

        const left=(current-1+slides.length)%slides.length;
        const right=(current+1)%slides.length;

        slides[left].classList.add("left");
        slides[current].classList.add("active");
        slides[right].classList.add("right");

    }

    updateSlider();

    setInterval(function(){

        current++;

        if(current>=slides.length){

            current=0;

        }

        updateSlider();

    },2500);

});