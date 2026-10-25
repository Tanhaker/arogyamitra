export const THEME_KEY = "theme";

/** Runs in <head> before the page paints so there is no flash of the wrong theme. */
export const themeInitScript = `(function(){try{var s=localStorage.getItem('${THEME_KEY}');var t=s||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){}})();`;
