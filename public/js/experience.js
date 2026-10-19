// Professional Experience 列表交互
const professionalDetails = {
  itu: {
    title: "IT University of Copenhagen",
    date: "08/2025 – 12/2025",
    role: 'Teaching Assistant for <a href="https://learnit.itu.dk/local/coursebase/view.php?s=ft&amp;view=public&amp;ciid=1785" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;text-underline-offset:3px">Distributed Systems</a>',
    desc: [
      "Guided students through weekly exercises and live coding sessions, helping them understand technical concepts and complete programming assignments",
      "Participated in weekly teaching team meetings to coordinate teaching activities, share observations from grading, and adjust support strategies for students",
    ],
  },
  cph: {
    title: "University of Copenhagen, Department of Computer Science",
    date: "02/2025 – 04/2025",
    role: 'Teaching Assistant for <a href="https://kurser.ku.dk/course/ndak15012u/2024-2025" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;text-underline-offset:3px">Advanced Topics in Human-Centered Computing</a>',
    desc: [
      "Supported students by discussing course topics and answering questions during class sessions and office hours",
      "Co-graded and provided detailed feedback on 4 assignments for 43 students in collaboration with another teaching assistant",
    ],
  },
  bili: {
    title: "Shanghai Bilibili Technology Ltd",
    date: "09/2022 – 02/2023",
    role: "Intern, Internship in Front-end Development",
    desc: [
      "Developed a Chrome extension for the backend team to decode logs and display results inline when users select encoded text on specific URLs",
      "Integrated an external script for targeted messaging, based on discussions with product managers and insights from a user questionnaire, improving the overall user experience",
    ],
  },
  tongji: {
    title: "Tongji University Art Centre",
    date: "03/2020 – 08/2022",
    role: "Student Job, Assistant of Art Centre \& Student Leader of Art Troupe",
    desc: [
      "Wrote and typeset articles for the official account to promote campus art activities, increasing followers from 6,295 to 15,754 within one year",
      "Conducted an online survey on improving school art events and analyzed 882 valid responses to identify preferences for activity types and timing among students and teachers",
    ],
  },
};

function setupProfessionalList() {
  const profList = document.querySelector(".prof-list");
  const profPanel = document.getElementById("prof-detail-panel");
  if (!profList || !profPanel) return;

  profList.addEventListener("click", (event) => {
    const item = event.target.closest(".prof-list-item");
    if (!item || !profList.contains(item)) return;

    const detail = professionalDetails[item.dataset.key];
    if (!detail) return;

    profList.querySelectorAll(".prof-list-item").forEach((otherItem) => {
      otherItem.classList.remove("selected");
    });
    item.classList.add("selected");

    profPanel.innerHTML =
      `<div class='prof-detail-title'>${detail.title}<br><span class='prof-detail-date'>${detail.date}</span></div>` +
      `<div class='prof-detail-role'>${detail.role}</div>` +
      `<ul class='prof-detail-desc'>${detail.desc.map((text) => `<li>${text}</li>`).join("")}</ul>`;

    updateProfessionalScrollbar();
  });
}

function updateProfessionalScrollbar() {
  const professionalSection = document.getElementById("professional");
  if (!professionalSection) return;

  professionalSection.style.overflowY =
    professionalSection.scrollHeight > professionalSection.clientHeight
      ? "auto"
      : "hidden";
}
