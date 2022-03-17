# Hypothesis CSS Style Guide

Hypothesis is transitioning to a utility-first approach for CSS styling, supported by [Tailwind CSS](https://tailwindcss.com/). We use [SASS](https://sass-lang.com/) to build output CSS stylesheets.

Using Tailwind's utility-first approach obviates the need to spend much time thinking about or documenting how CSS classes should be named or organized, and can prevent us from creating tempting but sometimes confusing or unmaintainable abstractions.

Our current CSS conventions are:

- Use a utility-first approach and let it help you shape your components:
  - Use Tailwind utility classes within the source markup for components whenever possible
  - Find yourself repeating classes in a component? It may be a signal to break that component up. Be liberal with the creation of sub-components to avoid repeating yourself (especially within the same component module).
- Use Tailwind configuration to express and define the design system:
  - Each application starts with the [shared Tailwind preset](https://github.com/hypothesis/frontend-shared/blob/main/src/tailwind.preset.js) provided by the `frontend-shared` package
  - Each application may extend that Tailwind preset with local values (e.g. [the client's current configuration](https://github.com/hypothesis/client/blob/master/tailwind.config.mjs))
- Make use of layers:
  - Each CSS (SASS) entrypoint should enable the [Tailwind `base`, `components` and `utilities` layers](https://tailwindcss.com/docs/functions-and-directives#layer) and should structure any partials/imports along the lines of those layers.
  - Using Tailwind layers for now puts us in a prime position to take advantage of native CSS layers.
- Be thoughtful when authoring external CSS:
  - External CSS: it's sometimes necessary! We're not aiming for an airtight system in which there is no external CSS. Use your judgment. On the other hand, check first: can you do it with Tailwind/a utility class instead?
  - Add external CSS to the relevant Tailwind layer, and use the [`@apply` directive](https://tailwindcss.com/docs/functions-and-directives#apply) to inline Tailwind utility classes.
  - Be alert if you find yourself trying to come up with class names or Tailwind configuration property names. Re-consider if there is a Tailwind-y way to avoid naming and abstractions.
- Don't rely too much on SASS' features:
  - Avoid SASS variables, mixins, and functions.
  - Remove unused SASS (variables, mixins, etc.) as you encounter them.
- Respect specificity and the cascade (in external CSS):
  - Most selectors should have a specificity of 0 1 0 (equates to a single classname, e.g.[`.my-selector`](https://polypane.app/css-specificity-calculator/#selector=.my-selector)).
  - Use layers (ordering) to your advantage. Given equal specificity, something in the `utilities` layer should override something in the `components` layer, e.g.
  - Be very wary about selectors with higher specificity
  - Avoid nesting, especially deep nesting, in SASS
- Style with empathy
  - We use [`classnames`](https://www.npmjs.com/package/classnames) in our UI components to split up long lists of utility classes and provide commenting ([example](https://github.com/hypothesis/client/blob/6d50b1b5465c2f1c83d6bb3f673e8266b5396c85/src/annotator/components/AdderToolbar.js))
  - We comment our external CSS carefully and structure it for best comprehensibility ([example](https://github.com/hypothesis/client/blob/master/src/styles/annotator/components/Buckets.scss))

## Transitioning and legacy SASS

At time of writing, Hypothesis front-end apps are midway through transitioning a from BEM-convention, heavy-mixin, highly-abstracted SASS structure to Tailwind/utility-first. Existing non-Tailwind SASS should be migrated as time allows.

## Browser Support

Hypothesis applications should work within any modern web browser (a version of Chrome, Firefox, Safari, Microsoft Edge, or equivalent released within the last 12 months). Note that as of 1 July 2020, Hypothesis does not support Internet Explorer.

## Further Reading

- [Tailwind CSS documentation](https://tailwindcss.com/docs/installation): Tailwind documents it and explains it so we don't have to
- [Trello's CSS Guidelines](https://github.com/trello/trellisheets) . See also the 'Further Reading'
  section at the end of that article
- [Strategies for Keeping CSS specificity low](https://css-tricks.com/strategies-keeping-css-specificity-low) explains the problems with CSS specificity and why most formalized approaches to CSS advocate flat structures
- [CSS Tricks](https://css-tricks.com/css/) has links to blog posts and guides from other projects on the tools and approaches they use to styling web UIs
