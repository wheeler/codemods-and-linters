// Commands to run (must be run in higher bash version than default on mac to get ** glob to work)
// bash
// shopt -s globstar
// jscodeshift -t script/jscodeshift/remove_find_react_modal.js frontend/javascripts/spec/**/components/**/*.jsx

export default function transformer(file, api) {
  const j = api.jscodeshift;
  let hasImport = false;

  let s = j(file.source);

  // remove Import
  s.find(j.ImportDeclaration, { specifiers: [{ imported: { name: 'findReactModal' } }] }).forEach(
    path => {
      hasImport = true;
      path.replace();
    },
  );

  if (!hasImport) {
    return;
  }

  // remove calls to findReactModal (use argument instead)
  s.find(j.CallExpression, {
    callee: { name: 'findReactModal' },
  }).replaceWith((path, idx) => {
    if (path.value.arguments.length === 1) {
      return path.value.arguments[0];
    } else throw "More than one argument to findReactModal... don't know what to do";
  });

  return s.toSource({ quote: 'single' });
}
