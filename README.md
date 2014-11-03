[![Build Status](https://travis-ci.org/karma-runner/karma-commonjs.svg?branch=master)](https://travis-ci.org/karma-runner/karma-commonjs)

# karma-commonjs

> A Karma plugin that allows testing [CommonJS] modules in the browser.

## Browserify

If you're using Browserify to compile your projects you should consider [karma-bro](https://github.com/Nikku/karma-bro) which offers full support for the Browserify API and fast rebuilds. 

#### karma-commonjs
* Is lightweight and loads your code as-is
* Supports Node's `require` algorithm
* Requires you to manually add modules from `node_modules` to `karma.files` and `karma.preprocessors`
* Loads each file individually and can limit refreshes to changed files

#### karma-bro
* Creates a temporary bundle using Browserify and offers sourcemap support to assist in debugging
* Fully supports the Browserify API, including transforms, plugins, and shims for Node globals like `Buffer`
* Uses [watchify](https://github.com/substack/watchify) to perform fast incremental rebuilds when bundle contents change
* Automatically traverses all `require` calls to include modules in the bundle

## Installation

The easiest way is to keep `karma-commonjs` as a devDependency:

`npm install karma-commonjs --save-dev`

which should result in the following entry in your `package.json`:

```json
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-commonjs": "~0.2"
  }
}
```

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', 'commonjs'],
    files: [
      // your tests, sources, ...
    ],

    preprocessors: {
      '**/*.js': ['commonjs']
    }
  });
};
```
Additionally you can specify a root folder (relative to project's directory) which is used to look for required modules:
```
commonjsPreprocessor: {
  modulesRoot: 'some_folder'  
}
```
When not specified the root folder defaults to the `karma.basePath/node_modules` configuration option.

For an example project, check out Karma's [client tests](https://github.com/karma-runner/karma/tree/master/test/client).

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
[CommonJS]: http://www.commonjs.org/
[Browserify]: https://github.com/substack/node-browserify
