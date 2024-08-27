import { documentOnLoaded } from "../../on-load";

export function attachThemeToggle() {
    documentOnLoaded(() => {
        hydrateToggles();
    }, { passive: true });

    const effectiveMode = getEffectiveThemeMode();
    console.log(`Effective theme is '${effectiveMode}'.`);
}

export function hydrateToggles() {
    const toggles = document.getElementsByClassName("theme-toggle");
    for (const toggle of toggles) {
        if (toggle instanceof HTMLElement) {
            hydrateToggle(toggle);
        }
    }
}

function hydrateToggle(element: HTMLElement) {
    element.addEventListener("click", () => {
        toggleTheme();
    });
}

function toggleTheme() {
    const currentTheme = getEffectiveThemeMode();
    const nextTheme = currentTheme == "dark" ? "light" : "dark";

    console.log("Switching theme from", currentTheme, "to", nextTheme);

    document.documentElement.classList.remove(currentTheme);
    document.documentElement.classList.add(nextTheme);
    localStorage.setItem("theme", nextTheme);
}

function getEffectiveThemeMode(): "light" | "dark" {
    // Check if set by user.
    const configuredTheme = localStorage.getItem("theme");
    if (configuredTheme) {
        if (configuredTheme === "light") {
            return "light";
        } else {
            return "dark";
        }
    }
    // Else, pick from user-agent, if possible.
    const perfersDark = !!window?.matchMedia?.("(prefers-color-scheme:dark)")?.matches;
    return perfersDark ? "dark" : "light";
}
