# codemods-and-linters
Codemods and eslint rules written by me, @wheeler.

## jscodeshift

[bugnsag4.js](jscodeshift/bugsnag4.js) - Helper to convert `Bugsnag.notify` "handled" calls from v3 format to v4 format

[findReactModal.js](jscodeshift/findReactModal.js) - remove a wrapping function call and its import.

[stateless_modal_to_react_modal.js](jscodeshift/stateless_modal_to_react_modal.js) - Replace one JSX component with another and change one prop name.

[static_property_placement.js](jscodeshift/static_property_placement.js) - Extract React static properties from inside the class `static foo` to below `Class.foo = `. Helps adopt current eslint-config-airbnb@18 rules.


## eslint-configs

[Some eslint configs I have written or used](eslint-configs.js).

## Helpful Docs:

https://rawgit.com/facebook/jscodeshift/master/docs/Collection.html
