// Commands to run (must be run in higher bash version than default on mac to get ** glob to work)
// bash
// shopt -s globstar
// jscodeshift -t script/jscodeshift/static_property_placement.js frontend/javascripts/spec/**/components/**/*.jsx

const staticPropertyNames = [
  'childContextTypes',
  'contextTypes',
  'contextType',
  'defaultProps',
  'displayName',
  'propTypes',
];

const isReactStaticProperty = node =>
  node.type === 'ClassProperty' && node.static && staticPropertyNames.includes(node.key.name);

const assignmentExpressionFromProperty = (j, className, classPropertyNode) => {
  return j.expressionStatement(
    j.assignmentExpression(
      '=',
      j.memberExpression(j.identifier(className), j.identifier(classPropertyNode.key.name), false),
      classPropertyNode.value,
    ),
  );
};

const findBodyIndexOfDeclaration = (path, body) =>
  body.findIndex(node => {
    let classDeclaration = node;
    if (['ExportNamedDeclaration', 'ExportDefaultDeclaration'].includes(classDeclaration.type))
      classDeclaration = node.declaration;
    if (classDeclaration === path.node) return true;
    return false;
  });

const appendNodesAfterClassDeclaration = (path, className, nodes) => {
  const insertIndex = findBodyIndexOfDeclaration(path, path.scope.node.body);
  console.log('scopeIndex', insertIndex);
  path.scope.node.body.splice(insertIndex + 1, 0, ...nodes);
};

const copyReactStaticsOutsideOfClass = (j, path) => {
  // Take the react static properties and place them as assignments after the class declaration
  const reactClassName = path.value.id.name;
  const staticProperties = path.value.body.body.filter(isReactStaticProperty);

  if (staticProperties.length === 0) return;
  // console.log(reactClassName, " has react static properties ", staticProperties.map(p => p.key.name));

  // create assignment expressions from the properties
  const expressions = staticProperties.map(n =>
    assignmentExpressionFromProperty(j, reactClassName, n),
  );

  // append the expressions after the class
  appendNodesAfterClassDeclaration(path, reactClassName, expressions);
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  let root = j(file.source);

  root
    .find(j.ClassDeclaration)
    // filter for classes that are React Components
    .filter(path => path.value.superClass && path.value.superClass.object.name === 'React')
    // copy the react static properties to assignments outside the class
    .forEach(path => copyReactStaticsOutsideOfClass(j, path))
    // now use collection functions to remove those properties inside the class
    .find(j.ClassProperty)
    .filter(p => isReactStaticProperty(p.node))
    .remove();

  return root.toSource({ quote: 'single' });
}
