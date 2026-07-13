/*=========================================
COMPANY IMAGE SWITCHER
=========================================*/

const tankerImage = document.getElementById("tankerImage");

const buttons = document.querySelectorAll(".company-selector button");

function changeImage(company){

    tankerImage.classList.remove("fade");

    setTimeout(()=>{

        tankerImage.src="assets/images/petroleum/"+company+".jpg";

        tankerImage.classList.add("fade");

    },120);

    buttons.forEach(btn=>{

        btn.classList.remove("active");

    });

    event.target.classList.add("active");

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