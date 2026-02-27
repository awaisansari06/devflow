/**
 * Visual Editor Injection Script
 *
 * This module exports a string of JavaScript that gets injected into the
 * preview iframe via postMessage → eval. It enables:
 *   1. Hover highlights on elements
 *   2. Click-to-select with computed style extraction
 *   3. Live style/text updates from the parent
 *   4. Clean teardown
 */

/**
 * Returns the JS source code to inject into the iframe.
 * The parent communicates with the iframe via postMessage.
 *
 * Protocol (parent → iframe):
 *   { type: "enable-editor" }
 *   { type: "disable-editor" }
 *   { type: "apply-style", property: string, value: string }
 *   { type: "apply-text", value: string }
 *
 * Protocol (iframe → parent):
 *   { type: "element-selected", data: { selector, tagName, text, styles, rect } }
 *   { type: "editor-ready" }
 */
export function getVisualEditorScript(): string {
    return `
(function() {
  // Prevent double-injection
  if (window.__devflow_editor_active) return;
  window.__devflow_editor_active = true;

  let selectedEl = null;
  let hoverEl = null;

  // ─── Overlay Elements ───────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = '__devflow-hover-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    pointerEvents: 'none',
    border: '2px solid #6366f1',
    borderRadius: '4px',
    background: 'rgba(99,102,241,0.08)',
    zIndex: '999998',
    transition: 'all 0.1s ease',
    display: 'none',
  });
  document.body.appendChild(overlay);

  const selectOverlay = document.createElement('div');
  selectOverlay.id = '__devflow-select-overlay';
  Object.assign(selectOverlay.style, {
    position: 'fixed',
    pointerEvents: 'none',
    border: '2px solid #f59e0b',
    borderRadius: '4px',
    background: 'rgba(245,158,11,0.10)',
    zIndex: '999999',
    display: 'none',
  });
  document.body.appendChild(selectOverlay);

  // ─── Helpers ────────────────────────────────────────────────
  function positionOverlay(el, overlayDiv) {
    const rect = el.getBoundingClientRect();
    Object.assign(overlayDiv.style, {
      top: rect.top + 'px',
      left: rect.left + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px',
      display: 'block',
    });
  }

  function getCssSelector(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    const parts = [];
    let current = el;
    while (current && current !== document.body && current !== document.documentElement) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector = '#' + CSS.escape(current.id);
        parts.unshift(selector);
        break;
      }
      if (current.className && typeof current.className === 'string') {
        const cls = current.className.trim().split(/\\s+/).filter(c => !c.startsWith('__devflow')).slice(0, 2);
        if (cls.length) selector += '.' + cls.map(c => CSS.escape(c)).join('.');
      }
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
        if (siblings.length > 1) {
          const idx = siblings.indexOf(current) + 1;
          selector += ':nth-of-type(' + idx + ')';
        }
      }
      parts.unshift(selector);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  function getComputedProps(el) {
    const cs = getComputedStyle(el);
    return {
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontFamily: cs.fontFamily,
      padding: cs.padding,
      margin: cs.margin,
      borderRadius: cs.borderRadius,
      borderColor: cs.borderColor,
      textAlign: cs.textAlign,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      opacity: cs.opacity,
    };
  }

  // ─── Event Handlers ─────────────────────────────────────────
  function onMouseMove(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === overlay || el === selectOverlay) return;
    if (el === hoverEl) return;
    hoverEl = el;
    positionOverlay(el, overlay);
  }

  function onMouseLeave() {
    overlay.style.display = 'none';
    hoverEl = null;
  }

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === overlay || el === selectOverlay) return;

    selectedEl = el;
    positionOverlay(el, selectOverlay);

    const rect = el.getBoundingClientRect();
    const data = {
      selector: getCssSelector(el),
      tagName: el.tagName.toLowerCase(),
      text: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
        ? el.textContent
        : null,
      className: el.className || '',
      styles: getComputedProps(el),
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    };

    window.parent.postMessage({ type: 'element-selected', data: data }, '*');
  }

  // ─── Message Handler (from parent) ─────────────────────────
  function onMessage(e) {
    const msg = e.data;
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'apply-style': {
        if (selectedEl && msg.property && msg.value !== undefined) {
          selectedEl.style[msg.property] = msg.value;
          positionOverlay(selectedEl, selectOverlay);
        }
        break;
      }
      case 'apply-text': {
        if (selectedEl && msg.value !== undefined) {
          selectedEl.textContent = msg.value;
          positionOverlay(selectedEl, selectOverlay);
        }
        break;
      }
      case 'apply-classname': {
        if (selectedEl && msg.value !== undefined) {
          selectedEl.className = msg.value;
          positionOverlay(selectedEl, selectOverlay);
        }
        break;
      }
      case 'disable-editor': {
        teardown();
        break;
      }
    }
  }

  // ─── Setup & Teardown ──────────────────────────────────────
  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('mouseleave', onMouseLeave, true);
  document.addEventListener('click', onClick, true);
  window.addEventListener('message', onMessage);

  // Block right-click context menu in edit mode
  document.addEventListener('contextmenu', function preventCtx(e) { e.preventDefault(); }, true);

  function teardown() {
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('mouseleave', onMouseLeave, true);
    document.removeEventListener('click', onClick, true);
    window.removeEventListener('message', onMessage);
    overlay.remove();
    selectOverlay.remove();
    window.__devflow_editor_active = false;
  }

  window.parent.postMessage({ type: 'editor-ready' }, '*');
})();
`;
}
