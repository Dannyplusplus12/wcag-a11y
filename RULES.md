# WCAG A11y — Rule Reference

All 51 rules checked by the scanner, grouped by category. Each entry shows the rule ID, the WCAG success criterion it maps to, the conformance level (A / AA / AAA), the impact severity, and a plain-language explanation of what is checked, why it matters, and how to fix it.

**Impact levels:** `critical` → `serious` → `moderate` → `minor`

---

## Table of Contents

- [Text Alternatives](#text-alternatives)
- [Color & Contrast](#color--contrast)
- [Forms](#forms)
- [Keyboard Access](#keyboard-access)
- [ARIA](#aria)
- [Page Structure](#page-structure)
- [Links](#links)
- [Language](#language)
- [Media](#media)
- [Tables](#tables)

---

## Text Alternatives

Images and non-text elements need text descriptions so screen-reader users know what they convey.

---

### `img-alt`
**WCAG 1.1.1 · Level A · Critical**

**What it checks:** Every `<img>` must have an `alt` attribute.

**Why it matters:** Without `alt`, a screen reader either skips the image silently or reads out the raw file path (e.g. `"hero_banner_v3_final.jpg"`), which is useless or confusing.

**How to fix:**
- Meaningful image → describe what it shows: `alt="Team photo at the 2024 company retreat"`
- Decorative image → use an empty alt: `alt=""` (screen readers skip it entirely)

```html
<!-- bad -->
<img src="chart.png">

<!-- good - meaningful -->
<img src="chart.png" alt="Bar chart showing 40% increase in sales Q4 2024">

<!-- good - decorative -->
<img src="divider.png" alt="">
```

---

### `input-image-alt`
**WCAG 1.1.1 · Level A · Critical**

**What it checks:** `<input type="image">` (image buttons) must have an `alt` attribute.

**Why it matters:** These elements act as buttons. Without `alt`, a screen reader cannot announce what the button does — users cannot tell if they're submitting a form or doing something else entirely.

**How to fix:** Add `alt` that describes the action, not the image: `alt="Submit search"`, `alt="Log in"`.

```html
<!-- bad -->
<input type="image" src="search-btn.png">

<!-- good -->
<input type="image" src="search-btn.png" alt="Submit search">
```

---

### `svg-title`
**WCAG 1.1.1 · Level A · Serious**

**What it checks:** Inline `<svg>` elements that are not decorative must have a `<title>` child element or an `aria-label` / `aria-labelledby` attribute.

**Why it matters:** SVG icons are increasingly used as UI controls or illustrations. Without a name, a screen reader either skips them or reads out the raw SVG source code — neither is helpful.

**How to fix:**
- Meaningful SVG → add a `<title>` as the first child, and link it with `aria-labelledby`
- Decorative SVG → add `aria-hidden="true"` so screen readers ignore it

```html
<!-- bad -->
<svg viewBox="0 0 24 24"><path d="..."/></svg>

<!-- good - meaningful -->
<svg aria-labelledby="icon-title" role="img">
  <title id="icon-title">Download file</title>
  <path d="..."/>
</svg>

<!-- good - decorative -->
<svg aria-hidden="true" focusable="false"><path d="..."/></svg>
```

---

### `object-alt`
**WCAG 1.1.1 · Level A · Serious**

**What it checks:** `<object>` elements must have text content inside them as a fallback.

**Why it matters:** `<object>` is used to embed PDFs, Flash, and other media. If the object cannot be rendered (or is a screen reader), the inner text is what gets read. An empty `<object>` is invisible to assistive technology.

**How to fix:** Put a descriptive text alternative or a link to the content between the opening and closing `<object>` tags.

```html
<!-- bad -->
<object data="report.pdf" type="application/pdf"></object>

<!-- good -->
<object data="report.pdf" type="application/pdf">
  Annual report 2024 — <a href="report.pdf">Download PDF</a>
</object>
```

---

### `role-img-alt`
**WCAG 1.1.1 · Level A · Serious**

**What it checks:** Any element with `role="img"` must have an accessible name via `aria-label` or `aria-labelledby`.

**Why it matters:** Developers sometimes wrap icon fonts or `<div>` illustrations with `role="img"` to indicate they carry visual meaning. Without a name, the role is meaningless — the screen reader announces "image" with nothing to describe it.

**How to fix:** Add `aria-label` directly, or point to a visible label with `aria-labelledby`.

```html
<!-- bad -->
<span role="img" class="icon-star"></span>

<!-- good -->
<span role="img" aria-label="Favourite"></span>
```

---

### `image-redundant-alt`
**WCAG 1.1.1 · Level A · Minor**

**What it checks:** An image's `alt` text must not exactly repeat text that already appears as adjacent visible content (sibling text or a `<figcaption>`).

**Why it matters:** When the alt and the caption say the same thing, screen-reader users hear it twice in a row. It's the equivalent of writing the same sentence in a paragraph twice back-to-back.

**How to fix:** If a caption fully describes the image, use `alt=""` so the image is treated as decorative. If the image adds meaning the caption does not cover, write a distinct alt.

```html
<!-- bad - screen reader reads "Mountains at sunset" twice -->
<figure>
  <img src="mountains.jpg" alt="Mountains at sunset">
  <figcaption>Mountains at sunset</figcaption>
</figure>

<!-- good -->
<figure>
  <img src="mountains.jpg" alt="">
  <figcaption>Mountains at sunset</figcaption>
</figure>
```

---

## Color & Contrast

Text that does not have enough contrast against its background is hard to read for people with low vision or colour-blindness, and for everyone in bright sunlight.

---

### `color-contrast-text`
**WCAG 1.4.3 · Level AA · Serious**

**What it checks:** Normal-sized text (below 18 pt / 14 pt bold) must have a contrast ratio of at least **4.5 : 1** between the text colour and the background colour.

**Why it matters:** The WCAG contrast formula accounts for how the human eye perceives luminance. Ratios below 4.5:1 are statistically shown to be unreadable for a significant portion of users with even mild vision impairments.

**How to fix:** Use a contrast checker (e.g. [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)) and darken the text or lighten the background until the ratio is ≥ 4.5:1.

---

### `color-contrast-large-text`
**WCAG 1.4.3 · Level AA · Serious**

**What it checks:** Large text (18 pt / 24 px or larger, OR 14 pt bold / ~18.67 px bold) must have a contrast ratio of at least **3 : 1**.

**Why it matters:** Larger text is easier to read at lower contrast because the letter shapes are more distinguishable, so WCAG allows a relaxed threshold. However, a minimum still applies.

**How to fix:** Same as above — use a contrast checker. The 3:1 bar is easier to meet, but light-gray-on-white heading text will still fail it.

---

## Forms

Forms are one of the most heavily-used interactive patterns on the web. Poor labelling and error handling are among the most common accessibility failures found in real audits.

---

### `label-missing`
**WCAG 1.3.1 · Level A · Critical**

**What it checks:** Every `<input>` (except hidden/button types), `<textarea>`, and `<select>` must have a programmatically associated label via one of: a `<label for="...">`, wrapping `<label>`, `aria-label`, or `aria-labelledby`.

**Why it matters:** Without a label, a screen reader announces the element's type (e.g. "Edit, blank") but not its purpose. Users who rely on voice control also need the spoken label to target the field by name.

**How to fix:**

```html
<!-- bad -->
<input type="email" id="email">

<!-- good - explicit label -->
<label for="email">Email address</label>
<input type="email" id="email">

<!-- good - wrapping label -->
<label>
  Email address
  <input type="email">
</label>

<!-- good - aria-label when no visible label is possible -->
<input type="search" aria-label="Search site">
```

---

### `label-empty`
**WCAG 1.3.1 · Level A · Serious**

**What it checks:** `<label>` elements must have visible text content.

**Why it matters:** An empty `<label>` is technically associated with an input but announces nothing. A screen reader will say "Edit, blank" as if there were no label at all.

**How to fix:** Either add text, or if the label is visually hidden on purpose, use a `.sr-only` CSS class rather than an empty element.

---

### `error-identification`
**WCAG 3.3.1 · Level A · Serious**

**What it checks:** When an input has `aria-invalid="true"`, there must be an error message element linked to it via `aria-describedby`, and that message must have text content.

**Why it matters:** Sighted users see a red border or icon. Screen-reader users only know an error exists if it is announced. The `aria-describedby` link makes the error message read out automatically when the field is focused.

**How to fix:**

```html
<input id="email" type="email" aria-invalid="true" aria-describedby="email-error">
<p id="email-error" role="alert">Please enter a valid email address.</p>
```

---

### `autocomplete`
**WCAG 1.3.5 · Level AA · Moderate**

**What it checks:** Common personal-data fields (name, email, phone number) should have an `autocomplete` attribute with the appropriate token.

**Why it matters:** People with cognitive disabilities or motor impairments benefit greatly from browser auto-fill. Without `autocomplete`, the browser cannot confidently pre-fill the field, forcing users to re-type data they've entered hundreds of times before.

**How to fix:** Add the matching token: `autocomplete="name"`, `autocomplete="email"`, `autocomplete="tel"`.

---

### `input-button-name`
**WCAG 4.1.2 · Level A · Critical**

**What it checks:** `<input type="button">`, `<input type="submit">`, and `<input type="reset">` must have a non-empty `value` attribute, `aria-label`, or `aria-labelledby`.

**Why it matters:** The `value` attribute is what browser and screen readers display as the button's label. A button with no value is announced as "Button" with no indication of what it does.

**How to fix:** Always set `value`: `<input type="submit" value="Create account">`.

---

### `fieldset-legend`
**WCAG 1.3.1 · Level A · Moderate**

**What it checks:** Every `<fieldset>` must have a `<legend>` element with non-empty text (or an `aria-label` / `aria-labelledby` on the fieldset itself).

**Why it matters:** Fieldsets are used to group related controls (e.g. radio buttons for "Shipping method"). Without a legend, a screen reader reads each radio label in isolation — the user has no idea what the group is about. The legend text is prepended to each control's label: "Shipping method, Express, radio button 1 of 3."

**How to fix:**

```html
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email"> Email</label>
  <label><input type="radio" name="contact" value="phone"> Phone</label>
</fieldset>
```

---

### `form-field-required-label`
**WCAG 3.3.2 · Level A · Moderate**

**What it checks:** Form fields with the HTML `required` attribute should also have `aria-required="true"`.

**Why it matters:** The HTML `required` attribute is understood by modern browsers and screen readers, but `aria-required` provides a more explicit and widely-supported signal — particularly in older assistive technology. Both together guarantee the "required" state is always announced.

**How to fix:** Add `aria-required="true"` alongside `required` on any mandatory field.

```html
<input type="text" id="name" required aria-required="true">
```

---

## Keyboard Access

Keyboard-only users (including people who use switch controls, sip-and-puff devices, or simply prefer not to use a mouse) must be able to reach and operate every interactive element.

---

### `no-positive-tabindex`
**WCAG 2.4.3 · Level A · Serious**

**What it checks:** No element should have a `tabindex` value greater than `0`.

**Why it matters:** Positive tabindex values (`tabindex="1"`, `tabindex="2"`, etc.) create a custom tab order that overrides the natural document order. In practice, this almost always makes keyboard navigation confusing and unpredictable — users jump around the page in unexpected ways.

**How to fix:** Remove all positive tabindex values. Use `tabindex="0"` to make a non-interactive element focusable in document order, and `tabindex="-1"` to make it focusable programmatically only.

---

### `interactive-not-focusable`
**WCAG 2.1.1 · Level A · Critical**

**What it checks:** Non-semantic elements (`div`, `span`, `li`, `td`, `p`) that have an `onclick` attribute must also have a `role` attribute and a `tabindex`.

**Why it matters:** A click handler on a `<div>` is invisible to keyboard users — there is nothing to tab to, and pressing Enter does nothing. The element only works with a mouse.

**How to fix:** Either use a semantic `<button>` (which handles keyboard events and focus for free), or add `role="button"` and `tabindex="0"` and wire up `keydown` for Enter/Space.

```html
<!-- bad -->
<div onclick="doSomething()">Click me</div>

<!-- good -->
<button onclick="doSomething()">Click me</button>
```

---

### `skip-link`
**WCAG 2.4.1 · Level A · Moderate**

**What it checks:** The first focusable element on the page should be a skip link — an anchor pointing to `#main` (or similar) with text containing "skip", "main", or "content".

**Why it matters:** Pages typically repeat the same header and navigation on every load. Without a skip link, keyboard users must tab through every nav item on every page before they reach the content they came for. A skip link lets them bypass this with a single keypress.

**How to fix:** Add a visually-hidden skip link as the very first element in `<body>`. Make it visible on focus.

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<!-- ... navigation ... -->
<main id="main-content">...</main>
```

---

### `focus-visible`
**WCAG 2.4.7 · Level AA · Serious**

**What it checks:** Interactive elements (links, buttons, inputs, selects, textareas, `tabindex="0"` elements) must not have `outline: none` or `outline-width: 0` in their `:focus` styles.

**Why it matters:** When CSS removes the focus outline, keyboard users lose the visual cursor that tells them where they are on the page. Navigating by Tab becomes like browsing with an invisible mouse pointer.

**How to fix:** Never write `*:focus { outline: none }` globally. If the default browser outline looks wrong, replace it with a custom visible indicator — a thick border or box-shadow works well.

```css
/* bad */
:focus { outline: none; }

/* good */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
```

---

### `scrollable-region-focusable`
**WCAG 2.1.1 · Level A · Moderate**

**What it checks:** Container elements that overflow and scroll (via `overflow: auto` or `overflow: scroll`) must be reachable by keyboard — either by having `tabindex="0"` themselves, or by containing at least one natively focusable child.

**Why it matters:** If a scrollable box (e.g. a terms-and-conditions panel, a chat history, a code preview) has no keyboard-reachable point, keyboard users cannot scroll through its content. They see a partial view with no way to access the rest.

**How to fix:** Add `tabindex="0"` to the scrollable container so users can tab into it and scroll with arrow keys.

```html
<div style="overflow: auto; height: 200px;" tabindex="0">
  <!-- long content -->
</div>
```

---

### `accesskey-unique`
**WCAG 4.1.1 · Level A · Moderate**

**What it checks:** The `accesskey` attribute value must not be repeated on more than one element on the same page.

**Why it matters:** Duplicate access keys cause undefined behaviour — browsers pick one of the matching elements arbitrarily, and the other becomes unreachable via its shortcut. This confuses power users who rely on access keys.

**How to fix:** Assign each `accesskey` value to only one element per page. Audit all usages before adding new ones.

---

## ARIA

ARIA (Accessible Rich Internet Applications) attributes let developers communicate the role, state, and structure of custom widgets to assistive technology. Misused ARIA is often worse than no ARIA.

---

### `aria-valid-role`
**WCAG 4.1.2 · Level A · Critical**

**What it checks:** Every `role` attribute value must be a recognised ARIA role from the current specification.

**Why it matters:** An invalid role (e.g. `role="popup"`, `role="toggle"`) is silently ignored by screen readers. The element is exposed with no role, which can mislead users into thinking it has no interactive purpose.

**How to fix:** Use only roles from the ARIA specification: `button`, `dialog`, `listbox`, `menu`, `tab`, `tabpanel`, etc.

---

### `aria-required-attr`
**WCAG 4.1.2 · Level A · Critical**

**What it checks:** When a role requires specific ARIA attributes to be meaningful, those attributes must be present. For example, `role="checkbox"` needs `aria-checked`, `role="slider"` needs `aria-valuenow`.

**Why it matters:** A checkbox without `aria-checked` cannot announce whether it is checked or unchecked. The widget is broken from an accessibility perspective even if it looks fine visually.

**Required attributes by role:**
| Role | Required attributes |
|------|---|
| `checkbox` | `aria-checked` |
| `combobox` | `aria-expanded` |
| `option` | `aria-selected` |
| `radio` | `aria-checked` |
| `scrollbar` | `aria-controls`, `aria-valuenow` |
| `slider` | `aria-valuenow` |
| `spinbutton` | `aria-valuenow` |
| `switch` | `aria-checked` |

---

### `aria-hidden-focus`
**WCAG 4.1.2 · Level A · Serious**

**What it checks:** Elements with `aria-hidden="true"` must not be keyboard-focusable — they must not have a non-negative `tabindex` and must not be a natively focusable tag (`<a>`, `<button>`, `<input>`, etc.) without an explicit `tabindex="-1"`.

**Why it matters:** `aria-hidden` hides the element from the accessibility tree — screen readers skip it entirely. But if keyboard focus lands on a hidden element, the user hears nothing. The keyboard cursor appears to disappear into a black hole.

**How to fix:** Add `tabindex="-1"` to any focusable element inside an `aria-hidden` subtree, or remove `aria-hidden` if the element should be reachable.

---

### `button-name`
**WCAG 4.1.2 · Level A · Critical**

**What it checks:** Every `<button>` and every element with `role="button"` must have a non-empty accessible name — via text content, `aria-label`, or `aria-labelledby`.

**Why it matters:** Icon-only buttons (hamburger menus, close buttons, like buttons) frequently fail this rule. A screen reader announces "Button" with no indication of purpose, leaving users unable to determine what the button does.

**How to fix:**

```html
<!-- bad -->
<button><svg>...</svg></button>

<!-- good - aria-label -->
<button aria-label="Close dialog"><svg aria-hidden="true">...</svg></button>

<!-- good - visually hidden text -->
<button><svg aria-hidden="true">...</svg><span class="sr-only">Close dialog</span></button>
```

---

### `aria-required-children`
**WCAG 1.3.1 · Level A · Critical**

**What it checks:** Container widgets must contain the child roles they require. For example, a `role="listbox"` must contain `role="option"` elements; a `role="tablist"` must contain `role="tab"` elements.

**Why it matters:** ARIA widget patterns define required ownership relationships. A `listbox` with no `option` children is an empty container from an assistive-technology perspective — users cannot interact with it meaningfully.

**Required relationships:**
| Parent role | Required child roles |
|---|---|
| `listbox` | `option` |
| `radiogroup` | `radio` |
| `grid` | `row` or `rowgroup` |
| `menu` / `menubar` | `menuitem`, `menuitemcheckbox`, `menuitemradio` |
| `tablist` | `tab` |
| `tree` | `treeitem` |
| `treegrid` | `row` |

> Elements with `aria-busy="true"` are excluded (content is still loading).

---

### `aria-required-parent`
**WCAG 1.3.1 · Level A · Critical**

**What it checks:** Child roles that are only meaningful within a specific parent must be wrapped in that parent. For example, `role="option"` must be inside a `role="listbox"` or `role="combobox"`.

**Why it matters:** Orphaned ARIA children confuse assistive technology. A `role="tab"` outside a `role="tablist"` cannot be understood as part of a tab interface — the relationship that gives it meaning is missing.

**Required relationships:**
| Child role | Required parent roles |
|---|---|
| `option` | `listbox`, `combobox` |
| `tab` | `tablist` |
| `treeitem` | `tree`, `group` |
| `menuitem` / `menuitemcheckbox` / `menuitemradio` | `menu`, `menubar` |
| `gridcell` | `row` |
| `row` | `grid`, `rowgroup`, `treegrid` |
| `columnheader` / `rowheader` | `row` |

---

### `aria-prohibited-attr`
**WCAG 4.1.2 · Level A · Moderate**

**What it checks:** Elements with `role="presentation"` or `role="none"` must not carry ARIA semantic attributes such as `aria-label`, `aria-labelledby`, `aria-checked`, etc.

**Why it matters:** `role="presentation"` explicitly removes an element from the accessibility tree. Adding naming or state attributes to it is self-contradictory — the attributes signal meaning that the role then erases. The result is unpredictable across different assistive technologies.

**How to fix:** Remove the conflicting attributes, or reconsider whether `role="presentation"` is appropriate.

---

## Page Structure

Good structure lets screen-reader users understand the layout and skip around the page efficiently using headings and landmarks.

---

### `heading-order`
**WCAG 1.3.1 · Level A · Moderate**

**What it checks:** Heading levels must not skip numbers. Going from `<h1>` to `<h3>` (skipping `<h2>`) is a violation.

**Why it matters:** Screen-reader users navigate by headings the way sighted users scan a page visually. Skipped levels create a confusing outline — like a table of contents where chapter 1 jumps straight to section 1.3 with no 1.1 or 1.2.

**How to fix:** Use headings to reflect document structure, not to achieve font sizes. Use CSS for styling.

```html
<!-- bad -->
<h1>Page title</h1>
<h3>Section title</h3>  <!-- skips h2 -->

<!-- good -->
<h1>Page title</h1>
<h2>Section title</h2>
<h3>Subsection</h3>
```

---

### `page-title`
**WCAG 2.4.2 · Level A · Serious**

**What it checks:** The page must have a `<title>` element in `<head>` with non-empty text.

**Why it matters:** The page title is the first thing a screen reader announces when a page loads. It also appears in browser tabs and bookmarks. Without it, users have no quick way to identify what page they are on — especially critical when multiple tabs are open.

**How to fix:** Always include a descriptive `<title>` that names both the page and the site: `<title>Contact Us — Acme Corp</title>`.

---

### `landmark-one-main`
**WCAG 2.4.1 · Level A · Moderate**

**What it checks:** There must be exactly one `<main>` element (or `role="main"`) per page.

**Why it matters:** Screen-reader users use a "jump to main content" shortcut that relies on there being one unambiguous main landmark. Zero means the shortcut fails. Two or more means the shortcut lands arbitrarily on one of them.

**How to fix:** Wrap your primary page content in a single `<main>` tag. Layout wrappers, headers, footers, and sidebars should be outside it.

---

### `list-structure`
**WCAG 1.3.1 · Level A · Moderate**

**What it checks:** `<li>` elements must be direct children of `<ul>` or `<ol>`.

**Why it matters:** An `<li>` outside a list is invalid HTML that breaks the structural semantics. Screen readers expose list items as a numbered/bulleted group — that context is lost if the element is orphaned.

**How to fix:** Always wrap `<li>` inside `<ul>` or `<ol>`. Never use `<li>` as a generic block element.

---

### `region-landmark`
**WCAG 1.3.1 · Level A · Moderate**

**What it checks:** The page should contain at least a `<header>` (or `role="banner"`), a `<nav>` (or `role="navigation"`), and a `<main>` (or `role="main"`).

**Why it matters:** Landmarks are navigation signposts. Screen-reader users press a single key to jump between them. A page with no landmarks forces linear reading from top to bottom on every visit.

**How to fix:** Use semantic HTML5 elements — `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>` — which carry implicit landmark roles.

---

### `duplicate-id`
**WCAG 4.1.1 · Level A · Critical**

**What it checks:** No two elements on the same page may share the same `id` attribute value.

**Why it matters:** Many accessibility features depend on IDs being unique: `<label for="...">` binds to an input, `aria-labelledby` points to a label, `aria-describedby` points to an error message. When IDs are duplicated, the browser picks the first match — any later element with the same ID is effectively broken from an ARIA perspective.

**How to fix:** Generate unique IDs programmatically in dynamic content. Audit static HTML for copy-paste duplicates.

---

### `frame-title`
**WCAG 2.4.1 · Level A · Serious**

**What it checks:** Every `<iframe>` must have a non-empty `title` attribute (or `aria-label`).

**Why it matters:** When focus moves into an iframe, a screen reader announces the frame title before reading its contents. Without a title, the screen reader says "Frame" and enters an unidentified embedded document. Users have no idea whether it is a payment form, a video, an ad, or something else.

**How to fix:** `<iframe src="..." title="Payment form — Stripe">`. Be specific — "Frame" or "Content" is not helpful.

---

### `meta-viewport`
**WCAG 1.4.4 · Level AA · Critical**

**What it checks:** The `<meta name="viewport">` tag must not include `user-scalable=no` or set `maximum-scale` to less than `2`.

**Why it matters:** Many users with low vision rely on browser pinch-to-zoom to read text. Disabling zoom forces them to read text at whatever size the designer chose — often too small. This is one of the most impactful mobile accessibility failures.

**How to fix:** Remove `user-scalable=no` entirely. If you must limit scale, use `maximum-scale=5` or higher.

```html
<!-- bad -->
<meta name="viewport" content="width=device-width, user-scalable=no">
<meta name="viewport" content="width=device-width, maximum-scale=1.0">

<!-- good -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

---

### `marquee`
**WCAG 2.2.2 · Level A · Serious**

**What it checks:** `<marquee>` elements must not be used.

**Why it matters:** `<marquee>` causes content to scroll automatically with no way for the user to pause it. People with attention disorders, cognitive disabilities, or those who need more time to read cannot process moving text. The element is also deprecated in HTML5.

**How to fix:** Replace with static text, or use CSS animations with `prefers-reduced-motion` media query and a pause button if animation is required.

---

### `p-as-heading`
**WCAG 1.3.1 · Level A · Moderate**

**What it checks:** `<p>` elements styled with large font sizes (≥ 24 px) or large bold text (≥ 18 px at 700+ weight) are flagged as potentially misused headings.

**Why it matters:** Sighted users can see that a large bold paragraph looks like a heading. Screen-reader users navigate by heading shortcuts — if the "heading" is actually a `<p>`, it is invisible to that navigation technique and the page outline is broken.

**How to fix:** Use the correct heading element (`<h1>`–`<h6>`) for content that functions as a heading, and use CSS for visual styling.

```html
<!-- bad -->
<p style="font-size: 28px; font-weight: bold;">Section title</p>

<!-- good -->
<h2>Section title</h2>
```

---

## Links

Links must communicate their destination clearly and behave predictably.

---

### `link-name`
**WCAG 2.4.4 · Level A · Serious**

**What it checks:** Link text must not consist solely of vague phrases like "click here", "read more", "here", "more", "continue", "learn more", "download", "link", "go", or "tap".

**Why it matters:** Screen-reader users often browse a list of all links on the page out of context. "Click here" repeated 10 times provides no information about where any of the links lead. Descriptive link text is also better for SEO.

**How to fix:** Make the link text describe the destination or action: "Download the 2024 Annual Report (PDF)" rather than "Download".

---

### `link-empty`
**WCAG 2.4.4 · Level A · Critical**

**What it checks:** Every `<a href="...">` must have a non-empty accessible name — via text content, `aria-label`, `aria-labelledby`, or a child `<img>` with a non-empty `alt`.

**Why it matters:** An empty link is announced by screen readers as "Link" with no description. Users have no idea where it goes or what it does. This commonly happens with icon-only links where the icon has no text alternative.

**How to fix:**

```html
<!-- bad -->
<a href="/settings"><svg>...</svg></a>

<!-- good -->
<a href="/settings" aria-label="Settings"><svg aria-hidden="true">...</svg></a>
```

---

### `identical-links-different-purpose`
**WCAG 2.4.9 · Level AAA · Minor**

**What it checks:** Multiple links that share the same visible text or `aria-label` should point to the same URL.

**Why it matters:** When a screen-reader user browses the links list and sees "Read more" twice, they cannot tell whether both go to the same place or to different articles. If they go to different places, the links need distinct accessible names.

**How to fix:** Either make the link text unique ("Read more about our pricing", "Read more about our security") or use `aria-label` to provide distinct names while keeping the visual text short.

---

### `link-new-window-warn`
**WCAG 3.2.2 · Level A · Moderate**

**What it checks:** Links with `target="_blank"` or `target="_new"` (which open in a new tab or window) must signal this in their text, `aria-label`, or `title` attribute.

**Why it matters:** Unexpectedly opening a new tab disorients users — particularly those with cognitive disabilities who lose the context of where they were. Screen-reader users lose the ability to press the Back button since the original page is still open in the previous tab.

**How to fix:** Add a warning in the link text or aria-label: "Annual report (opens in new tab)". A small icon with appropriate alt text also works.

```html
<a href="/report.pdf" target="_blank">
  Annual report (opens in new tab)
</a>
```

---

## Language

Specifying the page language lets screen readers use the correct pronunciation engine for the content.

---

### `html-lang`
**WCAG 3.1.1 · Level A · Serious**

**What it checks:** The `<html>` element must have a `lang` attribute.

**Why it matters:** Screen readers switch pronunciation rules based on the declared language. Without `lang`, the reader uses the user's default language — potentially reading French text with English phonetics, making it incomprehensible.

**How to fix:** `<html lang="en">`. Use the appropriate BCP 47 language code for your content.

---

### `html-lang-valid`
**WCAG 3.1.1 · Level A · Serious**

**What it checks:** The `lang` attribute value must be a valid BCP 47 language tag (e.g. `en`, `en-US`, `fr`, `zh-Hant`).

**Why it matters:** An invalid tag (e.g. `lang="english"`, `lang="ENG"`) is ignored by assistive technology — the same effect as having no `lang` attribute at all.

**How to fix:** Use the correct 2- or 3-letter ISO 639 code, optionally followed by a region subtag: `en`, `en-GB`, `pt-BR`, `zh-TW`.

---

## Media

Audio and video content must have text equivalents for people who cannot hear or see the media.

---

### `video-captions`
**WCAG 1.2.2 · Level A · Critical**

**What it checks:** Every `<video>` element must have a `<track kind="captions">` or `<track kind="subtitles">` child element.

**Why it matters:** Captions are the primary way Deaf and hard-of-hearing users access video content. They also benefit users in noisy environments, non-native speakers, and anyone who watches without audio.

**How to fix:**

```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track src="captions.vtt" kind="captions" srclang="en" label="English">
</video>
```

---

### `audio-description`
**WCAG 1.2.3 · Level A · Serious**

**What it checks:** `<video>` elements should include a `<track kind="descriptions">` audio description track.

**Why it matters:** Audio descriptions narrate important visual information (action on screen, text overlays, scene changes) for blind users or anyone who cannot see the video. A talking-head video of a presentation without alt text for slides is inaccessible.

**How to fix:** Create a WebVTT file that describes key visual events and add it as a descriptions track, or provide a text transcript that covers both audio and visual content.

---

### `audio-transcript`
**WCAG 1.2.1 · Level A · Serious**

**What it checks:** `<audio>` elements should have a linked transcript — detected by the presence of an `aria-describedby` attribute pointing to an existing element.

**Why it matters:** Audio-only content (podcasts, voice recordings) is inaccessible to Deaf users without a transcript. A transcript also benefits users in environments where audio cannot be played.

**How to fix:** Provide a full text transcript near the audio player and link it:

```html
<audio controls aria-describedby="podcast-transcript">
  <source src="episode.mp3">
</audio>
<div id="podcast-transcript">
  <h3>Transcript</h3>
  <p>...</p>
</div>
```

---

## Tables

Tables convey relationships between row and column data. Without proper markup, screen readers read cells as isolated text with no indication of what category each value belongs to.

---

### `table-headers`
**WCAG 1.3.1 · Level A · Serious**

**What it checks:** Data tables (tables that contain `<td>` cells and are not explicitly marked as layout tables with `role="presentation"`) must have at least one `<th>` element, a `[scope]` attribute on a cell, or `role="columnheader"` / `role="rowheader"`.

**Why it matters:** Without headers, a screen reader reads cell values as a flat stream: "Alice, 32, London, Bob, 27, Paris…" — no indication of what "32" or "27" mean. With headers, it reads: "Name: Alice, Age: 32, City: London."

**How to fix:**

```html
<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Age</th>
      <th scope="col">City</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Alice</td><td>32</td><td>London</td>
    </tr>
  </tbody>
</table>
```

---

### `table-scope-valid`
**WCAG 1.3.1 · Level A · Moderate**

**What it checks:** Any `scope` attribute on a `<th>` must have one of the four valid values: `col`, `row`, `colgroup`, or `rowgroup`.

**Why it matters:** An invalid scope value (e.g. `scope="column"` — note the typo) is treated as if no scope was set, breaking the header association for screen readers.

**How to fix:** Use the exact keywords: `scope="col"` for column headers, `scope="row"` for row headers.

---

### `td-headers-attr`
**WCAG 1.3.1 · Level A · Serious**

**What it checks:** When a `<td>` or `<th>` uses the `headers` attribute to explicitly associate itself with header cells, every ID listed in that attribute must correspond to an existing `<th>` element with non-empty text.

**Why it matters:** The `headers` attribute is used for complex tables where a simple `scope` is insufficient (e.g. cells that span multiple header contexts). A broken reference — pointing to a non-existent or non-`<th>` element — silently removes the header association.

**How to fix:** Ensure every ID in a `headers` attribute exists in the same table and belongs to a `<th>` with visible text content.

---

### `table-duplicate-name`
**WCAG 1.3.1 · Level A · Moderate**

**What it checks:** A table's `summary` attribute and `<caption>` element must not contain identical text.

**Why it matters:** `<caption>` is the visible label of the table. The `summary` attribute (now deprecated in HTML5, but still encountered) is meant to provide a longer programmatic description for screen readers. If both say the same thing, screen-reader users hear the description read aloud twice consecutively.

**How to fix:** Either remove the `summary` attribute (prefer `<caption>` for visible labelling and an `aria-describedby` pointing to a description paragraph), or ensure `summary` provides genuinely additional context beyond what `<caption>` says.

---

## Impact Level Reference

| Level | Meaning |
|---|---|
| `critical` | Blocks access entirely for some users — must fix before shipping |
| `serious` | Causes significant difficulty — fix as soon as possible |
| `moderate` | Causes confusion or extra friction — fix in next sprint |
| `minor` | Best practice; low user impact — fix when convenient |

## WCAG Conformance Level Reference

| Level | Meaning |
|---|---|
| **A** | Minimum — removing these barriers is the baseline requirement |
| **AA** | Standard — required by most accessibility laws (EN 301 549, ADA, AODA, etc.) |
| **AAA** | Enhanced — aspirational; not always achievable for all content |
