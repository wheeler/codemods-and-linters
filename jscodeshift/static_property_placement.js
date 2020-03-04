// jscodeshift frontend/javascripts/**/components/**/*.jsx -t script/jscodeshift/static_property_placement.js

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

const getClassIdentifier = classPath => {
  if (classPath.parent.value.type === 'AssignmentExpression') {
    return classPath.parent.value.left;
  }
  return classPath.value.id;
};

const assignmentExpressionFromProperty = (j, classPath, classPropertyNode) =>
  j.expressionStatement(
    j.assignmentExpression(
      '=',
      j.memberExpression(
        getClassIdentifier(classPath),
        j.identifier(classPropertyNode.key.name),
        false,
      ),
      classPropertyNode.value,
    ),
  );

const findScopeBodyArray = path => {
  let body = path.scope.node.body;
  if (body.type === 'BlockStatement') body = body.body;
  return body;
};

const findBodyIndexOfDeclaration = (j, classPath, bodyArray) =>
  bodyArray.findIndex(bodyChild => {
    const pathFind = j(bodyChild)
      .find(j.ClassBody)
      .map(p => p.parent)
      .filter(bodyPath => {
        return bodyPath.node === classPath.node;
      });
    return pathFind.size() !== 0;
  });

const appendNodesAfterClassDeclaration = (j, path, nodesToAdd) => {
  let body = findScopeBodyArray(path);
  const insertIndex = findBodyIndexOfDeclaration(j, path, body);
  // console.log('scopeIndex', insertIndex);
  body.splice(insertIndex + 1, 0, ...nodesToAdd);
};

const copyReactStaticsOutsideOfClass = (j, path) => {
  // Take the react static properties and place them as assignments after the class declaration
  const staticProperties = path.value.body.body.filter(isReactStaticProperty);

  if (staticProperties.length === 0) return;
  // console.log(
  //   reactClassName,
  //   'has react static properties ',
  //   staticProperties.map(p => p.key.name),
  // );

  // create assignment expressions from the properties
  const expressions = staticProperties.map(n => assignmentExpressionFromProperty(j, path, n));

  // append the expressions after the class
  appendNodesAfterClassDeclaration(j, path, expressions);
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  let root = j(file.source);

  root
    .find(j.ClassBody)
    // filter for classes that are React Components
    .filter(path => {
      const { superClass } = path.parent.value;
      return (
        superClass &&
        (superClass.name === 'Component' ||
          (superClass.object && superClass.object.name === 'React'))
      );
    })
    // copy the react static properties to assignments outside the class
    .forEach(path => copyReactStaticsOutsideOfClass(j, path.parent))
    // now use collection functions to remove those properties inside the class
    .find(j.ClassProperty)
    .filter(p => isReactStaticProperty(p.node))
    .remove();

  return root.toSource({ quote: 'single' });
}
