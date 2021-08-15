import { Command, flags } from '@oclif/command';
import * as path from 'path';
import * as fs from 'fs';
import * as logSymbols from 'log-symbols';
import * as handlebars from 'handlebars';
import cli from 'cli-ux';
import { Config } from '../utils/types';

export default class Generate extends Command {
  static description =
    'generates modules using module names (comma and/or line separated) in .module-butler/input and template files in the templates directory.';

  static args = [
    {
      name: 'module1',
      description: 'Name of module',
      required: false,
    },
    {
      name: 'module2',
      description: 'Name of module',
      required: false,
    },
    {
      name: 'module3',
      description: 'Name of module',
      required: false,
    },
    {
      name: 'module4',
      description: 'Name of module',
      required: false,
    },
    {
      name: 'module5',
      description: 'Name of module',
      required: false,
    },
    {
      name: 'module6',
      description: 'Name of module',
      required: false,
    },
    {
      name: 'module7',
      description: 'Name of module',
      required: false,
    },
    {
      name: 'module8',
      description: 'Name of module',
      required: false,
    },
    {
      name: 'module9',
      description: 'Name of module',
      required: false,
    },
    {
      name: 'module10',
      description: 'Name of module',
      required: false,
    },
  ];

  static flags = {
    help: flags.help({ char: 'h', description: 'show help for generate command' }),
    force: flags.boolean({
      char: 'F',
      description: 'forcibly overwrite existing files',
    }),
  };

  async run() {
    const { flags, args } = this.parse(Generate);
    cli.action.start('Initializing generator');
    const root = process.cwd();
    const moduleButlerDir = path.resolve(root, './.module-butler');
    const configPath = path.resolve(moduleButlerDir, './config.js');
    const inputPath = path.resolve(moduleButlerDir, './input');

    // check that config.js exists and extract it into `config`
    let config: Config | null = null;
    try {
      config = require(configPath);
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        this.error('Could not find .module-butler/config.js. Run `module-butler init` to set up module-butler.', err);
        return;
      }
      this.error(err);
    }
    if (!config) {
      this.error('Error parsing config.js. Make sure its content is correct, and correctly exported.');
    }

    // get path of templatesDirectory from config, else use default
    const moduleButlerTemplatesDir = config.templateDirectory
      ? path.resolve(root, config.templateDirectory)
      : path.resolve(moduleButlerDir, './templates');

    const templatesInDir = await fs.promises.readdir(moduleButlerTemplatesDir);
    if (templatesInDir.length === 0) {
      this.error(
        'No templates found. Create a template in the .module-butler/templates/ directory and make sure the `templateDirectory` option in config.js is correct.'
      );
    }
    let templates = [];
    for (const templateFileName of templatesInDir) {
      const templateRaw = await fs.promises.readFile(path.resolve(moduleButlerTemplatesDir, `./${templateFileName}`), { encoding: 'utf8' });
      templates.push({
        templateFileName,
        fileNameCompiler: handlebars.compile(templateFileName.replace('.hbs', '')),
        fileContentCompiler: handlebars.compile(templateRaw),
      });
    }

    let modules: Array<string> = [];
    // if user provides module names through args use that instead of input file
    const argModules = Object.values(args).filter((s) => s);
    if (argModules.length > 0) {
      modules = argModules;
    } else {
      // read and parse input
      const inputRaw = await fs.promises.readFile(inputPath, { encoding: 'utf8' });
      modules = inputRaw.split(/,+|\s+/).filter((s) => s !== ''); // the filter removes any new line the user might have added between the module names
    }

    cli.action.stop(logSymbols.success);

    // traverse modules array and create each file using templates
    for (const moduleName of modules) {
      this.log(`${logSymbols.info} Creating ${moduleName}`);

      const modulePath = path.resolve(root, config.outputDirectory ?? './modules', `./${moduleName}`);

      await fs.promises.mkdir(modulePath, { recursive: true });

      for (const template of templates) {
        const fileName = template.fileNameCompiler({ name: moduleName });
        cli.action.start(`\tCreating ${fileName}`);
        const fileContent = template.fileContentCompiler({ name: moduleName });
        const filePath = path.resolve(modulePath, `./${fileName}`);
        if (flags.force && fs.existsSync(filePath)) {
          cli.action.stop(`skipped as it already exists.`);
          continue;
        }
        await fs.promises.writeFile(filePath, fileContent);
        cli.action.stop(logSymbols.success);
      }
    }
  }
}
