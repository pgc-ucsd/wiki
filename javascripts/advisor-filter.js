/* Progressive enhancement for the advisor directory table.
 *
 * The table itself stays an ordinary Markdown table in index.md, so a
 * maintainer can add or edit a row without touching any code. This script
 * finds that table at runtime, derives the filter facets from the
 * "Research area" and "Title" columns, and adds a search box, filter chips
 * and a scroll container.
 *
 * If this script fails to load, the page still shows the complete table.
 * Nothing here is required to read the data.
 *
 * Facet rules, derived from the column text:
 *   methods   - the words "Theory" and/or "Experiment" anywhere in the area
 *   subfields - what remains after removing those words, split on "/"
 *   dual      - anything in parentheses in the Title column, e.g. (A&A)
 *   emeritus  - the word "Emeritus" in the Title column
 */
(function () {
  "use strict";

  function findTable() {
    return Array.from(document.querySelectorAll(".md-typeset table")).find(function (t) {
      var head = Array.from(t.querySelectorAll("thead th")).map(function (th) {
        return th.textContent.trim().toLowerCase();
      });
      return head[0] === "advisor" && head.indexOf("research area") !== -1;
    });
  }

  function parseRow(tr) {
    var cells = tr.querySelectorAll("td");
    if (cells.length < 3) return null;
    var title = cells[1].textContent.trim();
    var area = cells[2].textContent.trim();

    var methods = ["Theory", "Experiment"].filter(function (m) {
      return new RegExp("\\b" + m + "\\b").test(area);
    });
    var subfields = area
      .replace(/\b(Theory|Experiment)\b/g, "")
      .split("/")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    var dual = (title.match(/\(([^)]+)\)/g) || []).map(function (d) {
      return d.slice(1, -1).trim();
    });

    return {
      el: tr,
      name: cells[0].textContent.trim().toLowerCase(),
      subfields: subfields,
      methods: methods,
      dual: dual,
      emeritus: /Emeritus/i.test(title),
      reviewed: !!cells[0].querySelector("a")
    };
  }

  function chip(label, group, value) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "adv-chip";
    b.textContent = label;
    b.setAttribute("aria-pressed", "false");
    b.dataset.group = group;
    b.dataset.value = value;
    return b;
  }

  function init() {
    var table = findTable();
    if (!table || table.dataset.advFilter === "on") return;
    table.dataset.advFilter = "on";

    var rows = Array.from(table.querySelectorAll("tbody tr")).map(parseRow).filter(Boolean);
    if (!rows.length) return;

    var uniq = function (arr) {
      return Array.from(new Set(arr)).sort(function (a, b) { return a.localeCompare(b); });
    };
    var subfields = uniq(rows.reduce(function (a, r) { return a.concat(r.subfields); }, []));
    var methods = uniq(rows.reduce(function (a, r) { return a.concat(r.methods); }, []));
    var duals = uniq(rows.reduce(function (a, r) { return a.concat(r.dual); }, []));

    // ---- build the toolbar -------------------------------------------------
    var bar = document.createElement("div");
    bar.className = "adv-filter";

    var search = document.createElement("input");
    search.type = "search";
    search.className = "adv-search";
    search.placeholder = "Search advisors by name…";
    search.setAttribute("aria-label", "Search advisors by name");
    bar.appendChild(search);

    function group(label, values, name) {
      if (!values.length) return null;
      var wrap = document.createElement("div");
      wrap.className = "adv-group";
      var lab = document.createElement("span");
      lab.className = "adv-group__label";
      lab.textContent = label;
      wrap.appendChild(lab);
      values.forEach(function (v) { wrap.appendChild(chip(v, name, v)); });
      bar.appendChild(wrap);
      return wrap;
    }

    group("Subfield", subfields, "subfield");
    group("Type", methods, "method");
    group("Joint appointment", duals, "dual");

    var extras = document.createElement("div");
    extras.className = "adv-group";
    var lab = document.createElement("span");
    lab.className = "adv-group__label";
    lab.textContent = "Also";
    extras.appendChild(lab);
    extras.appendChild(chip("Hide emeritus", "flag", "active"));
    extras.appendChild(chip("Has reviews", "flag", "reviewed"));
    bar.appendChild(extras);

    var status = document.createElement("p");
    status.className = "adv-status";
    status.setAttribute("role", "status");

    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "adv-reset";
    reset.textContent = "Clear filters";
    reset.hidden = true;

    // ---- filtering ---------------------------------------------------------
    function selected(groupName) {
      return Array.from(bar.querySelectorAll('.adv-chip[data-group="' + groupName + '"][aria-pressed="true"]'))
        .map(function (b) { return b.dataset.value; });
    }

    function apply() {
      var q = search.value.trim().toLowerCase();
      var subs = selected("subfield");
      var meths = selected("method");
      var dls = selected("dual");
      var flags = selected("flag");
      var shown = 0;

      rows.forEach(function (r) {
        var ok =
          (!q || r.name.indexOf(q) !== -1) &&
          (!subs.length || subs.some(function (s) { return r.subfields.indexOf(s) !== -1; })) &&
          (!meths.length || meths.some(function (m) { return r.methods.indexOf(m) !== -1; })) &&
          (!dls.length || dls.some(function (d) { return r.dual.indexOf(d) !== -1; })) &&
          (flags.indexOf("active") === -1 || !r.emeritus) &&
          (flags.indexOf("reviewed") === -1 || r.reviewed);
        r.el.hidden = !ok;
        if (ok) shown++;
      });

      var filtering = q || subs.length || meths.length || dls.length || flags.length;
      status.textContent = filtering
        ? "Showing " + shown + " of " + rows.length + " faculty"
        : rows.length + " faculty";
      reset.hidden = !filtering;
    }

    bar.addEventListener("click", function (e) {
      var b = e.target.closest(".adv-chip");
      if (!b) return;
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
      apply();
    });
    search.addEventListener("input", apply);
    reset.addEventListener("click", function () {
      search.value = "";
      bar.querySelectorAll('.adv-chip[aria-pressed="true"]').forEach(function (b) {
        b.setAttribute("aria-pressed", "false");
      });
      apply();
    });

    // ---- insert, and wrap the table in a scroll container ------------------
    var scroller = document.createElement("div");
    scroller.className = "adv-scroll";
    table.parentNode.insertBefore(scroller, table);
    scroller.appendChild(table);

    scroller.parentNode.insertBefore(bar, scroller);
    var meta = document.createElement("div");
    meta.className = "adv-meta";
    meta.appendChild(status);
    meta.appendChild(reset);
    scroller.parentNode.insertBefore(meta, scroller);

    apply();
  }

  // Material replaces page content on navigation without a full reload, so
  // hook its document observable when present and fall back otherwise.
  if (typeof window.document$ !== "undefined" && window.document$.subscribe) {
    window.document$.subscribe(init);
  } else if (document.readyState !== "loading") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
