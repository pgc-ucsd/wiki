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

### "Last updated" dates

Every page shows a last-updated date at the bottom. It is read from that file's
git history automatically — **never type a date into a page by hand**, it will
go stale and contradict the real one.

The date reflects the last commit that touched that specific file, so editing
one page does not restamp the others. Fixing a typo does bump it, which is
usually what you want on a reference wiki: the date answers "has anyone looked
at this recently?"

This depends on CI cloning the full git history — see `fetch-depth: 0` in
`.github/workflows/ci.yml`. If dates ever all show the same recent day, that
setting was removed.

### Advisor reviews — maintainer workflow

`docs/research/advisors/` holds student accounts of working with particular
faculty. **Students never edit these pages themselves.** They submit through a
form; a maintainer transcribes. That indirection is the entire point: it keeps
the submitter's GitHub account off the commit.

**Set the form up correctly.** On a UCSD Workspace account, Google Forms
defaults will record who submitted. Before sharing the link, turn **off**:

- Collect email addresses
- Restrict responses to users in your organization
- Limit to 1 response

Any of these forces sign-in and logs the submitter, which would leave you
holding a permanent record of who said what about whom.

**Transcribing a review.**

1. Check it against the ground rules on `docs/research/advisors/index.md` —
   behavior not character, first-hand only, no misconduct allegations, nobody
   named but the advisor. Edit or reject; you are the publisher of what you
   commit.
2. If the advisor has no page yet, create `docs/research/advisors/<surname>.md`
   from the template below. Pages are created **on demand** — do not scaffold
   empty pages for every faculty member.
3. Add the entry with the term it was submitted.
4. Link the name in the directory table on the section index.

**Page template:**

```markdown
# Firstname Lastname — Research Area

## At a glance

| | |
| --- | --- |
| Group size | ~N grad students, N postdocs |
| Meeting cadence | Weekly 1:1; weekly group meeting |
| Funding | GSR from year 2; historically stable |
| Style | Hands-on early, independent later |

## In students' words

!!! quote "4th-year · Spring 2026"
    The review text, a paragraph or two, in the student's own words.

!!! quote "2nd-year · Fall 2025"
    A second account, which may disagree with the first.
```

Use `!!! quote`, not a plain paragraph or a bare `>` blockquote. It renders as
a boxed callout with a quote icon, so a reader can never mistake one student's
opinion for the wiki's own editorial voice. The title carries the attribution
and the term.

Once a page holds more than about six accounts, change `!!!` to `???` on the
older ones — identical syntax, but they render collapsed, with the attribution
still visible in the header.

**Editorial judgment worth exercising:**

- **Small groups deanonymize.** If an advisor has one or two students, consider
  dropping the year-level from the attribution, or holding the review until a
  second one arrives so neither stands alone. Tell the submitter what you did.
- **Date every entry.** An undated review is worse than none.
- **Removal requests.** Deleting the text from the page does *not* remove it
  from git history. Honest answer: you can remove it from the live site
  immediately, but scrubbing history means a rewrite and force-push. Do not
  promise more than that.

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

**Every page suddenly shows the same "last updated" date.**
CI is doing a shallow clone. Restore `fetch-depth: 0` under the checkout step
in `.github/workflows/ci.yml`.

**I edited a page and nothing changed in the preview.**
Check which file you edited. Everything you write lives in `docs/` as `.md`.
The `site/` folder is generated output — `mkdocs serve` builds from `docs/`
into a temporary directory and never reads `site/`, and `mkdocs build` erases
and recreates the whole folder. Edits made to `site/**/*.html` cannot appear
and will be silently destroyed on the next build. `site/` is gitignored for
this reason; if your editor keeps opening files there, close them.

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
