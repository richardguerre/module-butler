import { Command, flags } from '@oclif/command';
import * as path from 'path';
import * as fs from 'fs';
import * as logSymbols from 'log-symbols';
import cli from 'cli-ux';
import { indexTemplate } from '../utils/templates';
import { Config } from '../utils/types';

export default class Init extends Command {
  static description = 'sets up module-butler by creating config.js, templates/*.hbs files, input in .module-butler/ directory.';

  static flags = {
    help: flags.help({ char: 'h', description: 'show help for init command' }),
  };

  async run() {
    const root = process.cwd();
    const moduleButlerDir = path.resolve(root, './.module-butler');
    const moduleButlerTemplatesDir = path.resolve(moduleButlerDir, './templates');

    // recursively create .module-butler/templates directory in project root
    cli.action.start('Creating .module-butler directory');
    await fs.promises.mkdir(moduleButlerTemplatesDir, {
      recursive: true,
    });
    cli.action.stop(logSymbols.success);

    // write .module-butler/config.js
    const configToWrite: Config = {
      outputDirectory: './modules',
      templateDirectory: './.module-butler/templates',
    };
    cli.action.start('Creating config.js');
    await fs.promises.writeFile(path.resolve(moduleButlerDir, './config.js'), `module.exports = ${JSON.stringify(configToWrite, null, 2)}`);
    cli.action.stop(logSymbols.success);

    // create index template file
    cli.action.start('Creating index template file');
    await fs.promises.writeFile(path.resolve(moduleButlerTemplatesDir, './index.js.hbs'), indexTemplate);
    cli.action.stop(logSymbols.success);

    // create .module-butler/input
    cli.action.start('Creating input file');
    await fs.promises.writeFile(path.resolve(moduleButlerDir, './input'), 'Hello\nWorld');
    cli.action.stop(logSymbols.success);

    this.log(`✨  Done

You can now add your module names (comma and/or line separated) in .module-butler/input and run \`module-butler generate\` to generate your modules.

You can also check the .module-butler directory, and make any changes you want.

  For example, you may want to:
    - add/remove a template
    - change the file extension of index.js to ts or any other extension you want.
    - customize your templates any way you want.

${logSymbols.info} TIP: It is recommended to add a script in package.json, that runs \`module-butler generate\` then any other script, like prettier.
For example:
  "scripts": {
    ...
    "module-butler": "module-butler generate && relay-compiler && prettier --write modules/"
  }
Then you can just run \`npm run module-butler\` or \`yarn module-butler\`.
`);
  }
}
