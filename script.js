import { applyChaiUtilities } from "./chai-engine.js";

window.addEventListener("DOMContentLoaded", () => {
  // Default: remove chai-* classes after applying inline styles.
  applyChaiUtilities(document, { removeClasses: true });

  const reapplyBtn = document.getElementById("reapply");
  if (reapplyBtn) {
    reapplyBtn.addEventListener("click", () => {
      // Re-scan so users can add new chai-* classes and see them applied.
      applyChaiUtilities(document, { removeClasses: true });
    });
  }
});

