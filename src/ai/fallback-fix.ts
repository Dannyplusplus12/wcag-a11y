import type { FixCategory } from './types.js';

const RULE_FIX_INSTRUCTIONS: Record<string, string> = {
  // Text alternatives
  'img-alt':
    'Add an `alt` attribute describing the image content. Use `alt=""` for decorative images.\nExample: `<img src="photo.jpg" alt="Team photo at the 2024 company retreat">`',
  'input-image-alt':
    'Add an `alt` attribute to the `<input type="image">` describing the button\'s action.\nExample: `<input type="image" src="submit.png" alt="Submit form">`',
  'svg-title':
    'Add a `<title>` element as the first child of `<svg>` and add `aria-labelledby` pointing to its `id`.\nExample: `<svg aria-labelledby="chartTitle" role="img"><title id="chartTitle">Monthly sales bar chart</title>...</svg>`',
  'object-alt':
    'Add descriptive fallback content inside the `<object>` tag, or use `aria-label`.\nExample: `<object data="report.pdf"><p>Download the Q4 2024 report (PDF)</p></object>`',
  'role-img-alt':
    'Add `aria-label` or `aria-labelledby` to the element with `role="img"`.\nExample: `<div role="img" aria-label="Star rating: 4 out of 5"></div>`',
  'image-redundant-alt':
    'Change the `alt` to `alt=""` (empty string) since the image\'s meaning is already conveyed by adjacent text — screen readers skip empty-alt images automatically.',

  // Tables
  'table-headers':
    'Add `<th scope="col">` for column headers and `<th scope="row">` for row headers.\nExample: `<thead><tr><th scope="col">Name</th><th scope="col">Price</th></tr></thead>`',
  'table-scope-valid':
    'Change the `scope` attribute to a valid value: `"col"`, `"row"`, `"colgroup"`, or `"rowgroup"`. Remove it if the element is not a header.',
  'td-headers-attr':
    'Either add matching `id` attributes to the referenced `<th>` elements, or remove the invalid `headers` attributes from the `<td>` elements.',
  'table-duplicate-name':
    'Make the `<caption>` and `summary` convey different information: use `<caption>` for a short visible title and `summary` for an extended description, or remove the redundant attribute.',

  // Structure
  'heading-order':
    'Restructure headings so levels are never skipped. Change the offending tag to the correct level (e.g., change `<h4>` directly under `<h2>` to `<h3>`). Use CSS for visual sizing — never pick heading levels for appearance.',
  'page-title':
    'Add or update `<title>` in `<head>` with a unique, descriptive title.\nUse the format: `<title>Page Name — Site Name</title>`',
  'landmark-one-main':
    'Wrap primary page content in exactly one `<main id="main-content">` element. Remove any duplicate `<main>` elements.',
  'list-structure':
    'Replace non-semantic markup with proper list structure.\nExample: change `<div class="item">` repeated items into `<ul><li>...</li><li>...</li></ul>` for unordered, or `<ol>` for ordered lists.',
  'region-landmark':
    'Wrap the content in the appropriate landmark element: `<header>`, `<nav aria-label="...">`, `<main>`, `<aside aria-label="...">`, or `<footer>`. For generic sections: `<section aria-label="Section name">`.',
  'duplicate-id':
    'Make each `id` unique across the page. If the ID is referenced by `aria-labelledby` or `aria-describedby`, update those references to match the new unique IDs. Append a suffix like `-nav`, `-footer`, or a number to disambiguate.',
  'frame-title':
    'Add a `title` attribute to the `<iframe>` describing its content.\nExample: `<iframe title="Product demo video" src="..."></iframe>`',
  'meta-viewport':
    'Remove `user-scalable=no` and ensure `maximum-scale` is not below 5.\nChange to: `<meta name="viewport" content="width=device-width, initial-scale=1">`',
  'marquee':
    'Replace `<marquee>` with a CSS-animated element. Respect `prefers-reduced-motion`:\n`@media (prefers-reduced-motion: reduce) { .marquee { animation: none; } }`\nProvide static fallback content for motion-sensitive users.',
  'p-as-heading':
    'Replace the visually bold `<p>` with the appropriate heading tag (`<h2>`, `<h3>`, etc.) matching its position in the document outline. Apply visual styles via CSS, not `<b>` or `<strong>` tags inside `<p>`.',

  // Media
  'video-captions':
    'Add a `<track kind="captions">` element inside the `<video>` pointing to a WebVTT (.vtt) file.\nExample: `<track kind="captions" src="/captions-en.vtt" srclang="en" label="English" default>`',
  'audio-description':
    'Add a `<track kind="descriptions">` element inside `<video>` for audio descriptions.\nExample: `<track kind="descriptions" src="/descriptions-en.vtt" srclang="en" label="Audio description">`',
  'audio-transcript':
    'Provide a text transcript immediately after the `<audio>` element, either as a link or inline.\nExample: `<a href="/transcript.html">Read transcript</a>`',

  // Links
  'link-name':
    'Add descriptive text inside the `<a>`, or use `aria-label` to describe the destination.\nExample: `<a href="/products" aria-label="View all products">View all</a>`. Avoid "click here" or "read more".',
  'link-empty':
    'Add descriptive text or `aria-label` to the empty anchor. If it is a decorative icon, add `aria-label`. If non-functional, remove the `<a>` element entirely.',
  'identical-links-different-purpose':
    'Add unique `aria-label` to each link to distinguish its destination.\nExample: `<a href="/product-a" aria-label="Read more about Product A">Read more</a>` and `<a href="/product-b" aria-label="Read more about Product B">Read more</a>`',
  'link-new-window-warn':
    'Add `rel="noopener noreferrer"` and warn users the link opens a new tab.\nExample: `<a href="..." target="_blank" rel="noopener noreferrer">Download PDF <span class="sr-only">(opens in new tab)</span></a>`',

  // Forms
  'label-missing':
    'Add a `<label>` linked via `for`/`id`, or add `aria-label` directly to the input.\nExample: `<label for="user-email">Email address</label><input id="user-email" type="email">`',
  'label-empty':
    'Add descriptive text inside the existing `<label>`.\nExample: change `<label for="q"></label>` to `<label for="q">Search</label>`',
  'error-identification':
    'Link error messages to their fields using `aria-describedby` and add `role="alert"` to the error container.\nExample: `<input aria-describedby="email-error"><span id="email-error" role="alert">Please enter a valid email address</span>`',
  'autocomplete':
    'Add the correct `autocomplete` attribute to the input. Common values: `name`, `email`, `tel`, `current-password`, `new-password`, `given-name`, `family-name`, `street-address`, `postal-code`.\nExample: `<input type="email" autocomplete="email">`',
  'input-button-name':
    'Add a descriptive `value` to `<input type="button/submit/reset">` or `aria-label` to icon buttons.\nExample: `<input type="submit" value="Submit registration form">` or `<button aria-label="Search"><svg aria-hidden="true">...</svg></button>`',
  'fieldset-legend':
    'Wrap related controls in `<fieldset>` with `<legend>` as its first child.\nExample: `<fieldset><legend>Shipping address</legend><label>...</label><input>...</fieldset>`',
  'form-field-required-label':
    'Add `required` and `aria-required="true"` to the input. Indicate required status in the label text.\nExample: `<label for="name">Full name <span aria-hidden="true">*</span><span class="sr-only">(required)</span></label><input id="name" required aria-required="true">`',

  // Language
  'html-lang':
    'Add a `lang` attribute to the `<html>` element with the correct BCP 47 language tag.\nExample: `<html lang="en">` for English, `<html lang="vi">` for Vietnamese, `<html lang="fr">` for French.',
  'html-lang-valid':
    'Replace the invalid `lang` value with a valid BCP 47 language tag.\nValid examples: `"en"`, `"en-US"`, `"fr"`, `"de"`, `"es"`, `"zh"`, `"ja"`, `"ko"`, `"vi"`, `"ar"`.',

  // Color contrast
  'color-contrast-text':
    'Increase the contrast ratio between the text and background to at least 4.5:1. Darken the text color or lighten the background. Verify with the WebAIM Contrast Checker.\nExample: change `color: #999` on a white background to `color: #767676` (minimum passing value).',
  'color-contrast-large-text':
    'Increase the contrast ratio to at least 3:1 for large text (18pt/24px+ regular, or 14pt/18.67px+ bold). Adjust the text or background color and verify with a contrast checker.',

  // Keyboard
  'no-positive-tabindex':
    'Remove the `tabindex` attribute or set it to `tabindex="0"`. Reorder DOM elements to create the correct focus sequence — never use positive tabindex values to manage tab order.',
  'interactive-not-focusable':
    'Add `role="button"` (or the correct role) and `tabindex="0"`. Add keyboard event handlers for Enter and Space to match the click handler.\nExample: `<div role="button" tabindex="0" onclick="handleClick()" onkeydown="if(event.key===\'Enter\'||event.key===\' \')handleClick()">`',
  'skip-link':
    'Add a skip link as the very first child of `<body>`:\n`<a href="#main-content" class="skip-link">Skip to main content</a>`\nEnsure the target exists: `<main id="main-content">` (add `id="main-content"` to your existing `<main>` element).\nAdd CSS: `.skip-link { position: absolute; left: -9999px; } .skip-link:focus { position: static; left: 0; top: 0; z-index: 9999; padding: 8px; background: #fff; color: #000; }`',
  'focus-visible':
    'Remove `outline: none` or `outline: 0` from `:focus` styles. Add a clearly visible focus indicator.\nExample: `a:focus-visible, button:focus-visible { outline: 3px solid #005fcc; outline-offset: 2px; }`. Never suppress focus outlines without an equally visible replacement.',
  'scrollable-region-focusable':
    'Add `tabindex="0"` to the scrollable container so keyboard users can focus and scroll it.\nExample: `<div class="overflow-auto" tabindex="0" aria-label="Scrollable content">...</div>`',
  'accesskey-unique':
    'Change duplicate `accesskey` values so each one is unique across the page. If shortcuts are not needed, remove the `accesskey` attribute entirely.',

  // ARIA
  'aria-valid-role':
    'Remove the invalid `role` value or replace it with a valid WAI-ARIA role such as `button`, `checkbox`, `dialog`, `listbox`, `menu`, `menuitem`, `option`, `radio`, `tab`, `tabpanel`, or `tooltip`.',
  'aria-required-attr':
    'Add the missing required ARIA state or property for this role.\nExamples: `role="checkbox"` needs `aria-checked`; `role="combobox"` needs `aria-expanded`; `role="slider"` needs `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.',
  'aria-hidden-focus':
    'Remove `aria-hidden="true"` from any ancestor of a focusable element, or move `aria-hidden` to a sibling that contains no focusable descendants. Never place interactive elements inside `aria-hidden="true"` containers.',
  'button-name':
    'Add visible text content or `aria-label` to the `<button>`.\nExample: `<button aria-label="Close dialog"><svg aria-hidden="true">...</svg></button>` or `<button>Submit order</button>`',
  'aria-required-children':
    'Add the required child elements with the correct ARIA roles inside this container.\nExamples: `role="listbox"` must contain `role="option"` children; `role="menu"` must contain `role="menuitem"` children; `role="grid"` must contain `role="row"` children.',
  'aria-required-parent':
    'Move this element inside its required ARIA parent container.\nExamples: `role="option"` must be inside `role="listbox"`; `role="tab"` must be inside `role="tablist"`; `role="menuitem"` must be inside `role="menu"`.',
  'aria-prohibited-attr':
    'Remove the prohibited ARIA attribute from this element. Elements with `role="presentation"` or `role="none"` must not have naming attributes like `aria-label` or `aria-labelledby`. Check the WAI-ARIA spec for the element\'s prohibited attributes.',
};

