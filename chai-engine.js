/**
 * chai-engine.js
 * Lightweight utility-first CSS engine driven by class name parsing.
 *
 * Supported pattern: `chai-<utility>-<value...>`
 * The engine scans the DOM for classes starting with `chai-`, parses utilities,
 * applies corresponding inline styles, and removes the original `chai-*` classes.
 */

const GRAY_SHADES = {
  'gray-50': '#f9fafb',
  'gray-100': '#f3f4f6',
  'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db',
  'gray-400': '#9ca3af',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'gray-700': '#374151',
  'gray-800': '#1f2937',
  'gray-900': '#111827',
  // common alias
  'slate-50': '#f8fafc',
  'slate-100': '#f1f5f9',
  'slate-200': '#e2e8f0',
  'slate-300': '#cbd5e1',
  'slate-400': '#94a3b8',
  'slate-500': '#64748b',
  'slate-600': '#475569',
  'slate-700': '#334155',
  'slate-800': '#1e293b',
  'slate-900': '#0f172a',
};

function px(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return `${n}px`;
}

function resolveColor(token) {
  if (!token) return null;
  const t = String(token).trim().toLowerCase();
  if (!t) return null;

  // gray-200, slate-700, etc.
  if (t in GRAY_SHADES) return GRAY_SHADES[t];

  // If it is a valid CSS color keyword/format, let the browser validate it.
  try {
    if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('color', t)) {
      return t;
    }
  } catch {
    // ignore, fall through
  }
  return null;
}

function ensureBorderStyle(el) {
  if (!el.style.borderStyle) el.style.borderStyle = 'solid';
}

function setStyleDeclarations(el, declarations) {
  for (const decl of declarations) {
    el.style[decl.prop] = decl.value;
  }
}

