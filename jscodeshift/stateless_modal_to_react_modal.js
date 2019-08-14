// Commands to run (must be run in higher bash version than default on mac to get ** glob to work)
// jscodeshift -t script/jscodeshift/react_modal_codemod.js frontend/javascripts/components/**/*.jsx
// jscodeshift -t script/jscodeshift/react_modal_codemod.js frontend/javascripts/spec/components/**/*.jsx

export default function transformer(file, api) {
  const j = api.jscodeshift;
  let hasImport = false;

  let s = j(file.source);

  // replace StatelessModal Import
  s.find(j.ImportDeclaration)
    .find(j.ImportSpecifier)
    .filter(p => p.value.imported.name === 'StatelessModal')
    .forEach(path => {
      hasImport = true;
      path.value.imported.name = 'ReactModal';
    });

  if (!hasImport) {
    return s.toSource();
  }

  // replace JSX identifiers and update open attribute
  s.findJSXElements('StatelessModal').forEach(path => {
    path.value.openingElement.name.name = 'ReactModal';
    path.value.closingElement.name.name = 'ReactModal';
    path.value.openingElement.attributes.forEach(attr => {
      if (attr.name.name === 'open') {
        attr.name.name = 'show';
      }
    });
  });

  // const replaceObjectName = path => (path.value.object.name = "ReactModal");
  // s.find(j.JSXMemberExpression, {
  //   object: { name: "Modal" },
  //   property: { name: "Header" }
  // }).forEach(replaceObjectName);
  // s.find(j.JSXMemberExpression, {
  //   object: { name: "Modal" },
  //   property: { name: "Body" }
  // }).forEach(replaceObjectName);

  // replace non jsx references
  s.find(j.Identifier, { name: 'StatelessModal' }).forEach(path => {
    path.value.name = 'ReactModal';
  });

  // replace variable names
  s.find(j.Identifier, { name: 'statelessModal' }).forEach(path => {
    path.value.name = 'reactModal';
  });

  // replace object property names
  s.find(j.Identifier, { name: 'open' })
    .filter(path => ['Property'].includes(path.parentPath.value.type))
    .forEach(path => {
      path.value.name = 'show';
    });

  // replace String references
  s.find(j.Literal)
    .filter(path => path.value.raw.includes('StatelessModal'))
    .forEach(path => {
      path.value.value = path.value.value.replace(/StatelessModal/g, 'ReactModal');
    });

  s.find(j.Literal)
    .filter(path => path.value.value === 'open')
    .forEach(path => (path.value.value = 'show'));

  return s.toSource();
}
