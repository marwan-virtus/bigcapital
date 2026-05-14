# Git workflow — `marwan-virtus/bigcapital` fork

How branching, remotes, and day-to-day git work in this fork of [`bigcapitalhq/bigcapital`](https://github.com/bigcapitalhq/bigcapital).

## TL;DR

- Two remotes: `origin` (your fork) and `upstream` (bigcapital).
- Two branches that matter: `develop` (active dev) and `main` (stable releases).
- Never edit `develop` directly. Work on `theme/*` or `feat/*` branches off it.
- To get new bigcapital changes: `git fetch upstream && git merge upstream/develop` while on `develop`.

---

## Remotes

```
origin     →  git@github.com:marwan-virtus/bigcapital.git    (your fork — read/write)
upstream   →  https://github.com/bigcapitalhq/bigcapital.git  (source — read-only in practice)
```

- **`origin`** — where you push your work. You own it.
- **`upstream`** — where you pull new bigcapital changes from. You don't have write access.

Inspect with `git remote -v`.

## Branches that matter in bigcapital

```
upstream/
├── main      ← stable. Tagged releases (v0.25.x). Production.
└── develop   ← active development. Bigcapital merges PRs here daily.
```

Build on `develop`, not `main`, to stay current.

## Local vs remote-tracking branches

`git branch -a` shows two kinds:

```
* develop                                   ← LOCAL branch (where you edit)
  remotes/upstream/develop                  ← snapshot of upstream's develop as of last fetch
  remotes/upstream/BIG-336-item-entries...  ← snapshot of someone's open PR branch upstream
```

The `remotes/upstream/*` entries are **read-only snapshots** that exist so you can compare or check them out. The long list of `BIG-xxx` branches is just upstream's open PR branches — ignore them.

## Initial setup (already done)

Documented for reference only. If you ever re-clone from scratch:

```bash
# Clone YOUR fork (not bigcapital's)
git clone git@github.com:marwan-virtus/bigcapital.git
cd bigcapital

# Add upstream
git remote add upstream https://github.com/bigcapitalhq/bigcapital.git

# Confirm
git remote -v
```

If you originally cloned bigcapital's repo (as we did), the conversion is:

```bash
git remote rename origin upstream
git remote add origin git@github.com:marwan-virtus/bigcapital.git
git push -u origin develop
```

## Everyday workflow

```bash
# 1. Get latest from bigcapital
git fetch upstream
git checkout develop
git merge upstream/develop          # bring bigcapital's new commits into your develop
git push origin develop             # mirror them to your fork

# 2. Start a feature
git checkout -b theme/dark-mode-tokens

# 3. Work, commit
git add packages/webapp/src/style/_variables.scss
git commit -m "feat(theme): add VV dark palette tokens"

# 4. Push to your fork
git push -u origin theme/dark-mode-tokens

# 5. (Optional) Open a PR
#    - within your fork:  theme/dark-mode-tokens → develop
#    - to bigcapital:     marwan-virtus:theme/... → bigcapitalhq:develop
```

## Branch naming

Upstream uses `BIG-<ticket>-<slug>`. To avoid ticket-number collisions, use semantic prefixes on your fork:

| Prefix | For |
|---|---|
| `theme/<topic>` | Theme / styling work |
| `feat/<topic>` | New functionality |
| `fix/<topic>` | Bug fixes |
| `chore/<topic>` | Tooling, deps, build |

## How `develop` tracks after the first push

```bash
git push -u origin develop
```

The `-u` (upstream) flag sets your local `develop` to track `origin/develop` (your fork). After this:

- `git pull` → pulls from **your fork** (not bigcapital).
- To pull bigcapital's new commits, you explicitly run `git fetch upstream && git merge upstream/develop`.

This is the convention most teams use. If you'd rather have `git pull` grab bigcapital's commits directly, run:

```bash
git branch --set-upstream-to=upstream/develop develop
```

…but then `git push` won't have a default target and you'll need `git push origin develop` explicitly.

## Where your changes live at each step

```
   LOCAL                       ORIGIN                     UPSTREAM
   (laptop)                    (marwan-virtus)            (bigcapitalhq)

   develop  ────push───►       develop

   theme/x  ────push───►       theme/x

                               develop  ◄──merge──── PR (if contributing back)

   develop  ◄──merge──── upstream/develop  ◄──fetch──── develop
```

## Keeping a feature branch up to date

If `develop` moves while you're working on `theme/dark-mode-tokens`:

```bash
# Option A — merge develop in (preserves history, adds a merge commit)
git checkout theme/dark-mode-tokens
git merge develop

# Option B — rebase onto develop (cleaner linear history, rewrites commits)
git checkout theme/dark-mode-tokens
git rebase develop
git push --force-with-lease origin theme/dark-mode-tokens   # required after rebase
```

Use **merge** if you've already pushed and shared the branch; **rebase** is fine for solo branches you haven't shared.

## Common situations

### "I want to try someone's open PR locally"

```bash
git fetch upstream
git checkout -b try-BIG-336 upstream/BIG-336-item-entries-select-warehouse
```

### "Upstream changed and now I have conflicts"

```bash
git fetch upstream
git checkout develop
git merge upstream/develop
# fix conflicts in your editor
git add <files>
git commit
git push origin develop
```

### "I accidentally committed to develop"

```bash
# Move the latest commit to a new branch, reset develop to upstream
git branch theme/oops
git reset --hard upstream/develop
git checkout theme/oops
```

## Issues and notifications

Forking syncs **code**, not issues. To stay informed about bigcapital's roadmap:

- Go to https://github.com/bigcapitalhq/bigcapital
- Click **Watch** (top right) → **Custom** → check `Issues`, `Releases`, `Discussions`

Your fork has its own Issues tab, separate from upstream.

## What NOT to do

- ❌ Don't push to `upstream` (you don't have permission, but also don't try to get it for stray commits).
- ❌ Don't force-push `develop` after it's been pushed — you'll diverge from upstream's history.
- ❌ Don't commit `.env`, `node_modules`, or `.superpowers/` — all gitignored.
- ❌ Don't merge `main` into `develop` (that's backwards — releases flow develop → main).
