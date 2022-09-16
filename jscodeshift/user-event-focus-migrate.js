// cd ..
// find zenpayroll/frontend/javascripts/ -name *.[jt]sx | xargs jscodeshift -t zenpayroll/script/user-event-focus-migrate.js --parser=tsx
// git ls-files -m | xargs yarn eslint --fix --quiet

/** @typedef { import('@types/jscodeshift').core } core */
/**
 * @param file {core.FileInfo}
 * @param api {core.API}
 **/
export default function transformer(file, api) {
  const j = api.jscodeshift;
  let root = j(file.source);

  let didSomething = false;
  root
    .find(j.CallExpression, {
      callee: { object: { name: 'userEvent' }, property: { name: 'paste' } },
    })
    .forEach(path => {
      if (path.value.arguments.length > 1) {
        const [arg0] = path.value.arguments.splice(0, 1);
        const src0 = j(arg0).toSource();
        j(path)
          .closest(j.ExpressionStatement)
          .insertBefore(src0 + '.focus();');
        didSomething = true;
      }
    });

  if (didSomething) return root.toSource();
}
