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
