// find zenpayroll/frontend/javascripts/components/ -name *.[jt]sx | xargs jscodeshift -t zenpayroll/script/rr-navigate-migration.js --parser=tsx

import { closestFnComponentScope } from './jscodeshift-helpers';

/** @typedef { import('@types/jscodeshift').core } core */
/**
 * @param file {core.FileInfo}
 * @param api {core.API}
 **/
export default function transformer(file, api) {
  const j = api.jscodeshift;
  let root = j(file.source);

  // find all instances of Payroll.router.navigate()
  const calls = root.find(j.CallExpression, {
    callee: {
      object: { object: { name: 'Payroll' }, property: { name: 'router' } },
      property: { name: 'navigate' },
    },
  });

  if (!calls.length) {
    return false;
  }

  let needsImport = false;

  const componentsNeedingHistory = [];

  calls.forEach(path => {
    const fnComp = closestFnComponentScope(path);
    if (fnComp) {
      let method = 'push';
      if (path.value.arguments[1]) {
        if (path.value.arguments[1].type === 'ObjectExpression') {
          const props = path.value.arguments[1].properties;
          const triggerProp = props.find(p => p.key.name === 'trigger');
          if (triggerProp) {
            if (!triggerProp.value.value) {
              throw new Error('MIGRATION -- trigger FALSE -- do not know what to do');
            }
          }
          const replaceProp = props.find(p => p.key.name === 'replace');
          if (replaceProp) {
            if (replaceProp.value.value) {
              method = 'replace';
            } else {
              throw new Error('MIGRATION -- do not understand the replace prop value');
            }
          }
        } else if (
          path.value.arguments[1].type === 'BooleanLiteral' &&
          path.value.arguments[1].value === false
        ) {
          throw new Error('MIGRATION -- false bool what do i do?');
        }
      }
      path.replace('history.' + method + '(' + j(path.value.arguments[0]).toSource() + ')');
      componentsNeedingHistory.push(fnComp);
      needsImport = true;
    }
  });

  // insert useHistory hook for each component
  new Set(componentsNeedingHistory).forEach(compPath => {
    if (!compPath.value.body.body) {
      throw new Error('FIXABLE -- arrow needs braces');
    }
    compPath.value.body.body.unshift('const history = useHistory();');
  });

  if (needsImport) {
    // TODO: check for existing import
    let importDeclaration = root.find(j.ImportDeclaration);
    const firstImportPath = importDeclaration.paths()[0];
    j(firstImportPath).insertAfter("import { useHistory } from 'react-router-dom';");
  }

  return root.toSource();
}