export function getFix(ruleId: string): string | undefined {
  return RULE_FIX_INSTRUCTIONS[ruleId];
}

const RULE_FIX_CATEGORY: Record<string, FixCategory> = {
  // edit-element — fix targets the flagged element's own attributes or content
  'img-alt': 'edit-element',
  'input-image-alt': 'edit-element',
  'svg-title': 'edit-element',
  'object-alt': 'edit-element',
  'role-img-alt': 'edit-element',
  'image-redundant-alt': 'edit-element',
  'table-scope-valid': 'edit-element',
  'table-duplicate-name': 'edit-element',
  'page-title': 'edit-element',
  'frame-title': 'edit-element',
  'meta-viewport': 'edit-element',
  'p-as-heading': 'edit-element',
  'heading-order': 'edit-element',
  'duplicate-id': 'edit-element',
  'link-name': 'edit-element',
  'link-empty': 'edit-element',
  'identical-links-different-purpose': 'edit-element',
  'link-new-window-warn': 'edit-element',
  'label-empty': 'edit-element',
  'autocomplete': 'edit-element',
  'input-button-name': 'edit-element',
  'html-lang': 'edit-element',
  'html-lang-valid': 'edit-element',
  'no-positive-tabindex': 'edit-element',
  'interactive-not-focusable': 'edit-element',
  'scrollable-region-focusable': 'edit-element',
  'accesskey-unique': 'edit-element',
  'aria-valid-role': 'edit-element',
  'aria-required-attr': 'edit-element',
  'aria-prohibited-attr': 'edit-element',
  'button-name': 'edit-element',
  'aria-required-children': 'edit-element',
  'video-captions': 'edit-element',
  'audio-description': 'edit-element',

  // add-elsewhere — fix inserts a new element at a different location
  'skip-link': 'add-elsewhere',
  'audio-transcript': 'add-elsewhere',
  'label-missing': 'add-elsewhere',
  'error-identification': 'add-elsewhere',

  // change-css — fix lives in a stylesheet, not in the flagged element's markup
  'color-contrast-text': 'change-css',
  'color-contrast-large-text': 'change-css',
  'focus-visible': 'change-css',
  'marquee': 'change-css',

  // restructure — fix touches multiple elements or wraps / moves content
  'table-headers': 'restructure',
  'td-headers-attr': 'restructure',
  'landmark-one-main': 'restructure',
  'list-structure': 'restructure',
  'region-landmark': 'restructure',
  'fieldset-legend': 'restructure',
  'form-field-required-label': 'restructure',
  'aria-hidden-focus': 'restructure',
  'aria-required-parent': 'restructure',
};

export function getFixCategory(ruleId: string): FixCategory | undefined {
  return RULE_FIX_CATEGORY[ruleId];
}