function parseChaiClass(className) {
  if (typeof className !== 'string') return null;
  if (!className.startsWith('chai-')) return null;

  const c = className.slice('chai-'.length);

  // Display
  if (c === 'flex') return [{ prop: 'display', value: 'flex' }];
  if (c === 'inline-flex') return [{ prop: 'display', value: 'inline-flex' }];
  if (c === 'grid') return [{ prop: 'display', value: 'grid' }];
  if (c === 'block') return [{ prop: 'display', value: 'block' }];
  if (c === 'inline-block') return [{ prop: 'display', value: 'inline-block' }];
  if (c === 'hidden') return [{ prop: 'display', value: 'none' }];

  // Flex direction
  if (c === 'flex-row') return [{ prop: 'flexDirection', value: 'row' }];
  if (c === 'flex-col') return [{ prop: 'flexDirection', value: 'column' }];

  // Flex wrap
  if (c === 'flex-wrap') return [{ prop: 'flexWrap', value: 'wrap' }];
  if (c === 'flex-nowrap') return [{ prop: 'flexWrap', value: 'nowrap' }];

  // Flex growth/shrink for flex items: `chai-flex-1` => flex: 1 1 0%
  {
    const m = c.match(/^flex-(\d+)$/);
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n)) {
        return [
          { prop: 'flexGrow', value: String(n) },
          { prop: 'flexShrink', value: '1' },
          { prop: 'flexBasis', value: '0%' },
        ];
      }
    }
  }

  // Alignment (flex)
  {
    const m = c.match(/^justify-(start|center|end|between|around|evenly)$/);
    if (m) {
      const map = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        between: 'space-between',
        around: 'space-around',
        evenly: 'space-evenly',
      };
      return [{ prop: 'justifyContent', value: map[m[1]] }];
    }
  }
  {
    const m = c.match(/^items-(start|center|end|stretch)$/);
    if (m) {
      const map = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        stretch: 'stretch',
      };
      return [{ prop: 'alignItems', value: map[m[1]] }];
    }
  }

  // Gap
  {
    const m = c.match(/^gap-(.+)$/);
    if (m) {
      const value = m[1];
      const out = value === '0' ? '0px' : px(value);
      if (out) return [{ prop: 'gap', value: out }];
    }
  }

  // Width/Height
  {
    const m = c.match(/^w-(full|auto|(.+))$/);
    if (m) {
      const token = m[1];
      if (token === 'full') return [{ prop: 'width', value: '100%' }];
      if (token === 'auto') return [{ prop: 'width', value: 'auto' }];
      const out = px(m[2]);
      if (out) return [{ prop: 'width', value: out }];
    }
  }
  {
    const m = c.match(/^h-(full|auto|(.+))$/);
    if (m) {
      const token = m[1];
      if (token === 'full') return [{ prop: 'height', value: '100%' }];
      if (token === 'auto') return [{ prop: 'height', value: 'auto' }];
      const out = px(m[2]);
      if (out) return [{ prop: 'height', value: out }];
    }
  }

  // Colors: background
  {
    const m = c.match(/^bg-(.+)$/);
    if (m) {
      const color = resolveColor(m[1]);
      if (color) return [{ prop: 'backgroundColor', value: color }];
    }
  }

  // Typography:
  // - alignment
  {
    const m = c.match(/^text-(left|center|right|justify)$/);
    if (m) return [{ prop: 'textAlign', value: m[1] }];
  }
  // - transform
  if (c === 'uppercase') return [{ prop: 'textTransform', value: 'uppercase' }];
  if (c === 'lowercase') return [{ prop: 'textTransform', value: 'lowercase' }];
  if (c === 'capitalize') return [{ prop: 'textTransform', value: 'capitalize' }];

  // - font weight
  {
    const m = c.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/);
    if (m) {
      const map = {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      };
      return [{ prop: 'fontWeight', value: map[m[1]] }];
    }
  }

  // - font size: `text-2xl`, `text-xl`, `text-16`, etc.
  {
    const sizeToken = c.match(/^text-(xs|sm|md|lg|xl|2xl|3xl|4xl)$/);
    if (sizeToken) {
      const map = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36 };
      return [{ prop: 'fontSize', value: `${map[sizeToken[1]]}px` }];
    }
  }
  {
    const m = c.match(/^text-(\d+(?:\.\d+)?)$/);
    if (m) {
      const out = px(m[1]);
      if (out) return [{ prop: 'fontSize', value: out }];
    }
  }
  // - text color fallback: `chai-text-red`, `chai-text-gray-700`, ...
  {
    const m = c.match(/^text-(.+)$/);
    if (m) {
      const color = resolveColor(m[1]);
      if (color) return [{ prop: 'color', value: color }];
    }
  }

  // Border radius
  if (c === 'rounded') return [{ prop: 'borderRadius', value: '4px' }];
  {
    const m = c.match(/^rounded-(.+)$/);
    if (m) {
      const v = m[1];
      const map = { 'sm': '3px', 'md': '6px', 'lg': '8px', 'xl': '12px', '2xl': '16px' };
      if (v in map) return [{ prop: 'borderRadius', value: map[v] }];
      const out = px(v);
      if (out) return [{ prop: 'borderRadius', value: out }];
    }
  }

  // Borders: style/width/color
  // `chai-border` sets width to 1px and defaults solid style.
  if (c === 'border') {
    // ensureBorderStyle isn't invoked twice; keep this simple:
    return [
      { prop: 'borderWidth', value: '1px' },
      { prop: 'borderStyle', value: 'solid' },
    ];
  }
  {
    const m = c.match(/^border-(solid|dashed|dotted|double)$/);
    if (m) return [{ prop: 'borderStyle', value: m[1] }];
  }
  {
    const m = c.match(/^border-(\d+)$/);
    if (m) {
      return [{ prop: 'borderWidth', value: `${Number(m[1])}px` }];
    }
  }
  {
    const m = c.match(/^border-(.+)$/);
    if (m) {
      const color = resolveColor(m[1]);
      if (color) {
        // border-style may not be set yet, so default it.
        return [
          { prop: 'borderColor', value: color },
        ];
      }
    }
  }

  // Spacing utilities:
  // - padding/margin: `chai-p-2`, `chai-mt-4`, `chai-px-3`, `chai-mx-auto`, etc.
  {
    const m = c.match(/^(p|m)([trblxy])?-(.+)$/);
    if (m) {
      const kind = m[1]; // p or m
      const side = m[2]; // t/r/b/l/x/y or undefined
      const rawValue = m[3];

      const value = rawValue === 'auto' ? 'auto' : px(rawValue);
      if (!value) return null;

      const prefix = kind === 'p' ? 'padding' : 'margin';

      if (!side) return [{ prop: prefix, value }];

      const propMap = {
        t: `${prefix}Top`,
        r: `${prefix}Right`,
        b: `${prefix}Bottom`,
        l: `${prefix}Left`,
        x: null,
        y: null,
      };

      if (side === 'x') {
        return [
          { prop: `${prefix}Left`, value },
          { prop: `${prefix}Right`, value },
        ];
      }
      if (side === 'y') {
        return [
          { prop: `${prefix}Top`, value },
          { prop: `${prefix}Bottom`, value },
        ];
      }

      return [{ prop: propMap[side], value }];
    }
  }

  return null;
}

/**
 * Scans `root` for elements containing `chai-*` classes, parses and applies them.
 * @param {ParentNode} root
 * @param {{removeClasses?: boolean}} options
 */
export function applyChaiUtilities(root = document, options = {}) {
  const removeClasses = options.removeClasses !== false;
  if (!root || typeof root.querySelectorAll !== 'function') return;

  const elements = root.querySelectorAll?.('[class*="chai-"]') ?? [];

  for (const el of elements) {
    const chaiClasses = Array.from(el.classList).filter((cls) => cls.startsWith('chai-'));
    if (!chaiClasses.length) continue;

    for (const cls of chaiClasses) {
      const declarations = parseChaiClass(cls);
      if (!declarations) continue;

      // Ensure border-style exists if we set border width/color.
      const touchesBorder = declarations.some((d) => d.prop.startsWith('border') && d.prop !== 'borderStyle');
      if (touchesBorder) ensureBorderStyle(el);

      setStyleDeclarations(el, declarations);
    }

    if (removeClasses) {
      for (const cls of chaiClasses) el.classList.remove(cls);
    }
  }
}

// Optional: allow calling from the console.
if (typeof window !== 'undefined') {
  window.applyChaiUtilities = applyChaiUtilities;
}

