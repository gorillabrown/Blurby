Generate a new React component for the Blurby app.

The user will provide: component name and what it should do.

Steps:
1. Create `src/components/{ComponentName}.jsx` following existing patterns:
   - Import from `../utils/text` if text processing is needed
   - Use CSS class names (not inline styles)
   - Props destructured in function signature
   - Export as default
2. Add CSS classes to `src/styles/global.css`:
   - Use the naming convention: `.component-name`, `.component-name-element`
   - Follow the existing dark theme (use CSS variables from `:root`)
3. Report: file created, classes added, and how to integrate it (which parent component to import it in)

Do NOT create a separate CSS module file — all styles go in `global.css`.
