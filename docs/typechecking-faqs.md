# Typechecking FAQs

This is a collection of answers to common questions/issues that have appeared
when documenting JS code in a way that TypeScript can check.

## Where is the canonical reference for how to specify types/write JSDoc?

See the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/basic-types.html) and in particular, [the JSDoc page](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) and [checking JavaScript files page](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html).

## How do I tell TS to ignore a line of code?

Put `@ts-ignore` in a comment to ignore the next line.

## What are the conventions for specifying prop types for Preact components?

Given:

```js
function MyButton({ label }) {
}
```

You can specify the prop types using JSDoc via:

```js
/**
 * @typedef MyButtonProps
 * @prop {string} label
 */

/**
 * @param {MyButtonProps} props
 */
function MyButton({ label }) {
}
```

For small helper components which are not exported from a module, you can, optionally, use a more succinct "inline" syntax:

```js
/**
 * @param {Object} props
 * @param {string} props.label
 */
function MyButton({ label }) {
}
```

## How do I tell TS about the type of a class field?

TS will infer the type of a class field from assignments to it. In some cases you may need to override the inferred type:

```js
constructor() {
  /** @type {'left'|'right'} */
  this.direction = 'left';
}
```

In this example, `this.direction` is inferred as the string `'left'`, but here we tell TS that this value can be set to `'left'` or `'right'` elsewhere.

## How do I set a CSS property or HTML attribute that is a boolean or number rather than a string?

Given code like this:

```js
someElement.setAttribute('attr', 42)
```

TS will complain that attribute values must be strings. Technically this is correct, although it would normally be implicitly converted and this happens to work OK. In this case you need to do the conversion explicitly:

```js
someElement.setAttribute('attr', myNumber.toString())
```

## How do I tell TS that a variable is not null/undefined?

Sometimes will warn that a value might be null or undefined in a certain context and that this case is not handled.

First, have a think about whether TS is right. If so, add a check for this.

Sometimes you may know that a value cannot be null for reasons that may not be obvious from a glance at the code. In this case you can use a typecast.

For example, supposing you have an HTMLElement and you try to access its `parentElement`. In general, that property can be null if the element has no parent. You might know that this cannot be the case in a certain situation though:

```js
const parentEl = /** @type {HTMLElement} */ (someElement.parentElement)
```

(Aside: In `.ts` files there is a shorter way to write this. In the TS expression `someElement.parentElement!.someProperty` the `!` is a shorthand for "trust me, I know this isn't null. I don't know of an equivalent that you can use in `.js` files).

## How should I specify types when using `useRef` or `useState` hooks?

For `useRef` and `useState`, the recommended pattern is to pass an argument to these hooks, specify the type on that
and let TypeScript infer the rest:

```js
// [1] In the common case where a ref is initially null and is set to an HTML element after
// the first render, use a union.
const myRef = useRef(/** @type {HTMLElement|null} */ (null));

// [2] If a ref always has the same type, everything can be inferred from the argument.
const aCounter = useRef(42);

// [3] If state always has the same type, everything can be inferred from the argument.
const [isLoading, setLoading] = useState(false);

// [4] If state is initialized with a value of one type and later replaced with
// a value of a different type, use a union.
const [error, setError] = useState(/** @type {Error|null} */ (null));
```

In example 1, a useful quirk of the way `useRef` is specified is that any `null` gets "erased"
from the inferred type so you can later use `myRef.current` without an explicit null check.
This quirk is also a limitation - if there is an unusual scenario where you later reset `myRef.current`
back to null and forget to check, TS won't warn you.

Note that this pattern is not limited to hooks, it can work for any function where the type
of the result can be inferred if the type of the argument is known.

