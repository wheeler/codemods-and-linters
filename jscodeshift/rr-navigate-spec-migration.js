// call on a list of tests effected by rr-navigate-migration.js
// jscodeshift -t zenpayroll/script/rr-navigate-spec-migration.js --parser=tsx [...]

import {
  findJestMockForModule,
  insertAfterLastMockOrImport,
  insertBeforeMockNamed,
} from './jscodeshift-helpers';

/** @typedef { import('@types/jscodeshift').core } core */
/**
 * @param file {core.FileInfo}
 * @param api {core.API}
 **/
export default function transformer(file, api) {
  const j = api.jscodeshift;
  let root = j(file.source);

  // find all instances of expect(Payroll.router.navigate)
  const navigates = root.find(j.MemberExpression, {
    object: { object: { name: 'Payroll' }, property: { name: 'router' } },
    property: { name: 'navigate' },
  });

  let needsMockPush = false;
  let needsMockReplace = false;

  navigates.forEach(p => {
    if (p.parent.value.callee.name === 'expect') {
      if (
        p.parent.parent.value.property.name === 'toHaveBeenCalledWith' &&
        p.parent.parent.parent.value.arguments.length === 2 &&
        p.parent.parent.parent.value.arguments[1].type === 'ObjectExpression'
      ) {
        const options = p.parent.parent.parent.value.arguments[1];
        const jOptions = j(options);
        if (
          jOptions.find(j.ObjectProperty, { key: { name: 'trigger' }, value: { value: false } })
            .length
        ) {
          throw new Error('Cannot handle trigger: false option');
        } else if (
          jOptions.find(j.ObjectProperty, { key: { name: 'replace' }, value: { value: true } })
            .length
        ) {
          needsMockReplace = true;
          p.replace('mockHistoryReplace');
        } else {
          needsMockPush = true;
          p.replace('mockHistoryPush');
        }
      } else {
        needsMockPush = true;
        p.replace('mockHistoryPush');
      }

      const args = p.parent.parent.value.arguments;
      if (args && args.length > 1) {
        p.parent.parent.value.arguments = [args[0]];
      }
    }
  });

  if (needsMockPush || needsMockReplace) {
    let existingMock = findJestMockForModule('react-router-dom', j, root);

    if (existingMock.length) {
      const existingUseHistory = j(existingMock.paths()[0]).find(j.ObjectProperty, {
        key: { name: 'useHistory' },
      });
      if (existingUseHistory.length) {
        // console.log('has existing useHistory');
        const existingPush = j(existingUseHistory.paths()[0]).find(j.ObjectProperty, {
          key: { name: 'push' },
        });
        if (existingPush.length) {
          // console.log('existing push', existingPush.paths()[0].value.value);
          if (existingPush.paths()[0].value.value.name !== 'mockHistoryPush') {
            throw new Error('is already mocked but not called mockHistoryPush');
          }
        } else {
          throw new Error('no existing push');
        }
      } else {

        const properties = [];

        if (needsMockPush) {
          properties.push(j.objectProperty(j.identifier('push'), j.identifier('mockHistoryPush')));
        }
        if (needsMockReplace) {
          properties.push(
            j.objectProperty(j.identifier('replace'), j.identifier('mockHistoryReplace')),
          );
        }

        existingMock
          .paths()[0]
          .value.arguments[1].body.properties.push(
            j.objectProperty(
              j.identifier('useHistory'),
              j.arrowFunctionExpression([], j.objectExpression(properties)),
            ),
          );

        if (needsMockPush) {
          insertBeforeMockNamed(j, root, 'react-router-dom', 'const mockHistoryPush = jest.fn();');
        }
        if (needsMockReplace) {
          insertBeforeMockNamed(
            j,
            root,
            'react-router-dom',
            'const mockHistoryReplace = jest.fn();',
          );
        }
      }
    } else {
      // find mock position: after last mock or after last import
      insertAfterLastMockOrImport(
        j,
        root,
        "const mockHistoryPush = jest.fn();\njest.mock('react-router-dom', () => ({\n  useHistory: () => ({ push: mockHistoryPush }),\n}));",
      );
    }
  }

  return root.toSource();
}
