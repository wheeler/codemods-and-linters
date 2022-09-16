// find frontend/javascripts/ -name *.[jt]sx | xargs jscodeshift -t script/rr-link-migration.js --parser=tsx
// git ls-files -m | xargs yarn eslint --fix --quiet

const variantMap = {
  buttonPrimary: 'primary',
  buttonSecondary: 'secondary',
  buttonDelete: 'primary',
};

/** @typedef { import('@types/jscodeshift').core } core */
/**
 * @param file {core.FileInfo}
 * @param api {core.API}
 **/
export default function transformer(file, api) {
  const j = api.jscodeshift;
  let root = j(file.source);

  let importDeclaration = root.find(j.ImportDeclaration, {
    source: { value: '@gusto/component-library/lib/Link' },
  });

  if (!importDeclaration.length) {
    return false;
  }

  const localName = importDeclaration.find(j.ImportDefaultSpecifier).get('local', 'name').value;
  importDeclaration.get().replace("import { Link } from '@gusto/workbench-react-router';");

  // Now, do the migration from one component to the other
  root.findJSXElements(localName).forEach(path => {
    path.value.openingElement.name.name = 'Link';
    path.value.closingElement.name.name = 'Link';

    // href => to
    let { attributes } = path.value.openingElement;
    const hrefProp = attributes.find(attr => attr.name.name === 'href');
    if (hrefProp) {
      hrefProp.name.name = 'to';
    }

    // styleAs => variant
    const styleAs = attributes.find(attr => attr.name.name === 'styleAs');
    if (styleAs) {
      const oldStyle = styleAs.value.value;
      if (oldStyle === 'linkDelete') {
        attributes.push(j.jsxAttribute(j.jsxIdentifier('color'), j.literal('error')));
        path.value.openingElement.attributes = attributes.filter(
          attr => attr.name.name !== 'styleAs',
        );
      } else {
        styleAs.name.name = 'variant';
        styleAs.value = j.literal(variantMap[oldStyle]);
        if (oldStyle === 'buttonDelete') {
          attributes.push(j.jsxAttribute(j.jsxIdentifier('color'), j.literal('error')));
        }
      }
    }
  });

  return root.toSource();
}
