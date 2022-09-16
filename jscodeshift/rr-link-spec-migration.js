// jscodeshift -t script/rr-link-spec-migration.js --parser=tsx --stdin < script/failure_spec_list.txt

/** @typedef { import('@types/jscodeshift').core } core */
/**
 * @param file {core.FileInfo}
 * @param api {core.API}
 **/
export default function transformer(file, api) {
  const j = api.jscodeshift;
  let root = j(file.source);

  // Does any argument look like a router as a wrapper
  const checkForComplete = (args, wrapperName) => {
    return (
      args.length >= 2 &&
      args[1].properties.some(p => p.key.name === wrapperName && p.value.name.includes('Router'))
    );
  };

  let mountImportDeclaration = root.find(j.ImportDeclaration, {
    source: { value: 'enzyme' },
    specifiers: [{ imported: { name: 'mount' } }],
  });
  let renderImportDeclaration = root
    .find(j.ImportDeclaration, { source: { value: '@testing-library/react' } })
    .filter(path => {
      const renderImport = j(path).find(j.ImportSpecifier, { imported: { name: 'render' } });
      return !!renderImport.length;
    });

  // NEITHER = Do nothing
  if (!mountImportDeclaration.length && !renderImportDeclaration.length) {
    console.log(file.path, '- no mount/render import');
    return false;
  }

  let mountAlreadyComplete = false;
  let renderAlreadyComplete = false;

  // ENZYME mount()
  if (mountImportDeclaration.length) {
    const mountCalls = root.find(j.CallExpression, { callee: { name: 'mount' } });
    mountCalls.forEach(path => {
      if (checkForComplete(path.value.arguments, 'wrappingComponent')) {
        mountAlreadyComplete = true;
        return;
      }
      if (path.value.arguments.length !== 1)
        throw Error(
          `there were ${path.value.arguments.length} arguments to "mount()" which is not handled`,
        );
      path.value.arguments.push('{ wrappingComponent: StaticRouter }');
    });
  }

  // RTL render()
  if (renderImportDeclaration.length) {
    const renderLocalName = renderImportDeclaration
      .find(j.ImportSpecifier, { imported: { name: 'render' } })
      .get('local', 'name').value;

    const renderCalls = root.find(j.CallExpression, { callee: { name: renderLocalName } });
    renderCalls.forEach(path => {
      if (checkForComplete(path.value.arguments, 'wrapper')) {
        renderAlreadyComplete = true;
        return;
      }
      if (path.value.arguments.length !== 1)
        throw Error(
          `there were ${path.value.arguments.length} arguments to "render()" which is not handled`,
        );
      path.value.arguments.push('{ wrapper: StaticRouter }');
    });
  }

  if (mountImportDeclaration.length && !mountAlreadyComplete) {
    let shimImportDeclaration = root.find(j.ImportDeclaration, {
      source: { value: '@gusto/legacy-test-shims/enzyme' },
    });
    if (shimImportDeclaration.length) {
      shimImportDeclaration.insertAfter("import { StaticRouter } from 'react-router-dom';");
    } else {
      mountImportDeclaration.insertAfter("import { StaticRouter } from 'react-router-dom';");
    }
  } else if (renderImportDeclaration.length && !renderAlreadyComplete) {
    renderImportDeclaration.insertAfter("import { StaticRouter } from 'react-router-dom';");
  }

  if (mountAlreadyComplete || renderAlreadyComplete) {
    console.log(file.path, '- looks already completed');
  }

  return root.toSource();
}
