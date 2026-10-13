# Brand Design Tokens & Asset Guidelines: GPT with Taste

## 1. Identity Core

- **Brand Name**: GPT with Taste
- **Slug**: `gpt-with-taste`
- **Primary Tagline**: *Better judgment. Better taste. Less ceremony.*
- **Chinese Tagline**: *敢做判断。保有审美。少些繁文礼节。*
- **Positioning**: Drop-in system behavioral instructions for OpenAI Codex, helping GPT models (specifically GPT-6.1 Sol and GPT-6 Astra) make ordinary decisions, absorb complexity, and drop defensive hedging.

---

## 2. Color Palette & Visual Tokens

The aesthetic is editorial letterpress — warm paper, ink, one vermilion accent — rather than generic AI neon gradients.

| Token Name | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `surface-canvas` | `#FBF9F5` (Warm Cream) | `#0D1117` (Deep Obsidian) | Canvas background for SVGs and banners |
| `border-card` | `#E6E2D8` (Warm Muted) | `#30363D` (Subtle Steel) | Outer canvas framing lines |
| `rule-header` | `#D8D2C2` (Aged Paper) | `#30363D` (Subtle Steel) | Header rule under lane titles |
| `border-subtle` | `#F0EDE4` (Whisper) | `#21262D` (Muted Dark) | Row dividers in the comparison ledger |
| `instrument` | `#CFC8B8` (Pencil) | `#39414B` (Graphite) | Brand mark ring and crosshairs |
| `text-primary` | `#1C1E21` (Ink) | `#F0F6FC` (Soft Platinum) | Wordmark, masthead rules, after-lane text |
| `text-secondary` | `#5A606D` (Slate) | `#8B949E` (Muted Steel) | Kickers and before-lane text |
| `accent-primary` | `#C84824` (Warm Terracotta) | `#FF7B54` (Luminous Ochre) | Italic *Taste*, tagline stops, flourish, pivot |
| `accent-positive` | `#1D6B4F` (Forest Green) | `#56D39D` (Mint Emerald) | Taste lane header |
| `accent-caution` | `#824734` (Burnt Umber) | `#F0886C` (Salmon Orange) | Default-behavior lane header |

The vermilion accent is rationed: the italic *Taste*, the tagline's full stops, and the mark's flourish and pivot. Nothing else.

---

## 3. Typography Stack

All geometry and typography are self-contained; no external fonts are loaded. SVG text resolves against the viewer's system fonts through GitHub's Camo proxy.

- **Display (masthead wordmark)**: `Georgia, 'Times New Roman', serif` — regular weight, with *Taste* set in italic vermilion. The serif display line is what gives the facade its editorial identity; keep the rest of the system sans.
- **English UI & ledger**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Chinese UI & ledger**: `"PingFang SC", "Microsoft YaHei", -apple-system, sans-serif`
- **Kickers & lane headers**: the same sans, 11px, weight 700, letter-spacing 2.2–2.4px, all caps (Latin) or spaced CJK.
- **Model voice** (quoted default-behavior lines): Georgia italic, slate — a quotation, not an interface label.

---

## 4. Brand Mark: the Judgment Instrument

A drafting instrument reduced to four moves, drawn inside a 120-unit box centered on (60, 60):

- **Reference ring**: radius 44, stroke 2, dashed `2 7` with round caps, `instrument` color.
- **Crosshairs**: vertical `60,22 → 60,98` and horizontal `22,60 → 98,60`, stroke 1.5, `instrument`.
- **Taste flourish**: Bézier `M 44 74 C 52 68, 68 68, 76 46`, stroke 3.5, round caps, `accent-primary`.
- **Pivot and plumb dots**: pivot radius 5 in `accent-primary` at center; two radius-3 ink dots on the vertical axis at ±20.

In the masthead the instrument renders at ~134px, floating right like a printer's device. `logo.svg` carries the same geometry on a rounded square and self-adapts via `prefers-color-scheme`.

---

## 5. Masthead Composition (hero-banner-*.svg)

960×240 canvas, 64px side margins, three horizontal moves:

1. **Kicker row** (baseline y=54): left, the category in letterspaced caps (`SYSTEM INSTRUCTIONS FOR OPENAI CODEX` / `OPENAI CODEX 系统行为提示词`); right, the model line `GPT-6.1 SOL · GPT-6 ASTRA` in vermilion.
2. **Double rule**: 3px ink bar at y=66, 1px ink line at y=73 — the newspaper masthead cue.
3. **Wordmark and tagline**: `GPT with Taste` in 56px Georgia (baseline y=148); the fixed tagline in 19px semibold sans (baseline y=192), its three full stops set in vermilion.

The wordmark stays Latin in both languages; only the kicker and tagline localize. No dot patterns, no nested cards, no subtitles below the tagline.

---

## 6. Comparison Ledger (comparison-diagram-*.svg)

960×360 canvas, 64px side margins, one vertical hairline at x=480:

- Lane headers at baseline y=50: `DEFAULT BEHAVIOR` / `默认行为` in `accent-caution`, `GPT WITH TASTE` in `accent-positive`, letterspaced 11px caps.
- Five rows at baselines 100/154/208/262/316, hairline dividers between. Before lane: 14.5px regular `text-secondary` (a quoted line may use Georgia italic). After lane: 14.5px semibold `text-primary`.
- No stage numbers, no boxes around cells, no arrows. The contrast of weight and color carries the argument.

---

## 7. GitHub Asset Integration Rules

1. **Light / Dark Mode Pairing**:
   Use GitHub's standard `<picture>` element with media queries for banner and diagram assets:
   ```html
   <picture>
     <source media="(prefers-color-scheme: dark)" srcset="assets/hero-banner-dark.svg">
     <source media="(prefers-color-scheme: light)" srcset="assets/hero-banner-light.svg">
     <img alt="GPT with Taste" src="assets/hero-banner-light.svg" width="100%">
   </picture>
   ```
2. **Zero Remote Resources**:
   No external `<link>` fonts or remote badge tracking images. All geometry and typography are self-contained vector SVGs.

---

## 8. Case excerpt SVGs (case-*.svg)

960px-wide two-column excerpts put one comparison moment on the public surface. The asset must carry its evidence state with it:

- **Verified excerpts use complete source material.** Copy lines byte-exact from archived outputs; never turn a summary or agent reply into a quote.
- **Draft excerpts say so.** Candidate artifacts without the original full assistant messages use `DRAFT / UNVERIFIED` in the footnote and do not call their lines verbatim model output.
- **Highlight by weight and color alone.** Emphasis uses semibold plus `accent-caution` (default side) or `accent-positive` (Taste side); no strikethroughs or editorial marks on quoted text.
- **Symmetric typography.** Both columns share the same type scale so presentation does not decide the comparison.
- **Method footnote.** The bottom lines record model, effort, client, hooks state, prompt source, and the evidence boundary. The README prose stays focused on the reader.
- **Light/dark pair**, shipped as `case-<slug>-light.svg` and `case-<slug>-dark.svg`, wired through the same `<picture>` pattern as the banner.
