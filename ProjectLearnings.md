# Project Learnings

Reflections from building a **lightweight `chai-*` utility engine** that parses class names and applies inline styles in the browser.

---

## 1. Utility-first CSS is a *language*, not just a stylesheet

Frameworks like Tailwind feel like “many small classes,” but the real idea is a **consistent vocabulary**: spacing scales, naming patterns (`p-2`, `bg-red`), and predictable composition. Implementing our own engine forced us to be explicit about:

- What each token means
- How tokens combine (order, conflicts)
- What happens when a token is **unknown** (we strip it after apply, so unsupported utilities disappear silently—worth documenting)

**Learning:** Designing the *naming scheme* is as important as writing the parser.

---

## 2. DOM APIs are enough for a minimal “engine”

We used:

- `querySelectorAll('[class*="chai-"]')` to find candidates
- `classList` to filter `chai-*` tokens and remove them after processing
- `element.style[propName]` for camelCase CSS properties

**Learning:** You don’t need a framework to practice meaningful DOM manipulation—small, focused scripts teach traversal, lists, and style application clearly.

---

## 3. Parsing class names is pattern matching + edge cases

Each utility is essentially a **mini grammar**: `p-2`, `mt-4`, `text-gray-700`, `rounded-lg`. Regex and ordered `if` blocks work well, but:

- **Order of checks matters** when patterns overlap (e.g. `text-*` for font size vs text color).
- **Invalid or partial tokens** need a clear decision: ignore or strip. We chose parse-or-skip, then strip all `chai-*` on the element.

**Learning:** String parsing and “first match wins” rules are easy to get wrong; testing with real HTML examples catches bugs early.

---

## 4. Inline styles vs CSS files: real trade-offs

**Pros of our approach:**

- No generated CSS bundle for utilities
- Easy to see computed styles in DevTools
- Good for learning and demos

**Cons:**

- Theming and responsive design are harder than with class-based CSS
- Specificity and cascade behave differently from traditional stylesheets
- Re-applying or dynamic content needs a deliberate **re-scan** strategy

**Learning:** “Utility classes” in a real product often mix **build-time CSS** with **runtime** behavior; our project isolates the runtime idea for clarity.

---

## 5. `chai-*` removal teaches “compilation” mental model

Removing original utility classes after applying inline styles mirrors a **compile step**: source tokens become output (inline styles). It also makes it obvious when a class wasn’t recognized—those tokens disappear without effect.

**Learning:** Stripping classes is a design choice with UX implications (debugging vs cleanliness).

---

## 6. Color handling is more than a map

We used:

- A small **gray/slate scale** map for predictable tokens
- `CSS.supports('color', ...)` where possible for standard color keywords

**Learning:** Color tokens are a good place to see how **convention** (e.g. `gray-700`) and **browser validation** interact.

---

## 7. What we’d do differently next time

- **Cache** parsed `(className → declarations)` to avoid repeat work on re-scan
- **Log or warn** on unknown `chai-*` tokens during development
- **MutationObserver** or hooks for SPAs if elements are added after load
- **Optional build step** to emit static CSS for production performance

---

## 8. Skills reinforced

This project reinforced:

- **DOM traversal and `classList` APIs**
- **String parsing and regular expressions**
- **Mapping abstract tokens to concrete CSS**
- **Documenting architecture** (`README.md`, `approach.md`) so others can follow the design

---

## Related docs

- **`README.md`** — how to run the demo and what utilities exist  
- **`approach.md`** — design rationale and pipeline  
