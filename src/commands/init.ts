import { Command, flags } from '@oclif/command';
import * as path from 'path';
import * as fs from 'fs';
import * as logSymbols from 'log-symbols';
import cli from 'cli-ux';
import { indexTemplate, UITemplate, queryTemplate, storiesTemplate, templateAPITypes } from '../utils/templates';
import { Config, RelayConfig } from '../utils/types';
import { isRunningInRoot } from '../utils';

export default class Init extends Command {
  static description = 'sets up module-butler by creating config.js, templates/*.hbs files, input.graphql in .module-butler/ directory.';

  static flags = {
    help: flags.help({ char: 'h', description: 'show help for init command' }),
    all: flags.boolean({
      char: 'a',
      description: 'generate all template files',
    }),
    storybook: flags.boolean({
      description: 'generate storybook template',
    }),
  };

  async run() {
    const { flags } = this.parse(Init);
    if (!isRunningInRoot()) {
      this.error('Cannot run module-butler outside of project root (i.e. directory where package.json is located)');
    }
    const root = process.cwd();
    const relayButlerDir = path.resolve(root, './.module-butler');
    const relayButlerTemplatesDir = path.resolve(relayButlerDir, './templates');

    if (flags.storybook) {
      cli.action.start('Creating Storybook stories template file');
      await fs.promises.writeFile(path.resolve(relayButlerTemplatesDir, './{{componentName}}.stories.tsx.hbs'), storiesTemplate);
      cli.action.stop(logSymbols.success);
      return;
    }

    // get schemaPath from relay.config.js
    let relayConfig: RelayConfig | null = null;
    try {
      relayConfig = require(path.resolve(root, './relay.config.js'));
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        this.warn(`Could not find relay.config.js in ${root}. Please make sure that the schemaPath in .module-butler/config.json is correct.`);
      } else {
        this.error(err);
      }
    }

    // recursively create .module-butler/templates directory in project root
    cli.action.start('Creating .module-butler directory');
    await fs.promises.mkdir(relayButlerTemplatesDir, {
      recursive: true,
    });
    cli.action.stop(logSymbols.success);

    // write .module-butler/config.js
    const configToWrite: Config = {
      componentsDirectory: './src/components',
      nodeTypeName: 'Node',
      schema: relayConfig?.schema ?? 'ADD SCHEMA PATH HERE',
    };
    cli.action.start('Creating config.js');
    await fs.promises.writeFile(path.resolve(relayButlerDir, './config.js'), `module.exports = ${JSON.stringify(configToWrite, null, 2)}`);
    cli.action.stop(logSymbols.success);

    // create templateAPI.ts in .module-butler/
    cli.action.start('Creating templateAPI.ts');
    await fs.promises.writeFile(path.resolve(relayButlerDir, './templateAPI.ts'), templateAPITypes);
    cli.action.stop(logSymbols.success);

    // create index template file
    cli.action.start('Creating index component template file');
    await fs.promises.writeFile(path.resolve(relayButlerTemplatesDir, './index.tsx.hbs'), indexTemplate);
    cli.action.stop(logSymbols.success);

    // create UI template file
    cli.action.start('Creating UI component template file');
    await fs.promises.writeFile(path.resolve(relayButlerTemplatesDir, './{{componentName}}UI.tsx.hbs'), UITemplate);
    cli.action.stop(logSymbols.success);

    // create query template file
    cli.action.start('Creating query component template file');
    await fs.promises.writeFile(path.resolve(relayButlerTemplatesDir, './{{componentName}}Query.tsx.hbs'), queryTemplate);
    cli.action.stop(logSymbols.success);

    // create stories template file if project uses storybook
    let createStorybookTemplate = false;
    const rootDirectories = await fs.promises.readdir(root);
    if (rootDirectories.includes('.storybook')) {
      createStorybookTemplate = true;
      this.log('Detected Storybook! Will also create a .stories template.');
    }
    if (createStorybookTemplate || flags.all) {
      cli.action.start('Creating Storybook stories template file');
      await fs.promises.writeFile(path.resolve(relayButlerTemplatesDir, './{{componentName}}.stories.tsx.hbs'), storiesTemplate);
      cli.action.stop(logSymbols.success);
    }

    // .gitignore .module-butler/input.graphql
    cli.action.start('Adding input.graphql to .gitignore');
    await fs.promises.appendFile(path.resolve(root, './.gitignore'), '\n# module-butler\n.module-butler/input.graphql');
    cli.action.stop(logSymbols.success);

    // create .module-butler/input.graphql
    cli.action.start('Creating input.graphql file');
    await fs.promises.writeFile(path.resolve(relayButlerDir, './input.graphql'), '');
    cli.action.stop(logSymbols.success);

    this.log(`✨  Done

You can now check the .module-butler directory, and make any changes you want.

  For example, you may want to:
    - check that the schemaPath in config.js is correct.
    - change the path to your import statements in the templates, such as the path to your Relay artifacts (i.e. .../__generated__/...).
    - add/remove a template.
    - change the file extensions to ts, js, or jsx.
    - customize your templates any way you want. You can refer to templateAPI.ts to write your templates.

You can then input GraphQL fragments in .module-butler/input.graphql and run \`module-butler generate\` to generate your components.

${logSymbols.info} TIP: It is recommended to add a script in package.json, that runs \`module-butler generate\` then \`relay-compiler\` and any other script (e.g. prettier)
For example:
  "scripts": {
    ...
    "module-butler": "module-butler generate && relay-compiler && prettier --write src/components/"
  }
Then you can just run \`npm run module-butler\` or \`yarn module-butler\`.
`);
  }
}
