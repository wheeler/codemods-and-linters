## Restrict a particular JSX component

```js
'no-restricted-imports': [
  'error',
  {
    paths: [
      {
        name: 'components/elements',
        importNames: ['Modal'],
        message: 'Modal is deprecated, use ReactModal instead.',
      },
    ],
  },
],
'no-restricted-syntax': [
  'error',
  {
    selector: 'JSXOpeningElement > JSXIdentifier[name="Modal"]',
    message: 'Modal is deprecated, use ReactModal instead.',
  },
],
```

## Restrict a particular class from being extended (`Backbone.Router`)
```js
'no-restricted-syntax': [
  'error',
  {
    selector: 'MemberExpression[object.name="Backbone"][object.property="Router"]',
    message: 'New routers should be written in React Router; old Backbone routers should be migrated.',
  },
],
```

## react/no-unescaped-entities customized with suggestions
```js
'react/no-unescaped-entities': [
  'error',
  {
    forbid: [
      {
        char: '>',
        alternatives: ['&gt;'],
      },
      {
        char: '"',
        alternatives: [
          'We use smartquotes in copy. Replace with open quote “ and close quote ”',
        ],
      },
      {
        char: "'",
        alternatives: [
          'We use smartquotes in copy. Replace with apostrophe ’ option-shift-] on a mac',
        ],
      },
      {
        char: '}',
        alternatives: ['&#125;'],
      },
    ],
  },
],
```