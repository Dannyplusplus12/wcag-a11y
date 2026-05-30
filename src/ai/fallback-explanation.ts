const EXPLANATIONS: Record<string, string> = {
  // Text alternatives
  'img-alt': 'Screen reader users hear nothing for this image — any information it conveys (branding, instructions, data) is completely invisible to them.',
  'input-image-alt': 'Screen readers announce this button by its file name (e.g. "submit.png") instead of its purpose, so users cannot tell what the button does.',
  'svg-title': 'Screen reader users receive no label for this SVG; if it conveys meaning (an icon, a chart), that meaning is entirely lost.',
  'object-alt': 'Screen reader users receive no description for this embedded object; its content is skipped as if it does not exist.',
  'role-img-alt': 'Elements marked with `role="img"` are announced as "image" with no label, giving screen reader users no context about what is depicted.',
  'image-redundant-alt': 'Screen reader users hear the same text twice — once from the alt attribute and once from adjacent text — creating a disorienting, repetitive experience.',

  // Tables
  'table-headers': 'Screen reader users navigating a data table cell by cell hear only isolated values with no column or row context — like reading a spreadsheet with all headers removed.',
  'table-scope-valid': 'Invalid `scope` values cause screen readers to misidentify which headers apply to which cells, giving users incorrect data relationships.',
  'td-headers-attr': '`headers` attributes pointing to non-existent IDs are silently ignored, leaving table cells without any header association for screen reader users.',
  'table-duplicate-name': 'When a table\'s caption and summary say the same thing, screen reader users hear the description twice, wasting time and causing confusion.',

  // Structure
  'heading-order': 'Skipping heading levels (e.g. h1 → h3) breaks the document outline; screen reader users navigating by headings lose the logical hierarchy and cannot tell which sections are sub-sections of others.',
  'page-title': 'Screen reader users hear a blank or generic title when switching tabs and cannot identify the page without reading its full content.',
  'landmark-one-main': 'Without a `<main>` landmark, screen reader users cannot skip directly to page content and must tab through all navigation on every single page load.',
  'list-structure': 'Content that looks like a list but uses `<div>` or `<p>` instead of `<ul>`/`<li>` is read as plain text; screen readers won\'t announce item count or allow list-navigation shortcuts.',
  'region-landmark': 'Content outside any landmark region is missed by screen reader users who navigate by landmarks — `<header>`, `<main>`, `<nav>`, `<footer>` etc.',
  'duplicate-id': 'Duplicate IDs silently break ARIA relationships (`aria-labelledby`, `aria-describedby`): the wrong element may be read, or the association ignored entirely.',
  'frame-title': 'Screen reader users hear "frame" with no description and cannot tell if a frame contains a cookie banner, an advertisement, or a critical widget without entering it.',
  'meta-viewport': '`user-scalable=no` or `maximum-scale` prevents users with low vision from pinch-zooming — removing the browser\'s most basic accessibility tool for text size.',
  'marquee': '`<marquee>` moves content automatically with no pause control; users with cognitive disabilities, ADHD, or vestibular disorders find it disorienting or impossible to read.',
  'p-as-heading': 'Visual headings styled as bold `<p>` tags are not exposed as headings in the accessibility tree; screen reader users navigating by headings will skip this section entirely.',

  // Media
  'video-captions': 'Deaf and hard-of-hearing users cannot access any spoken content in the video — dialogue, narration, and audio cues are entirely unavailable to them.',
  'audio-description': 'Blind users miss visual-only information in the video (on-screen text, actions, scene changes) that is never described in the audio track.',
  'audio-transcript': 'Deaf users cannot access audio-only content (e.g. podcasts, voice instructions) without a text transcript; the content is completely inaccessible to them.',

  // Links
  'link-name': 'Screen reader users navigating by links hear only "link" with no destination — they cannot determine where it leads without reading the surrounding paragraph.',
  'link-empty': 'An anchor with no text content is announced as an empty unlabeled link; screen reader users encounter a dead spot that provides no usable information.',
  'identical-links-different-purpose': 'Multiple links that read the same (e.g. "Read more") but go to different destinations give screen reader users no way to distinguish them when browsing the links list.',
  'link-new-window-warn': 'Links that silently open new tabs disorient keyboard and screen reader users — the Back button no longer works and the unexpected context shift is never announced.',

  // Forms
  'label-missing': 'Screen reader users tab to this field and hear only the input type (e.g. "text, edit"); they receive no indication of what information the field expects.',
  'label-empty': 'The `<label>` exists but contains no text; screen reader users hear the input type only, with no indication of the field\'s purpose.',
  'error-identification': 'Form validation errors are conveyed visually only; screen reader users receive no programmatic notification and cannot identify which fields failed or what went wrong.',
  'autocomplete': 'Without the correct `autocomplete` attribute, password managers and browser autofill cannot identify the field, forcing users with motor disabilities to type credentials manually every time.',
  'input-button-name': 'Screen reader users hear "button" with no label and cannot determine what action the button performs.',
  'fieldset-legend': 'Related form controls have no group label; screen reader users navigating into the group have no context for what the inputs belong to (e.g. "Is this billing or shipping?").',
  'form-field-required-label': 'Required fields are not programmatically marked as required; screen reader users are not warned the field is mandatory and may submit an incomplete form unexpectedly.',

  // Language
  'html-lang': 'Without a `lang` attribute, screen readers use the system language to read all content; foreign-language text is mispronounced and can be incomprehensible.',
  'html-lang-valid': 'An unrecognized `lang` value causes screen readers to fall back to the system language, mispronouncing content and breaking language-specific text-to-speech features.',

  // Color contrast
  'color-contrast-text': 'Users with low vision or color blindness cannot distinguish this text from its background at the current contrast ratio; the text becomes difficult or impossible to read without assistive magnification.',
  'color-contrast-large-text': 'Despite large text having a more relaxed contrast requirement, this element still fails that threshold; users with moderate low vision cannot read it reliably.',

  // Keyboard
  'no-positive-tabindex': 'Positive `tabindex` values override the natural tab order, causing keyboard users to jump erratically around the page instead of following its logical structure.',
  'interactive-not-focusable': 'Keyboard users and screen reader users cannot reach this interactive element by tabbing — it is effectively invisible and unusable to anyone not using a mouse.',
  'skip-link': 'Without a "skip to main content" link, keyboard users must tab through every navigation item on every page load before reaching the main content — often 20–40 tab presses on complex sites.',
  'focus-visible': 'Keyboard users cannot see which element currently has focus; they lose their place on the page and cannot tell where their next keypress will act.',
  'scrollable-region-focusable': 'A scrollable area that cannot receive keyboard focus traps keyboard users — they can see there is more content but cannot scroll to it without a mouse.',
  'accesskey-unique': 'Duplicate `accesskey` values cause browsers to cycle through elements unpredictably; keyboard shortcut users cannot rely on the shortcut to reach the intended element.',

  // ARIA
  'aria-valid-role': 'An unrecognized ARIA role is ignored by assistive technologies; the element is presented without semantic meaning and screen reader users may navigate past it or interact with it incorrectly.',
  'aria-required-attr': 'This ARIA widget is missing required attributes (e.g. `aria-checked` on `role="checkbox"`); screen readers cannot communicate the element\'s state, so users don\'t know if it is active, checked, or selected.',
  'aria-hidden-focus': 'A focusable element inside `aria-hidden` receives keyboard focus but is invisible to screen readers; keyboard users land on an element and the screen reader announces nothing.',
  'button-name': 'Screen reader users hear "button" with no label and cannot determine what action the button performs without exploring surrounding content visually.',
  'aria-required-children': 'This ARIA container is missing required child roles (e.g. a `listbox` with no `option` children); screen readers either skip the widget or announce it in an unpredictable way.',
  'aria-required-parent': 'This ARIA element is outside its required parent context; screen readers cannot establish the correct ownership relationship and may misreport the element\'s role or state.',
  'aria-prohibited-attr': 'ARIA attributes applied where they are prohibited override the element\'s built-in semantics, causing screen readers to misannounce the element\'s role or state.',
};

export function fallbackExplanation(ruleId: string, description: string, wcag: string, level: string): string {
  return EXPLANATIONS[ruleId]
    ?? `${description} — this prevents some users from accessing or understanding content on this page (WCAG 2.1 SC ${wcag}, Level ${level}).`;
}
