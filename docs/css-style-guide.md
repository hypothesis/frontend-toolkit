Hypothesis CSS Style Guide
==========================

To enable efficient and safe evolution of our front end projects, we follow a few basic principles for styling:

 * Organize styles into components for encapsulation, ease of reuse and refactoring
 * Use simple, non-nested class selectors to avoid specificity problems
 * Be careful with CSS preprocessor features. Use mixins to avoid repetition and variables to ensure consistency. Avoid SASS' `@extends` feature.
 * Use [naming](#naming) conventions to indicate which classes are purely presentational and which are referenced in code
 * Use modern CSS features (flexbox) for layout

## Organization

Styling consists of several elements:
 1. **Mixins, functions and variables** which avoid repetition and help ensure design consistency
 1. **Resets** which set sensible defaults for various elements
 1. **Basic element styles**
 1. **Components**. These are re-usable building blocks which use BEM-naming rules (see below). These form the majority of CSS rules.

The SASS for Hypothesis projects is organized into several parts:

 * A 'root' file which imports all of the components used in the project or section of the project, structured like this:

```scss
// Variables and mixins
@import 'partials/base';

// Reset default browser styles
@import 'partials/reset';
// Basic universal styling for elements (eg. links)
@import 'partials/elements';

// Utility classes
@import 'partials/utils';

// Components
@import 'partials/input-field';
@import 'partials/fancy-modal';
@import 'partials/a-widget';
```
 * A 'base' partial which imports all variables and mixins used by other components
 * Component partials which define the styles for re-usable components, including the different variations of a component and media queries for responsive layout. These may assume
   the existence of other variables or mixins but should not import anything themselves.

## Selectors

 * Use class selectors rather than element or ID selectors.
 * Avoid descendant selectors. They [are slow](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Writing_efficient_CSS#Avoid_the_descendant_selector.21) and more importantly, make it easy to create unintended results due to naming clashes or [specificity conflicts](http://css.maxdesign.com.au/selectutorial/advanced_conflict.htm).
 ```scss
 // Bad
 .tab-bar {
   .tab { } // Generates '.tab-bar .tab'
 }

 // Good
 .tab-bar__tab { ... }
 ```

## Naming

 * Use [BEM-style](http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/) naming for components:

 ```scss
 .component { ... }
 .component__element { ... }
 .component__element--modifier { ... }
 ```

 Where 'component' is a re-usable building block (eg. a tab bar),
 'element' is some part of the component which is not reusable on its own, and
 '--modifier' represents some static variation of a component (eg.
 `btn--danger` for a button which performs some destructive action)
 * Use `is-$state` names for state classes (eg. `is-active`) that are dynamically added or removed from JS code
 * Use a `u-` prefix for utility classes. eg. A class for hiding DOM elements would be called `u-hidden`

### Classes Used in Code
* Only reference classes with `js-` and `is-` prefixes in JavaScript code, except for tests where other classes may be referenced
* Use names with a `js-` prefix for handle or "ref" classes that are used by JS to get a reference to particular DOM elements. These classes should not appear in stylesheets

## SASS Features

 * Use variables, functions and mixins
 * [Avoid @extends](https://www.sitepoint.com/avoid-sass-extend/). Use mixins instead
 * Use of nesting to avoid repetition of component names is acceptable, but only one or two levels as otherwise it can be difficult to see what CSS rules are generated:

```scss
.tab-bar {
  &__tab { ... } // OK - Generates '.tab-bar__tab'

  .tab { ... }    // AVOID - Generates '.tab-bar .tab'

  &__tab {
    &__icon { ... } // AVOID - Difficult to see what resulting selector is
  }
}
```

## Colors and Typography

 * Use colors and typography values defined in the 'base' partial (or one of its includes) rather than hard-coding colors in component styles.

## Layout

 * Use flexbox instead of floats for component layout. This avoids the need for clearfix and other hacks. Note that flexbox [may not be appropriate](https://hyp.is/AVKcwo8BvTW_3w8LypJ5/jakearchibald.com/2014/dont-use-flexbox-for-page-layout/) for overall page layout

## Vendor Prefixes

 * Avoid vendor prefixes. Use [autoprefixer](https://github.com/postcss/autoprefixer) to add those.

## Browser Support

 * Hypothesis projects should be functional on Internet Explorer 10 and above. CSS features that are only available in newer browsers can still be used but the site should behave gracefully in older browsers

## Further Reading

 * [Trello's CSS Guidelines](https://github.com/trello/trellisheets) . See also the 'Further Reading'
   section at the end of that article
 * [Strategies for Keeping CSS specificity low](https://css-tricks.com/strategies-keeping-css-specificity-low) explains the problems with CSS specificity and why most formalized approaches to CSS advocate flat structures
 * [CSS Tricks](https://css-tricks.com/css/) has links to blog posts and guides from other projects on the tools and approaches they use to styling web UIs
