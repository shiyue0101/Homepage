// Route names and aliases have one source of truth.
((scope) => {
  const pages = {
    "/": { page: "home", title: "Yue Shi" },
    "/about": { page: "about", title: "Yue | About Me" },
    "/projects": { page: "projects", title: "Yue | Projects" },
    "/professional": { page: "professional", title: "Yue | Experience" },
    "/life": { page: "life", title: "Yue | Life" },
    "/contact": { page: "contact", title: "Yue | Contact" },
    "/skills": { page: "skills", title: "Yue | Skills" },
  };
  const projects = {
    purrpost: "PurrPost",
    "masking-ball": "Masking Ball",
    "turn-taking-band": "Turn-Taking Band",
    makiwara: "Makiwara",
    "video-conference": "Video Conference",
  };
  function normalize(path) {
    const clean = path.replace(/\/+$/, "") || "/";
    return clean === "/about/index.html" ? "/about" : clean;
  }
  function projectName(path) {
    const match = /^\/projects\/([a-z-]+)\.html$/.exec(normalize(path));
    return match && Object.hasOwn(projects, match[1])
      ? projects[match[1]]
      : undefined;
  }
  const api = {
    pagePaths: Object.keys(pages),
    normalize,
    pageForPath: (path) => pages[normalize(path)]?.page,
    isProject: (path) => Boolean(projectName(path)),
    titleForPath: (path) =>
      pages[normalize(path)]?.title ||
      (projectName(path) ? "Yue | " + projectName(path) : "Yue Shi"),
    sync(path = scope.location.pathname) {
      scope.document.title = api.titleForPath(path);
      scope.document.body?.classList.toggle(
        "yue-piano-home",
        normalize(path) === "/",
      );
      scope.dispatchEvent(new scope.Event("site-route-change"));
    },
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    scope.HomepageRoutes = api;
    api.sync();
    scope.addEventListener("pageshow", () => api.sync());
  }
})(typeof window === "undefined" ? globalThis : window);
