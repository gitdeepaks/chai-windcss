# chai-* utility engine (lightweight)

This project builds a tiny “utility-first CSS” engine without writing traditional CSS for utilities.
Instead of real CSS rules, you write class names like:

`chai-p-2`, `chai-bg-red`, `chai-text-center`, `chai-rounded-lg`, etc.

After page load, the engine:
1. Scans the DOM for any class names starting with `chai-`
2. Parses each class name into a list of inline style declarations
3. Applies those declarations via JavaScript (`element.style`)
4. Removes the original `chai-*` classes (so they don’t “stack” or get re-applied)

The result is behavior similar to a utility CSS framework, but implemented as runtime DOM manipulation.

---

## How the class system works

### Class naming convention
All utilities must start with `chai-`:

`chai-<utility>-<value...>`

Examples:
- `chai-p-2` → `padding: 2px`
- `chai-bg-red` → `background-color: red`
- `chai-text-center` → `text-align: center`
- `chai-rounded-lg` → `border-radius: 8px`

### Supported utility groups (current engine)
- Spacing: `chai-p-*`, `chai-m-*`, `chai-px-*`, `chai-mt-*`, etc.
- Colors: `chai-bg-*`, `chai-text-*` (supports a small built-in gray/slate scale, plus normal CSS colors like `red`, `blue`)
- Typography:
  - Alignment: `chai-text-left|center|right|justify`
  - Case: `chai-uppercase|lowercase|capitalize`
  - Font size: `chai-text-sm|md|lg|xl|2xl|3xl|4xl` (and numeric `chai-text-16`)
  - Font weight: `chai-font-bold|semibold|medium|normal|light|thin|...`
- Borders and radius: `chai-border`, `chai-border-2`, `chai-border-dashed`, `chai-border-<color>`, `chai-rounded`, `chai-rounded-lg`, etc.
- Basic layout:
  - Display: `chai-flex`, `chai-inline-flex`, `chai-grid`, `chai-block`, `chai-hidden`, ...
  - Flex direction: `chai-flex-row`, `chai-flex-col`
  - Flex layout: `chai-flex-1` (maps to `flex: <n> <n> 0%`), `chai-flex-wrap|nowrap`, `chai-gap-*`, `chai-justify-*`, `chai-items-*`
  - Width/height: `chai-w-*`, `chai-h-*` (`full|auto|number`)

---

## Approach (high level)

1. **Runtime scan after load**
   The entrypoint calls `applyChaiUtilities(document)` inside `DOMContentLoaded`.

2. **Parsing utilities from class names**
   Each element’s `classList` is filtered down to only `chai-*` classes.
   Then each `chai-*` class is parsed into declarations like:
   - `{ prop: "padding", value: "2px" }`
   - `{ prop: "backgroundColor", value: "#ef4444" }`

3. **Applying inline styles**
   Declarations are applied directly:
   - `element.style[decl.prop] = decl.value`

4. **Stripping original classes**
   The engine removes the `chai-*` class tokens after applying, so the page behaves like the utilities were “compiled” into inline styles.

---

## Key parts of the code

Main files:
- `chai-engine.js`: the reusable client-side engine
- `script.js`: demo wiring (runs the scan, and connects the “Re-run” button)
- `index.html`: demo UI with `chai-*` classes

### `applyChaiUtilities()`
Located in `chai-engine.js`.
It:
- finds elements with any class containing `chai-`
- parses every `chai-*` token on each element
- applies matching declarations
- removes the `chai-*` tokens

### `parseChaiClass(className)`
Also in `chai-engine.js`.
This function is essentially a set of small pattern matchers:
- spacing utilities are matched using a regex like `^(p|m)([trblxy])?-(.+)$`
- colors are matched with `bg-(...)` and `text-(...)`
- typography sizes use `text-(xs|sm|md|...)` or `text-<number>`
- borders and radius use `border-*` and `rounded-*`

### `resolveColor(token)`
Tries to map common scale names (`gray-700`, `slate-200`, etc.) to hex values.
If it’s not one of the built-in gray/slate tokens, it falls back to browser validation:
`CSS.supports('color', token)` to accept normal CSS colors like `red`, `blue`, `#ff0`, `rgb(...)`, etc.

---

## Demonstrate the project in the browser

1. Open a terminal in this folder:

   `cd /Users/deepaksankhyan/Developer/chai-cohort/chaitailwind`

2. Start a local server (so ES modules load cleanly):

   `python3 -m http.server 5173`

3. Open:
   - `http://localhost:5173/`

4. You should immediately see the demo cards styled.

5. Try interaction:
   - Click the **Re-run** button to scan the DOM again.
   - Or in DevTools, add a new utility class to an element, then click **Re-run**.
   - You can also call directly in the console:
     `applyChaiUtilities(document)`

---

## Notes / next improvements

This is intentionally lightweight. If you want to grow it toward a more complete Tailwind-like experience, the next obvious improvements are:
- expand the utility set (borders, spacing scale, typography, etc.)
- add responsive variants (`chai-sm:p-2` style)
- support more flex/grid helpers (`chai-flex-row` already exists; add `justify`/`items` variants, etc.)
- add caching (to avoid re-parsing the same class tokens repeatedly)

# chai-windcss
