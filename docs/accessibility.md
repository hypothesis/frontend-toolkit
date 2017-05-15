Accessibility Guidance
======================

This document provides guidance and links to useful resources and tools for
creating web-based content & interfaces which are accessible to the widest
possible range of users.

It is not intended to be exhaustive but rather to highlight important best
practices and provide a shared reference which is useful when implementing or
reviewing UI changes.

## Guidelines

### Mobile

1. **Use media queries to adapt layout to display size** - Use `@media` queries
   to adjust the layout depending on screen size to provide more usable
   interfaces on small screens.
1. **Make interactive controls big enough to tap.** Make sure any UI controls
   that respond to taps are large enough to tap easily with a finger.

   * Interactive controls should generally be at least 44x44px in size on
     touch-screen devices.
   * Use `@media (pointer: coarse)` to adjust the size of tap-able items on
     devices with touch screens.
1. **Use semantic markup.**  Use appropriate semantic HTML elements for
   individual items on a page (headings, links, buttons) as well as regions
   (navigation, main content, header and footer). This enables the user agent to
   provide various affordances such as smarter hit testing.
1. **Use large font sizes for input fields.** Input fields should use a 16px font or
   larger to make them easily readable and to prevent iOS Safari "zooming in"
   when the field is focused.

### Assistive Technology (eg. Screen Readers)

1. **Use semantic markup.** Use appropriate semantic HTML elements for
   individual items on a page (headings, links, buttons) as well as regions
   (navigation, main content, header and footer). Use of these elements helps
   assistive technology to:

   1. Provide helpful descriptions of items.
   1. Identify major landmarks on the page for faster navigation.
   1. Identify important elements of a particular type (forms, links, headings)
      for faster navigation.
   1. Group elements together appropriately for navigation.
1. **Associate text labels with items.**
   * Ensure that any buttons or links which do not have an explicit text label
     have an accessible label set via the `aria-label` attribute.
   * Ensure that form elements have either a placeholder or associated `<label>`
     element. The label should be associated with its control using the `for`
     attribute.
1. **Use ARIA roles to clarify meaning and relationships.** Not all of the
   meaning of complex HTML elements and their relationships can be inferred via
   element types and DOM structure. Use the `role` and other ARIA attributes
   where appropriate to clarify this. See the [WAI-ARIA authoring
   practices](https://www.w3.org/TR/wai-aria-practices/) for examples.
1. **Indicate control states.** Use ARIA attributes such as `aria-expanded` to
   indicate the state of complex controls such as popup menus.
1. **Support keyboard usage.** It should be possible to navigate to items on a
   page and use them with only a keyboard. See the [WAI-ARIA authoring
   practices](https://www.w3.org/TR/wai-aria-practices/) for a description of
   standard keyboard behaviour of various common controls.
1. **Test with an actual screen reader.** Following the other advice in this
   section will go a long way towards making content more accessible. However,
   it is important to actually try performing tasks with a screen reader to
   ensure that everything has been labeled appropriately, that items on the page
   are grouped appropriately and that complex controls are usable.
   * **VoiceOver** is built into OS X and iOS.
   * **Orca** ships with most Linux distributions.
   * **[NVDA](https://www.nvaccess.org)** for Windows is free to download.

### Other

1. **Do not rely on color hue to indicate item states.** To avoid problems for
   colorblind users, do not rely on hue as the only indicator of an item's
   state. [Sim Daltonism](https://michelf.ca/projects/sim-daltonism/) is a
   useful tool for simulating color blindness on Mac and iOS.

## References

* **[Web Accessibility Initiative ARIA
Overview](https://www.w3.org/WAI/intro/aria.php)**. An introduction to the web
platform standards relevant to making web content more accessible.
* **[WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/)**.
Detailed guidance on how to make various kinds of common widget accessible. It
describes standard keyboard interactions and use of ARIA attributes for
different types of widget.
* **[AppleVis](https://www.applevis.com/)**. A community site for blind/visually
impaired OS X users. Useful for getting a feel for common problems that visually
impaired users experience and learning how they perform various tasks.
