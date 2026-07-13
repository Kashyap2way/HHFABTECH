/*=========================================
COMPANY IMAGE SWITCHER
=========================================*/

const tankerImage = document.getElementById("tankerImage");

const buttons = document.querySelectorAll(".company-selector button");

function changeImage(company, button){

    const tankerImage = document.getElementById("tankerImage");

    tankerImage.style.opacity="0";

    setTimeout(function(){

        tankerImage.src="assets/images/petroleum/"+company+".png";

        tankerImage.style.opacity="1";

    },250);

    document.querySelectorAll(".company-btn").forEach(function(btn){

        btn.classList.remove("active");

    });

    button.classList.add("active");

}

/*================ ACCORDION ================*/

const accordion=document.querySelectorAll(".accordion-header");

accordion.forEach(item=>{

item.addEventListener("click",()=>{

const body=item.nextElementSibling;

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