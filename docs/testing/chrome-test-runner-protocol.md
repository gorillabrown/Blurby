# Chrome Test Runner Protocol

Instructions for Claude in Chrome (or a human tester) to execute the click-through checklist systematically.

## Setup

1. Ensure Blurby dev server is running: `npm run dev`
2. Open Chrome to `http://localhost:5173`
3. Verify stub is active: open DevTools console, confirm `[Blurby Stub] electronAPI stub installed` message
4. Verify `window.__blurbyStub` is available in console

## Execution Flow

### General Principles

- Execute checklist items **sequentially within each section**
- Sections can be run in any order, but recommended order follows the checklist (Boot → Onboarding → Library → ... → Error States)
- **Screenshot** every item marked with `Screenshot? = Y`
- **Check console** after every action — look for `[stub]` prefixed log entries matching the expected console output
- Log all failures immediately before continuing

### Tool Sequence Per Action Type

#### Click an element
```
1. find(text or selector)              → locate element
2. computer(click at coordinates)       → perform click
3. read_console_messages()              → verify stub logs
4. screenshot() if required             → capture state
```

#### Press a keyboard shortcut
```
1. computer(keypress: key combo)        → send keypress
2. read_console_messages()              → verify stub logs
3. screenshot() if required             → capture state
```

#### Navigate to a view/filter
```
1. computer(keypress: G-sequence)       → e.g., "g" then "f" for Favorites
2. screenshot() if required             → capture state
3. read_page()                          → verify content changed
```

#### Verify text content
```
1. read_page()                          → get page text
2. find(expected text)                  → confirm presence
```

#### Run JavaScript
```
1. javascript_tool(expression)          → e.g., window.__blurbyStub.emit(...)
2. read_console_messages()              → verify event fired
3. screenshot() if required             → capture UI response
```

#### Type text (search, command palette)
```
1. find(input field)                    → locate input
2. computer(click at input)             → focus it
3. computer(type: "search text")        → enter text
4. read_page()                          → verify filtered results
```

## State Management

### Before Starting
```javascript
// Set firstRunCompleted=false to test onboarding (default)
// Or skip onboarding:
window.__blurbyStub.setFirstRunCompleted(true);
location.reload();
```

### Between Test Sections
No reset needed unless testing onboarding again. State persists within a session.

### Full Reset
```javascript
window.__blurbyStub.reset();
location.reload();
```

## Failure Handling

### Non-Breaking Failure (visual mismatch, wrong text, missing element)
1. Screenshot the current state
2. Capture console messages
3. Log failure in this format:
   ```
   FAIL [ITEM-ID]: [description of what went wrong]
   Expected: [what should have happened]
   Actual: [what actually happened]
   Console: [relevant stub log entries]
   ```
4. Continue to next item

### Breaking Failure (white screen, infinite spinner, uncaught exception)
1. Screenshot the broken state
2. Capture all console messages (especially red errors)
3. Log failure with full error details
4. Reload the page: `location.reload()`
5. Wait for app to re-initialize (stub auto-installs on reload)
6. Skip to the **next untested section** (don't retry the broken item)
7. Note: Vite's HMR means no dev server restart is needed

### Blocked Item (depends on a feature that failed earlier)
1. Log as:
   ```
   SKIP [ITEM-ID]: Blocked by [FAILED-ITEM-ID] failure
   ```
2. Continue to next item

## Reporting Format

### During Execution
Keep a running log:
```
PASS [BOOT-01]: App loaded successfully
PASS [BOOT-02]: No console errors
FAIL [OB-02]: Tour tooltip did not appear after clicking "Next"
  Expected: Second tooltip shown
  Actual: Nothing happened after click
  Console: [stub] saveSettings {firstRunCompleted: true}
PASS [LIB-01]: Meditations visible in library
SKIP [LIB-11]: Blocked by READ-01 failure
...
```

### Final Summary
```
## Test Run Summary
Date: YYYY-MM-DD
Stub version: [commit hash]
Browser: Chrome [version]

### Results
- Total items: 121
- Passed: XX
- Failed: XX
- Skipped: XX

### Failures
[List each FAIL item with details]

### Observations
[Any patterns, systemic issues, or notes for developers]
```

## Onboarding Test Protocol

The onboarding flow requires special handling since it only appears on first run:

1. **First run (default stub state):** `firstRunCompleted: false`
   - Execute OB-01 through OB-03
   - After completing onboarding, `firstRunCompleted` becomes `true`

2. **Test normal library (post-onboarding):**
   - Continue with LIB-01 and beyond

3. **Re-test onboarding (if needed):**
   ```javascript
   window.__blurbyStub.reset();
   location.reload();
   ```

## Theme Testing Protocol

Theme switches are visually significant. For SET-02 through SET-06:
1. Switch theme via settings
2. Screenshot the **library view** (to see cards, sidebar, background)
3. Navigate to reader and screenshot **reader view** (to see text rendering)
4. Verify no CSS artifacts (missing colors, invisible text, broken borders)

## Keyboard Shortcut Testing Protocol

For KB-01 through KB-18:
1. Ensure no input field is focused (click on empty space first)
2. Send the keypress
3. Verify the expected UI change
4. Press Escape to reset state before next shortcut test

G-sequences require two keypresses within 2 seconds:
1. Press `g`
2. Within 2 seconds, press the second key (e.g., `f` for Favorites)
3. Verify navigation occurred

## Mode Testing Protocol

Reading modes should be tested with the Meditations EPUB open:
1. Open Meditations from library
2. Wait for EPUB to render (foliate-js)
3. Enter each mode via bottom bar button or keyboard shortcut
4. Test play/pause, speed controls, navigation
5. Exit via Escape
6. Verify return to Page mode with correct position

## Console Monitoring

The stub logs every IPC call in this format:
```
[stub] methodName [args] → result
```

Key patterns to watch for:
- `[stub] getState` — app initialization
- `[stub] saveSettings` — any settings change
- `[stub] readFileBuffer` — EPUB loading
- `[stub] updateDocProgress` — reading position saves
- `[stub] kokoroGenerate` — Kokoro TTS generation
- `[audio] play` — Web Audio playback
- `[stub] emit` — manually triggered events

Red console errors are always failures — capture and report them.
