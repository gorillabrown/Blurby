
## 2024-05-18 - Explaining Disabled States
**Learning:** Adding an explanation to disabled buttons improves accessibility and user experience, especially when the reason it's disabled isn't immediately obvious from the surrounding context. A simple `title` attribute can serve as an effective dynamic tooltip that provides actionable guidance (e.g. "Select a folder first to rescan") instead of silently ignoring interaction.
**Action:** Always consider why an element is disabled and if adding a `title` tooltip could help users understand what they need to do to proceed. Use dynamic tooltips that fall back to the default label/action description once enabled.
