// GlobalOSP main JavaScript

const menuButton = document.querySelector("[data-menu-button]");
const navLinks = document.querySelector("[data-nav-links]");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const isOpen = navLinks.classList.contains("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

// Easy project system.
// To add projects, edit this list. You can also add live links when ready.
const projects = [
  {
    name: "Elaborate",
    category: "Education Platform",
    description:
      "A clean education dashboard concept built to bring student, teacher, school, and district tools into one organized website.",
    tags: ["Education", "Dashboard", "Web"],
    link: "https://elaborateedu.github.io"
  },
  {
    name: "Vatio Labs",
    category: "Roblox / Discord Studio",
    description:
      "A no-BS Roblox studio and Discord community focused on building games, systems, moderation training, and useful server tools.",
    tags: ["Roblox", "Discord", "Community"],
    link: "https://www.roblox.com/communities/212485615/Vatio-Labs#!/about"
  },
  {
    name: "Vanata Bot",
    category: "Discord Bot",
    description:
      "A Discord bot and dashboard project with tickets, applications, server tools, and future dashboard-first customization.",
    tags: ["Discord Bot", "Firebase", "Dashboard"],
    link: "#"
  },
  {
    name: "Locc",
    category: "Focus Hardware / Website",
    description:
      "A website-first concept for a phone-locking focus product inspired by physical distraction blockers.",
    tags: ["Hardware", "Focus", "Firebase"],
    link: "#"
  }

];

const blogPosts = [
  {
    title: "Why GlobalOSP Exists",
    date: "Coming soon",
    excerpt:
      "A founder note about turning separate websites, tools, and experiments into one organized open-source project network.",
    slug: "#"
  },
  {
    title: "Building Projects Before They Feel Ready",
    date: "Draft",
    excerpt:
      "Thoughts on shipping early, learning fast, and improving projects after they are already real.",
    slug: "#"
  },
  {
    title: "The Dashboard-First Internet",
    date: "Draft",
    excerpt:
      "Why tools should feel less like commands and more like simple, beautiful control panels.",
    slug: "#"
  }
];

function renderProjects() {
  const grid = document.querySelector("[data-project-grid]");
  if (!grid) return;

  grid.innerHTML = projects
    .map((project) => {
      const tags = project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
      return `
        <article class="project-card">
          <span class="tag">${project.category}</span>
          <h3>${project.name}</h3>
          <p>${project.description}</p>
          <div class="project-meta">${tags}</div>
          <a class="btn secondary" href="${project.link}" ${project.link !== "#" ? 'target="_blank" rel="noreferrer"' : ""}>View project</a>
        </article>
      `;
    })
    .join("");
}

function renderBlogPosts() {
  const grid = document.querySelector("[data-blog-grid]");
  if (!grid) return;

  grid.innerHTML = blogPosts
    .map((post) => {
      return `
        <article class="post-card">
          <span class="tag">${post.date}</span>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <a class="btn secondary" href="${post.slug}">Read article</a>
        </article>
      `;
    })
    .join("");
}

renderProjects();
renderBlogPosts();