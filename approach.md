# Approach

This document describes **how we designed and built** the chai-* utility engine: the goals, the pipeline, and the trade-offs we accepted on purpose.

---

## 1. Goal

Build a **lightweight, client-side “utility-first CSS” experience** without maintaining a separate stylesheet of utility rules.

Users express styling through **predictable class names** (`chai-p-2`, `chai-bg-red`, …). The browser runs a small script that:

- finds those classes,
- turns them into **inline styles**,
- then **removes** the original `chai-*` tokens so the DOM reflects “resolved” styling.

This mirrors the *feel* of frameworks like Tailwind, but the “compilation” happens **at runtime in JavaScript** instead of at build time.

---

## 2. Why this approach?

| Idea | Rationale |
|------|-----------|
| **Class names as tokens** | Keeps HTML declarative and easy to scan; the same mental model as utility CSS. |
| **Parse → inline styles** | No need to generate or ship a huge CSS file; every supported utility is implemented as parsing logic. |
| **Strip `chai-*` after apply** | Avoids double-processing, keeps class lists clean, and makes it obvious that utilities were “consumed” into inline styles. |
| **Single pass on load** | Simple mental model: run once when the DOM is ready; re-run when needed (e.g. demo “Re-run” button or DevTools edits). |

We deliberately chose **simplicity over completeness**: a small, readable engine that demonstrates DOM manipulation and pattern parsing.

---

## 3. End-to-end pipeline

```
Page load
  → DOMContentLoaded
  → applyChaiUtilities(document)
      → query elements with [class*="chai-"]
      → for each element: collect all class tokens starting with chai-
      → for each token: parseChaiClass(token) → [{ prop, value }, ...]
      → assign element.style[prop] = value
      → remove each chai-* token from classList
```

**Re-runs** use the same function so you can add new `chai-*` classes in DevTools and apply them again without a full page reload.

---

## 4. Parsing strategy

We treat each class as a **string pattern**, not as CSS:

- Strip the `chai-` prefix; the remainder is the “utility key” (e.g. `p-2`, `bg-red`, `rounded-lg`).
- Match the key against **ordered rules**:
  - spacing (regex on `p|m` + optional side + value),
  - layout (display, flex, gap, width/height),
  - typography (size, weight, alignment, case),
  - colors (`bg-*`, `text-*` with a small gray/slate map + `CSS.supports` for named colors),
  - borders and radius.

**Order matters** when multiple patterns could overlap (e.g. `text-*` for size vs color); the parser returns on the first match.

---

## 5. Design trade-offs

| Trade-off | What we gain | What we give up |
|-----------|----------------|-----------------|
| Inline styles | No external utility CSS; easy to debug in DevTools | Harder to override with CSS specificity tricks; not ideal for theming at scale |
| Runtime parsing | No build step; works in any static HTML page | Cost per element/class; not optimized for huge trees without batching |
| Limited utility set | Small, maintainable code | Not a full Tailwind clone |
| No shadow DOM / mutation observer | Simple demo | Dynamic content would need explicit re-scan or observers |

---

## 6. Extension path

If this project grows, natural next steps are:

1. **Richer token vocabulary** — more spacing steps, responsive prefixes, state variants.
2. **Performance** — cache parsed `(className → declarations)` maps; avoid re-querying unchanged subtrees.
3. **Correctness** — merge conflicting utilities per property (last wins) or per layer.
4. **Build-time option** — optional step that scans HTML and emits real CSS for production.

---

## 7. Where to look in the repo

| File | Role |
|------|------|
| `chai-engine.js` | `parseChaiClass`, `applyChaiUtilities`, color resolution |
| `script.js` | Boot on `DOMContentLoaded`, wire “Re-run” |
| `index.html` | Demo markup using only `chai-*` utilities |

For a full feature list and how to run the demo in the browser, see `README.md`.
