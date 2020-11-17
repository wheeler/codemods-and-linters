# codemods-and-linters
Codemods and eslint rules written by me, @wheeler.

## jscodeshift

### Codemod Examples
[bugnsag4.js](jscodeshift/bugsnag4.js) - Helper to convert `Bugsnag.notify` "handled" calls from v3 format to v4 format

[findReactModal.js](jscodeshift/findReactModal.js) - remove a wrapping function call and its import.

[stateless_modal_to_react_modal.js](jscodeshift/stateless_modal_to_react_modal.js) - Replace one JSX component with another and change one prop name.

[static_property_placement.js](jscodeshift/static_property_placement.js) - Extract React static properties from inside the class `static foo` to below `Class.foo = `. Helps adopt current eslint-config-airbnb@18 rules.

[redirect_migration.js](jscodeshift/redirect_migration.js) - Replace a homegrown Redirect component with Redirect from `react-router-dom`. Updates imports, modifies rrd import if existing, swaps a homegrown `redirect` prop for rrd's opposite `push` prop.

### Resources
#### Typescript Definitions

helpful for understanding available methods, params, returns, some contain descriptions.

- ##### [Collection](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jscodeshift/src/Collection.d.ts)

- ##### [Node](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jscodeshift/src/collections/Node.d.ts)

#### Docs

https://rawgit.com/facebook/jscodeshift/master/docs/Collection.html - descriptions of some core functionality

## eslint-configs

[Some eslint configs I have written or used](eslint-configs.js).
