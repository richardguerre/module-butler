## module-butler

A React Relay CLI that takes in GraphQL fragments and outputs React components.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/module-butler.svg)](https://npmjs.org/package/module-butler)
[![Downloads/week](https://img.shields.io/npm/dw/module-butler.svg)](https://npmjs.org/package/module-butler)
[![License](https://img.shields.io/npm/l/module-butler.svg)](https://github.com/richardguerre/module-butler/blob/master/package.json)

## Table of Contents

<!-- toc -->
* [Geting started](#geting-started)
* [Example](#example)
* [Tips](#tips)
* [Templates](#templates)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Geting started

1. Install module-butler within your project or globally or use it with `npx` directly.

```
yarn add -D module-butler
```

or

```
npm install -D module-butler
```

or

```
npx module-butler init
```

2. Set up module-butler by running:

```
module-butler init
```

or

```
npx module-butler init
```

3. Makes changes in `.module-butler/config.js`
4. Make changes to any template in `.module-butler/templates/`.
5. Add your GraphQL fragments in `.module-butler/inpug.graphql`. (See [example](#example))
6. Generate your components by running:

```
module-butler generate
```

or

```
npx module-butler generate
```

# Example

The following example used the templates that come out-of-the-box when running `module-butler init`.

## Input

```graphql
// .module-butler/input.graphql
Hello,
World

// Tip: add all your modules to generate all components at the same time.
```

## Outputs

> `src/components/` is the default output directory. You can change it by adding `outputDirectory` in `.module-butler/config.js`.

```js
// src/components/Hello/index.js
console.log('module name:', 'Hello');
```

```js
// src/components/World/index.js
console.log('module name:', 'Hello');
```

# Tips

## Add a script in package.json

It is recommended to add a script in package.json, that runs `module-butler generate` and any other script, like prettier.
For example:

```json
{
  "scripts": {
    "module-butler": "module-butler generate && relay-compiler && prettier --write src/components/"
  }
}
```

Then you can just run `npm run module-butler` or `yarn module-butler`.

## Adding/removing/customizing templates

By default, running `module-butler init`, provides you with a default `index.js` template and you can change it any way you want. You can then, for example, create a `utils.ts` template for your utility functions. You can even change the file name of the template, like adding the module name, `{{name}}`, or changing the file extension to `.ts` instead of `.js`.

# Templates

Templates in `.module-butler/templates/` use handlebars as the templating language.

- Both the file name and file content are templatable, and have access to the same handlebars context.
- You can refer to `.module-butler/templateAPI.ts` for the full handlebars context.
- You can add or remove templates
- The handlebars file extension of templates (i.e. `.hbs`) is removed when generating your components, but you are free to remove it from the template itself. The `.hbs` extension is only used for code editors, like VS Code, to recognize that its a handlebars file and give you syntax highlighting for that.

# Usage

<!-- usage -->
```sh-session
$ npm install -g module-butler
$ module-butler COMMAND
running command...
$ module-butler (-v|--version|version)
module-butler/0.2.0 darwin-x64 node-v14.17.1
$ module-butler --help [COMMAND]
USAGE
  $ module-butler COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`module-butler generate`](#module-butler-generate)
* [`module-butler help [COMMAND]`](#module-butler-help-command)
* [`module-butler init`](#module-butler-init)

## `module-butler generate`

generates component using GraphQL operations in input.graphql and template files in the templates directory.

```
USAGE
  $ module-butler generate

OPTIONS
  -F, --force  forcibly overwrite existing files
  -h, --help   show help for generate command
```

_See code: [src/commands/generate.ts](https://github.com/richardguerre/module-butler/blob/v0.2.0/src/commands/generate.ts)_

## `module-butler help [COMMAND]`

display help for module-butler

```
USAGE
  $ module-butler help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `module-butler init`

sets up module-butler by creating config.js, templates/*.hbs files, input in .module-butler/ directory.

```
USAGE
  $ module-butler init

OPTIONS
  -h, --help  show help for init command
```

_See code: [src/commands/init.ts](https://github.com/richardguerre/module-butler/blob/v0.2.0/src/commands/init.ts)_
<!-- commandsstop -->
