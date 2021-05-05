Hypothesis Front-end Toolkit
============================

This repository contains shared tools, documentation and resources for
front-end projects in Hypothesis.

## Documentation

The `docs/` folder contains our style guides and other documentation which is
useful when writing Hypothesis code across different projects.

* [JavaScript guide](docs/js-guide.md)
* The [CSS Style Guide](docs/css-style-guide.md)
* Guidelines for [creating accessible web user interfaces](docs/accessibility.md)

## Packages

The `packages/` folder contains a set of npm packages that provide resources such
as base config files for front-end tooling, utility scripts etc. that are
useful across multiple Hypothesis projects. These include:

 - [**eslint-config-hypothesis**](packages/eslint-config-hypothesis) - A [shareable configuration](http://eslint.org/docs/developer-guide/shareable-configs)
   for ESLint

### Publishing package updates

Prerequisites:

- Set up an npm account with 2FA enabled, and ask a lead developer to add you to
  the [Hypothesis](https://www.npmjs.com/settings/hypothesis/packages)
  organization in npm
- Ensure that the package you want to publish is associated with the `developers`
  team in this organization

To publish a new version of a package:

1. Ensure any changes you want to include have been merged. Then check out the
   `master` branch of the repository and switch to the package's directory.
2. Add an entry for the new version of the package in the changelog.
   See https://keepachangelog.com/en/1.0.0/ for details of the format that we use.
3. Run `npm version` with appropriate flags (eg. `npm version minor`) to update
   the package version.
4. Commit and push the changes from the previous step
5. Run `npm publish` to publish the new version
