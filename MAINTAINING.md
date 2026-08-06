# Maintaining this wiki

Written for whoever inherits this. You do not need to know anything about
MkDocs, Python, or GitHub Actions to keep it running. Read section 1 and stop
if all you need is to fix a typo.

- **Live site:** https://pgc-ucsd.github.io/wiki/
- **Repository:** https://github.com/pgc-ucsd/wiki
- **Organization owners:** _fill in current names and emails here, and update
  this line whenever ownership changes._

There should be **at least two** org owners at all times. If you are the only
one, add another today: Organization Settings → People → invite → role: Owner.

---

## 1. Small edits need no local install

Every page on the live site has a pencil icon at the top right. It
opens that page's Markdown file in GitHub's web editor.

1. Click the pencil icon.
2. Edit the text.
3. Scroll down, write a one-line description of what you changed, commit to
   `main`.

That is the entire process. The site rebuilds itself and the change is live in
a minute or two. You can watch it happen under the repo's **Actions** tab.

To add a whole new page from the browser: go to the repo, navigate into
`docs/`, click **Add file → Create new file**, and name it something ending in
`.md`. It appears in the sidebar automatically.

---

## 2. Local setup (for bigger changes)

Worth doing if you are restructuring several pages and want to preview before
publishing.

```bash
git clone git@github.com:pgc-ucsd/wiki.git
cd wiki
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
mkdocs serve
```

Open <http://127.0.0.1:8000>. The preview reloads as you save files.

Before pushing, confirm the build is clean:

```bash
mkdocs build --strict
```

`--strict` turns warnings into errors, which is what CI effectively does. If it
passes locally it will pass there.

---

## 3. How the content is organized

```
docs/
  .nav.yml            <- sidebar section order and labels
  index.md            <- site home page
  coursework/
    index.md          <- section landing page
  research/
    index.md
  teaching/
    index.md
  student-life/
    index.md
  onboarding/
    index.md
    timeline.md
  resources/
    index.md
  about/
    index.md
```

- **Adding a page = adding a `.md` file.** Drop it in the right folder and it
  appears in the sidebar, sorted alphabetically by filename. No config to edit.
- **A folder's `index.md` is its landing page.** Every folder needs one.
- **Link to files, not directories.** Write
  `[Onboarding](../onboarding/index.md)`, never `[Onboarding](../onboarding/)`.
  The second form builds but emits warnings and fails `--strict`.
- **Cross-link between sections freely.** This is a wiki, not a strict
  hierarchy — the Teaching page pointing at Resources is normal and good. Use
  relative paths (`../resources/index.md`) and anchors
  (`../resources/index.md#funding`). `--strict` catches links you break.

### Adding or renaming a whole section

Only this needs a config edit. `docs/.nav.yml` sets the order of the top-level
sections and their sidebar labels:

```yaml
nav:
  - index.md
  - Coursework: coursework
  - Research: research
  ...
```

Add a new folder with an `index.md`, then add a `Label: folder-name` line in
the position you want. Sections left out of `.nav.yml` get appended at the end.

Labels come from this file, not from the page's `# Heading` — a folder named
`student-life` would otherwise show up as "Student life".

To control page order *within* a section, drop a `.nav.yml` into that folder
listing its filenames in order.

### Formatting conventions

The pages in `docs/` demonstrate all of these; copy from them.

- `!!! note`, `!!! tip`, `!!! warning`, `!!! danger` — callout boxes.
- `??? note` — the same thing, collapsed by default.
- Front matter `search: boost: 2` — raises a page in search results.
- Tables, task lists, definition lists, footnotes all work.

### Files and images

- **Compress images before committing.** A 6 MB phone photo stays in the git
  history forever, even if you delete the file later.
- **Do not commit large PDFs.** Put them in Google Drive and link to them.
  Hard limits: 100 MB per file, ~1 GB per repository.

---

## 4. How deployment works

Pushing to `main` triggers `.github/workflows/ci.yml`, which installs the
dependencies, runs `mkdocs gh-deploy --force`, and pushes the built HTML to the
`gh-pages` branch. GitHub Pages serves that branch.

**Never edit the `gh-pages` branch by hand.** Every deploy overwrites it
completely. All real content lives in `docs/` on `main`.

You can also trigger a rebuild manually: Actions tab → `ci` workflow → **Run
workflow**.

---

## 5. Troubleshooting

**The site 404s, but the Actions run was green.**
Settings → Pages → Source must be **Deploy from a branch**, branch `gh-pages`,
folder `/ (root)`. This is by far the most common cause. Note that the branch is
not selectable until the first successful deploy has created it.

**The workflow does not run at all.**
Settings → Actions → General → confirm Actions are enabled for the repo.
Transferring a repo between accounts sometimes resets this.

**The build fails after months of nobody touching it.**
Dependency drift. Update and re-pin:

```bash
source .venv/bin/activate
pip install --upgrade mkdocs-material
pip freeze > requirements.txt
mkdocs build --strict          # test locally first
git commit -am "Update dependencies" && git push
```

**A page does not appear in the sidebar.**
It is missing the `.md` extension, or it is outside `docs/`. If a whole
*section* is missing or in the wrong position, check `docs/.nav.yml`.

**Edit pencil goes to the wrong place.**
`edit_uri` in `mkdocs.yml` assumes the default branch is `main`.

---

## 6. Things that will break this — don't do them

**Do not make the repository private.** GitHub's free plan only serves Pages
from public repos. Making it private silently kills the live site. Corollary:
nothing sensitive goes in this repo, ever. No member rosters, no finances.

**Do not remove the `mkdocs<2` pin in `requirements.txt`.** MkDocs 2.0 is a
breaking rewrite — the plugin system was removed, theming was rewritten, and
there is no migration path. Material does not support it. A future maintainer
"modernizing" this pin will break the build with no obvious way back. Keep the
comment explaining why.

**Do not let the org drop below two owners.** If the sole owner graduates and
loses access to their account, recovering the organization is painful.

---

## 7. Design decisions worth knowing

Recorded so a successor does not re-litigate them:

- **Why MkDocs and not Notion / a Google Site?** This wiki is edited a couple
  of times a year by a couple of people. Frictionless casual editing is worth
  little at that frequency; version history that answers "what changed since
  last year and why" is worth a lot. There is also nothing to renew and no
  account that can lapse.
- **Why no custom domain?** One more thing to pay for and renew. The
  `github.io` URL never expires.
- **Why no fancier search?** Material's built-in search is fine at this scale.
  If the wiki ever grows past a few hundred pages, [Pagefind](https://pagefind.app/)
  is the upgrade path — it runs after `mkdocs build` and needs no server. Do
  not add it preemptively.
