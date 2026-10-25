/*==================================================
HH FABTECH CAREER PAGE
Loads jobs from jobs.json
==================================================*/

const container = document.getElementById("jobContainer");
const noJobs = document.getElementById("noJobs");
const jobInput = document.getElementById("jobTitle");

/*==========================
LOAD JOBS
==========================*/

fetch("assets/data/jobs.json")

.then(response => response.json())

.then(jobs => {

    const activeJobs = jobs.filter(job => job.status === "Open");

    if(activeJobs.length === 0){

        noJobs.style.display = "block";

        return;

    }

    activeJobs.forEach(job => {

        const card = document.createElement("div");

        card.className = "job-card";

        card.innerHTML = `

        <div class="job-header">

            <h3>${job.designation}</h3>

            <div class="job-salary">

                ${job.salary}

            </div>

        </div>

        <div class="job-body">

            <div class="job-status status-open">

                ${job.status}

            </div>

            <p>

                <strong>Department:</strong>

                ${job.department}

            </p>

            <p>

                <strong>Location:</strong>

                ${job.location}

            </p>

            <p>

                <strong>Employment:</strong>

                ${job.type}

            </p>

            <p>

                <strong>Experience:</strong>

                ${job.experience}

            </p>

            <p>

                <strong>Qualification:</strong>

                ${job.qualification}

            </p>

            <p>

                <strong>Vacancies:</strong>

                ${job.vacancies}

            </p>

            <p>

                <strong>Posted On:</strong>

                ${job.posted}

            </p>

            <p>

                <strong>Apply Before:</strong>

                ${job.lastDate}

            </p>

        </div>

        <div class="job-footer">

            <button
                class="btn apply-btn"
                data-job="${job.designation}">

                Apply Now

            </button>

        </div>

        `;

        container.appendChild(card);

    });

    /*==========================
    APPLY BUTTON
    ==========================*/

    document.querySelectorAll(".apply-btn").forEach(button=>{

        button.addEventListener("click",function(){

            jobInput.value = this.dataset.job;

            document.getElementById("apply").scrollIntoView({

                behavior:"smooth"

            });

        });

    });

    /*==========================
    JOB POSTING STRUCTURED DATA (SEO / Google Jobs)
    ==========================*/

    injectJobPostingSchema(activeJobs);

})

.catch(error=>{

    console.log(error);

    noJobs.style.display="block";

});

/*==================================================
BUILD JobPosting JSON-LD FOR EACH OPEN ROLE
Converts "01 Aug 2026" style dates to ISO (YYYY-MM-DD)
and parses "₹20,000-25,000" salary ranges.
==================================================*/

function injectJobPostingSchema(jobs){

    const toISO = str => {

        const d = new Date(str);

        if(isNaN(d)) return undefined;

        // Build the date from local components to avoid UTC timezone drift

        const pad = n => String(n).padStart(2,"0");

        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

    };

    const parseSalary = str => {

        if(!str) return null;

        const nums = str.replace(/,/g,"").match(/\d+/g);

        if(!nums || !nums.length) return null;

        const value = nums.length >= 2

            ? { "@type":"QuantitativeValue", "minValue":Number(nums[0]), "maxValue":Number(nums[1]), "unitText":"MONTH" }

            : { "@type":"QuantitativeValue", "value":Number(nums[0]), "unitText":"MONTH" };

        return {

            "@type":"MonetaryAmount",

            "currency":"INR",

            "value":value

        };

    };

    jobs.forEach(job => {

        const posting = {

            "@context":"https://schema.org",

            "@type":"JobPosting",

            "title":job.designation,

            "description":`${job.designation} at HH FABTECH in the ${job.department} department. Experience: ${job.experience}. Qualification: ${job.qualification}.`,

            "datePosted":toISO(job.posted),

            "validThrough":toISO(job.lastDate),

            "employmentType":(job.type||"").toUpperCase().includes("FULL") ? "FULL_TIME" : "OTHER",

            "hiringOrganization":{

                "@type":"Organization",

                "name":"HH FABTECH",

                "sameAs":"https://hhfabtech.com/",

                "logo":"https://hhfabtech.com/assets/images/logo.png"

            },

            "jobLocation":{

                "@type":"Place",

                "address":{

                    "@type":"PostalAddress",

                    "streetAddress":"Near Sanathal Circle Road, Sanathal, Sanand",

                    "addressLocality":"Ahmedabad",

                    "addressRegion":"Gujarat",

                    "postalCode":"382210",

                    "addressCountry":"IN"

                }

            }

        };

        const salary = parseSalary(job.salary);

        if(salary) posting.baseSalary = salary;

        if(job.vacancies) posting.totalJobOpenings = Number(job.vacancies) || undefined;

        const script = document.createElement("script");

        script.type = "application/ld+json";

        script.textContent = JSON.stringify(posting);

        document.head.appendChild(script);

    });

}