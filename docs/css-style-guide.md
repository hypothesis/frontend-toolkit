# Hypothesis CSS Style Guide

To enable efficient and safe evolution of our front end projects, we follow a few basic guidelines for styling:

- Organize styles into components for encapsulation, ease of reuse and refactoring
- Extract reusable patterns whenever possible
- Use simple, non-nested class selectors to avoid specificity problems
- Apply [Atomic Design](https://atomicdesign.bradfrost.com/) methodology loosely.
  We are currently experimenting with applying atomic and molecular patterns.
- Use [naming](#naming) conventions to provide semantic information or indicate
  classes that are purely presentational
- Use modern CSS features (flexbox) for layout
- Use [SASS](https://sass-lang.com/) for implementing CSS

## Organization

Styling consists of several elements:

1.  **Resets** and **Basic element styles** set sensible defaults for various elements
1.  **Utility classes** provide basic, core styling for elements that need no other
    style rules
1.  **Variables** capture basic rules and settings
1.  **Mixins** provide reusable patterns, both at atomic and composition/molecular levels
1.  **Components**. These are re-usable building blocks which use BEM-naming rules (see below). These form the majority of CSS rules.

To make maintenance easier as projects scale and make it easier to see
locally where particular variables, mixins etc. come from, and avoid unexpected
conflicts, our projects make use of the [SASS module
system](https://sass-lang.com/blog/the-module-system-is-launched).

### SASS Organization

A project's styling is contained within SASS modules that fill the
roles of the elements listed above.

An entry-point file (per project or per project sub-section) imports the project's
resets, basic element styles, utility classes and SASS module for each component, e.g.:

```scss
// Resets and basic universal styling for elements
@use 'base/reset';
@use 'base/elements';

// Utility classes
@use 'base/utils';

// Components
@use 'components/input-field';
@use 'components/fancy-modal';
@use 'components/a-widget';
```

Resets, basic element styles and utility classes are made available in output
CSS by the entry-point SASS file.

Component modules define the styles for re-usable components, including the different
variations of a component and media queries for responsive layout. These components
can `@use` (import) variables and mixins as needed for their styling.

## Selectors

- Use class selectors rather than element or ID selectors.
- Avoid descendant selectors in most cases. They [are slow](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Writing_efficient_CSS#Avoid_the_descendant_selector.21) and more importantly, make it easy to create unintended results due to naming clashes or [specificity conflicts](http://css.maxdesign.com.au/selectutorial/advanced_conflict.htm).

```scss
// Bad
.tab-bar {
  .tab { } // Generates '.tab-bar .tab'
}

// Good
.tab-bar__tab { ... }
```

## Naming

- Use [BEM-style](http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/) naming for components:

```scss
.component { ... }
.component__element { ... }
.component__element--modifier { ... }
```

Where 'component' is a re-usable building block (eg. a tab bar),
'element' is some part of the component which is not reusable on its own, and
'--modifier' represents some static variation of a component (eg.
`btn--danger` for a button which performs some destructive action)

- Use `is-$state` names for state classes (eg. `is-active`) that are dynamically added or removed from JS code
- Use a `u-` prefix for utility classes. eg. A class for hiding DOM elements would be called `u-hidden`

### Classes Used in Code

- Only reference classes with `js-` and `is-` prefixes in JavaScript code
- Use names with a `js-` prefix for handle or "ref" classes that are used by JS to get a reference to particular DOM elements. These classes should not appear in stylesheets

## Working in SASS

- Use mixins whenever possible within component SASS rules. If there is no applicable mixin,
  use variable values for rules when possible. Otherwise, add specific rules—and comment them.
- Use utility classes, but sparingly, for elements that don't have other specific CSS rules. For
  elements that need additional styling, don't use a utility class. Instead, use the corresponding
  utility mixin within the SASS rules for that element.
- Be careful with CSS preprocessor features. Use mixins to avoid repetition and variables to ensure consistency. Avoid SASS' `@extends` feature.
- Use of nesting to avoid repetition of component names is acceptable, but only one or two levels as otherwise it can be difficult to see what CSS rules are generated:

```scss
.tab-bar {
  &__tab { ... } // OK - Generates '.tab-bar__tab'

  .tab { ... }    // AVOID - Generates '.tab-bar .tab'

  &__tab {
    &__icon { ... } // AVOID - Difficult to see what resulting selector is
  }
}
```

- Use color, typography and other values defined in the shared `variables` module
  (or, even better: use a utility mixin) rather than hard-coding CSS rule values
  in component CSS
- We use flexbox instead for layout; there are some utility mixins and classes
  to make component styling more convenient.
- Avoid vendor prefixes ([autoprefixer](https://github.com/postcss/autoprefixer) will
  add these automatically).

## Browser Support

Hypothesis applications should work within any modern web browser (a version of Chrome, Firefox, Safari, Microsoft Edge, or equivalent released within the last 12 months). Note that as of 1 July 2020, Hypothesis does not support Internet Explorer.

## Further Reading

- [Trello's CSS Guidelines](https://github.com/trello/trellisheets) . See also the 'Further Reading'
  section at the end of that article
- [Strategies for Keeping CSS specificity low](https://css-tricks.com/strategies-keeping-css-specificity-low) explains the problems with CSS specificity and why most formalized approaches to CSS advocate flat structures
- [CSS Tricks](https://css-tricks.com/css/) has links to blog posts and guides from other projects on the tools and approaches they use to styling web UIs
