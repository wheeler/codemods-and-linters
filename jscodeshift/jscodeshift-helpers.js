/**
 * Attempts to find the closest closure that is a react function component.
 *
 * @param path
 * @returns {*}
 */
export const closestFnComponentScope = path => {
  if (!path || !path.scope || !path.scope.path) return;
  const scope = path.scope.path;

  let componentName;
  if (scope.value.type === 'FunctionDeclaration') {
    componentName = scope.value.id.name;
  } else if (scope.parent.value.type === 'VariableDeclarator') {
    componentName = scope.parent.value.id.name;
  }

  if (componentName) {
    const isPascal = /^[A-Z]/.test(componentName);
    if (isPascal) {
      // if the thing that might be a component is PascalCase it's probably a component
      return scope;
    } else {
      // console.log('found a var but it was not pascal', scope.parent.value.id.name);
    }
  } else {
    // console.log('this scope was not a var or function');
  }

  return closestFnComponentScope(scope.parent);
};

const getRootBodyNodes = (j, root) => root.find(j.Program).paths()[0].value.body;

/**
 * inserts at location after last mock or import
 * TODO: make this sensitive to existing mocks
 * @param j
 * @param root
 * @param content
 */
export const insertAfterLastMockOrImport = (j, root, content) => {
  let bodyNodes = getRootBodyNodes(j, root);
  let idx = bodyNodes.length;
  while (idx >= 0) {
    idx -= 1;
    const node = bodyNodes[idx];
    if (node.type === 'ImportDeclaration' || j(node).toSource().startsWith('jest.mock(')) {
      break;
    }
  }

  bodyNodes.splice(idx + 1, 0, content);
};

/**
 * insert before mock
 * @param j
 * @param root
 * @param mockName
 * @param content
 */
export const insertBeforeMockNamed = (j, root, mockName, content) => {
  let bodyNodes = getRootBodyNodes(j, root);
  const idx = bodyNodes.indexOf(node => j(node).toSource().startsWith(`jest.mock('${mockName}'`));

  bodyNodes.splice(idx - 1, 0, content);
};

export const addNamedImport = ({ root, name, source }) => {
  let importDeclarations = root.find(j.ImportDeclaration);

  const sourceImports = importDeclarations.filter({ foo: 'bar' });
  if (sourceImports.length) {
    memberImports = sourceImports.find();
  }
  throw new Error('testing');
  const firstImportPath = importDeclarations.paths()[0];
  j(firstImportPath).insertAfter("import { useHistory } from 'react-router-dom';");
};

export const findJestMockForModule = (module, j, root) => {
  return root
    .find(j.CallExpression, {
      callee: { object: { name: 'jest' }, property: { name: 'mock' } },
    })
    .filter(path => path.value.arguments[0].value === 'react-router-dom');
};
