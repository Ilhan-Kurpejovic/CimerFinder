// Apply the saved appearance before the application paints.
;(() => {
  let theme = 'light'
  try {
    if (localStorage.getItem('cimer-theme') === 'dark') theme = 'dark'
  } catch {
    /* Storage can be blocked by the browser. */
  }
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
  root.style.colorScheme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = theme === 'dark' ? '#10151e' : '#ffffff'
})()
