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

        tankerImage.src = "assets/images/petroleum/" + company + ".webp";
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

const logos=[

"assets/images/petroleum/peso accesories logo/logo1.png",

"assets/images/petroleum/peso accesories logo/logo2.png",

"assets/images/petroleum/peso accesories logo/logo3.jpg",

"assets/images/petroleum/peso accesories logo/logo4.png",

"assets/images/petroleum/peso accesories logo/logo5.png"

];

let current=0;

const left=document.getElementById("leftLogo");
const center=document.getElementById("centerLogo");
const right=document.getElementById("rightLogo");

function updateLogos(){

    if(!left) return;

    let l=(current-1+logos.length)%logos.length;
    let r=(current+1)%logos.length;

    left.src=logos[l];
    center.src=logos[current];
    right.src=logos[r];

}

updateLogos();

setInterval(function(){

    current++;

    if(current>=logos.length){

        current=0;

    }

    updateLogos();

},2500);