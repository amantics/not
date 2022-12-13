module.exports = {
  displayName: 'web',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\.vue$': 'vue3-jest',
    '.+\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '^.+\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ["ts", "tsx", "vue", "js", "json"],
  coverageDirectory: '../../coverage/apps/web',
  snapshotSerializers: ['jest-serializer-vue'],
  globals: {
    'ts-jest': { 
      tsconfig: 'apps/web/tsconfig.spec.json',
      babelConfig: 'apps/web/babel.config.js',
    },
    'vue-jest': {
      tsConfig: 'apps/web/tsconfig.spec.json',
      babelConfig: 'apps/web/babel.config.js',
    },
  },
};
