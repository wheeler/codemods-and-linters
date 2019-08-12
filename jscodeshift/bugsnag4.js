// Commands to run (must be run in higher bash version than default on mac to get ** glob to work)
// bash
// shopt -s globstar
// jscodeshift -t script/jscodeshift/bugsnag4.js frontend/**/*.js*

export default function transformer(file, api) {
  const j = api.jscodeshift;
  let hasChanged = false;

  let s = j(file.source);

  s.find(j.CallExpression, {
    callee: { object: { name: 'Bugsnag' }, property: { name: 'notify' } },
  }).forEach(path => {
    const args = path.value.arguments;

    if (args.length > 1 && args[0].type !== 'ObjectExpression') {
      const [name, message, meta, severity] = args;
      const newArgs = [
        j.objectExpression([
          j.property('init', j.identifier('name'), name),
          j.property('init', j.identifier('message'), message),
        ]),
      ];
      const optProperties = [];
      if (meta) {
        optProperties.push(j.property('init', j.identifier('metaData'), meta));
      }
      if (severity) {
        optProperties.push(j.property('init', j.identifier('severity'), severity));
      }
      if (optProperties.length) {
        newArgs.push(j.objectExpression(optProperties));
      }
      path.value.arguments = newArgs;
      hasChanged = true;
    }
  });

  if (!hasChanged) {
    return;
  }

  return s.toSource({ quote: 'single' });
}
