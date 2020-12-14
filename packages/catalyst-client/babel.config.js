module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false
      }
    ],
    ['@babel/preset-typescript', { jsxPragma: 'h' }]
  ],
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        pragma: 'h',
        pragmaFrag: 'Fragment'
      }
    ],
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ]
};
