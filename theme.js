(function () {
  const storageKey = "rabbi-profile-theme";
  function preferredTheme() {
    try {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    } catch {
      // Fall back to the website default when storage is restricted.
    }
    return "light";
  }

  function applyTheme(theme, persist) {
    document.documentElement.dataset.theme = theme;
    if (persist) {
      try {
        localStorage.setItem(storageKey, theme);
      } catch {
        // The selected theme still applies for the current page view.
      }
    }

    const button = document.querySelector("#theme-toggle");
    const label = document.querySelector("#theme-toggle-label");
    const icon = document.querySelector("#theme-toggle-icon-use");
    if (!button || !label || !icon) return;

    const isDark = theme === "dark";
    const nextThemeLabel = isDark ? "light" : "dark";
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", `Switch to ${nextThemeLabel} mode`);
    button.title = `Switch to ${nextThemeLabel} mode`;
    label.textContent = isDark ? "Light" : "Dark";
    icon.setAttribute("href", isDark ? "#icon-sun" : "#icon-moon");
  }

  applyTheme(preferredTheme(), false);

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(document.documentElement.dataset.theme || preferredTheme(), false);
    document.querySelector("#theme-toggle")?.addEventListener("click", function () {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme, true);
    });
  });
})();
