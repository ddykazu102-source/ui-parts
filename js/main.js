(() => {
  "use strict";

  // year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ===== Search / Filter =====
  const search = document.getElementById("search");
  const filter = document.getElementById("filter");
  const parts  = Array.from(document.querySelectorAll(".part"));

  function applyListFilter(){
    const q = (search?.value || "").trim().toLowerCase();
    const cat = filter?.value || "all";

    parts.forEach(el => {
      const title = (el.dataset.title || "").toLowerCase();
      const c = el.dataset.cat || "all";

      const okQ = !q || title.includes(q);
      const okC = (cat === "all") || (c === cat);

      el.style.display = (okQ && okC) ? "" : "none";
    });
  }
  if (search) search.addEventListener("input", applyListFilter);
  if (filter) filter.addEventListener("change", applyListFilter);

  // ===== Accordion =====
  document.querySelectorAll("[data-accordion]").forEach(acc => {
    const btns = acc.querySelectorAll(".acc__btn");
    btns.forEach((btn, i) => {
      const panel = btn.nextElementSibling;
      if (!panel) return;

      btn.addEventListener("click", () => {
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!isOpen));
        panel.hidden = isOpen;

        const icon = btn.querySelector(".acc__icon");
        if (icon) icon.textContent = isOpen ? "＋" : "?";
      });
    });
  });

  // ===== Modal (focus trap) =====
  let lastFocus = null;

  function getFocusable(root){
    return Array.from(root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
  }

  function openModal(modal){
    if (!modal) return;
    lastFocus = document.activeElement;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    const dialog = modal.querySelector(".modal__dialog");
    const focusables = dialog ? getFocusable(dialog) : [];
    (focusables[0] || dialog || modal).focus?.();

    document.body.style.overflow = "hidden";
  }

  function closeModal(modal){
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
    lastFocus?.focus?.();
  }

  // open buttons
  document.querySelectorAll("[data-open-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const sel = btn.getAttribute("data-open-modal");
      openModal(document.querySelector(sel));
    });
  });

  // close actions + backdrop
  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.hasAttribute("data-close-modal")) closeModal(modal);
    });

    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal(modal);

      // focus trap
      if (e.key === "Tab") {
        const dialog = modal.querySelector(".modal__dialog");
        if (!dialog) return;

        const f = getFocusable(dialog);
        if (f.length === 0) return;

        const first = f[0];
        const last = f[f.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  });

  // ===== Tabs =====
  document.querySelectorAll("[data-tabs]").forEach(tabs => {
    const tabBtns = Array.from(tabs.querySelectorAll("[data-tab]"));
    const panels  = Array.from(tabs.querySelectorAll("[data-panel]"));

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-tab");

        tabBtns.forEach(b => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });

        panels.forEach(p => {
          p.hidden = (p.getAttribute("data-panel") !== id);
        });
      });
    });
  });

  // ===== Toast =====
  const toastRoot = document.getElementById("toasts");
  function showToast(message){
    if (!toastRoot) return;

    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;

    toastRoot.appendChild(el);

    // auto remove
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(6px)";
      el.style.transition = "all 180ms ease";
      setTimeout(() => el.remove(), 200);
    }, 2000);
  }

  document.querySelectorAll("[data-toast]").forEach(btn => {
    btn.addEventListener("click", () => {
      showToast(btn.getAttribute("data-toast") || "完了しました");
    });
  });

  // ===== Copy =====
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const sel = btn.getAttribute("data-copy");
      const input = document.querySelector(sel);
      const hint = document.getElementById("copyHint");

      try{
        const text = input?.value ?? "";
        await navigator.clipboard.writeText(text);
        if (hint) hint.textContent = "コピーしました";
        showToast("コピーしました");
      }catch{
        if (hint) hint.textContent = "コピーに失敗しました";
        showToast("コピーに失敗しました");
      }
    });
  });
})();