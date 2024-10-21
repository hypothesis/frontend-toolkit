# Typechecking FAQs

This is a collection of answers to some common questions that have arisen when using TypeScript in our projects,
especially from developers who are new to the language.

## Where is the canonical reference for how to specify types/write TypeScript and JSDoc?

See the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/basic-types.html).

For code that is authored in JS and annotated using JSDoc comments, see [the JSDoc page](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) and [checking JavaScript files page](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html).

## How do I tell TS to ignore a line of code?

Put `@ts-ignore` in a comment to ignore the next line.

## What are the conventions for specifying prop types for Preact components?

Props are described using TypeScript and documented using JSDoc, like so:

```tsx
export type MyButtonProps = {
  /** Text label for the button. */
  label: string;
};

export default function MyButton({ label }: MyButtonProps) {
  // Content here
}
```

For small helper components which are not exported from a module, you can, optionally, use a more succinct "inline" syntax:

```tsx
function MyButton({ label }: { label: string }) {
}
```

## How do I set a CSS property or HTML attribute that is a boolean or number rather than a string?

Given code like this:

```js
someElement.setAttribute('attr', 42)
```

TS will complain that attribute values must be strings, although the code would actually work as the value would be coerced
at runtime. To keep TS happy, convert the value explicitly:

```js
someElement.setAttribute('attr', myNumber.toString())
```

## How do I tell TS that a variable is not null/undefined?

Sometimes will warn that a value might be null or undefined in a certain context and that this case is not handled.

First, have a think about whether TS is right. If so, add a check for this.

Sometimes you may know that a value cannot be null for reasons that may not be obvious from a glance at the code. In this case you can use the `!` operator
or a `value as T` type cast.

For example, supposing you have an HTMLElement and you try to access its `parentElement`. In general, that property can be null if the element has no parent. You might know that this cannot be the case in a certain situation though:

```ts
const parentEl = someElement.parentElement!;
```
