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

})

.catch(error=>{

    console.log(error);

    noJobs.style.display="block";

});