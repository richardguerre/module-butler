import { Command, flags } from '@oclif/command';
import * as path from 'path';
import * as fs from 'fs';
import * as graphql from 'graphql';
import * as logSymbols from 'log-symbols';
import * as handlebars from 'handlebars';
import cli from 'cli-ux';
import { Config, TemplateFragment, TemplateProps } from '../utils/types';
import { isRunningInRoot } from '../utils';

export default class Generate extends Command {
  static description = 'generates component using GraphQL operations in input.graphql and template files in the templates directory.';

  static flags = {
    help: flags.help({ char: 'h', description: 'show help for generate command' }),
    // TODO: add force/overwrite flag that will overwrite any files with the same file name.
    force: flags.boolean({
      char: 'F',
      description: 'forcily overwrite existing files',
    }),
  };

  async run() {
    const { flags } = this.parse(Generate);
    cli.action.start('Initializing generator');
    if (!isRunningInRoot()) {
      this.error('Cannot run module-butler outside of project root (i.e. directory where package.json is located)');
    }
    const root = process.cwd();
    const relayButlerDir = path.resolve(root, './.module-butler');
    const relayButlerTemplatesDir = path.resolve(relayButlerDir, './templates');
    const configPath = path.resolve(relayButlerDir, './config.js');
    const inputPath = path.resolve(relayButlerDir, './input.graphql');

    // check that config.js exists and extract it into config
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

    const templatesInDir = await fs.promises.readdir(relayButlerTemplatesDir);
    if (templatesInDir.length === 0) {
      this.error('No templates found. Create a handlebars template in the .module-butler/templates/ directory.');
    }
    let templates = [];
    for (const template of templatesInDir) {
      const templateRaw = await fs.promises.readFile(path.resolve(relayButlerTemplatesDir, `./${template}`), { encoding: 'utf8' });
      templates.push({
        templateName: template,
        fileNameCompiler: handlebars.compile(template.replace('.hbs', '')),
        fileContentCompiler: handlebars.compile(templateRaw),
      });
    }

    // read and parse input
    const inputRaw = await fs.promises.readFile(inputPath, { encoding: 'utf8' });
    const input = graphql.parse(inputRaw);
    if (!input.loc) {
      this.error(`Error in input.graphql. loc is ${input.loc}. It should be an object containing \`source\` property.`);
    }

    // TODO: convert input into components map
    const componentsMap = new Map<
      string,
      {
        componentName: string;
        fragments: (TemplateFragment & {
          typeCondition: string;
        })[];
      }
    >();
    for (const def of input.definitions) {
      if (def.kind !== 'FragmentDefinition') {
        this.error(`module-butler currently only supports fragments as inputs.

NOTE: If you have a template for query components and it uses query.raw, then it will automatically be generated for you.
`);
      }

      const fragmentName = def.name.value;
      const componentName = fragmentName.match(/.+?(?=_)/g)?.[0];
      if (!componentName) {
        this.error(`Fragment ${fragmentName} incorrectly named.
Naming convention to follow: {{ComponentName}}_{{propName}}
`);
      }
      const propName = fragmentName.match(/(?<=_).*$/g)?.[0];
      if (!propName) {
        this.error(`Fragment ${fragmentName} incorrectly defined.
Naming convention to follow <ComponentName>_<propName>.
`);
      }
      if (!def.loc) {
        this.error(
          `Error parsing fragment ${fragmentName}. fragment definition loc is ${def.loc}. It should be an object containing a \`start\` and \`end\` property.`
        );
      }

      const fragment: TemplateFragment & {
        typeCondition: string;
      } = {
        name: fragmentName,
        propName,
        raw: input.loc.source.body.substring(def.loc.start, def.loc.end),
        // @ts-ignore
        selectionSet: def.selectionSet.selections.map((sel) => sel.name.value),
        typeCondition: def.typeCondition.name.value,
      };

      const compInMap = componentsMap.get(componentName);
      if (compInMap) {
        componentsMap.set(componentName, {
          componentName,
          fragments: [...compInMap.fragments, fragment],
        });
      } else {
        componentsMap.set(componentName, {
          componentName,
          fragments: [fragment],
        });
      }
    }

    // convert components map into an array as to use async await
    const components = Array.from(componentsMap.values());

    cli.action.stop(logSymbols.success);

    // traverse components array and create each file using templates
    for (const component of components) {
      this.log(`${logSymbols.info} Creating ${component.componentName}`);

      const componentPath = path.resolve(root, config.outputDirectory ?? './src/components', `./${component.componentName}`);
      let queryRaw = '';
      const queryFragments: {
        propName: string;
        dataPath: string;
      }[] = [];
      queryRaw = `query ${component.componentName}Query {${queryRaw}\n}`;

      const templateProps: TemplateProps = {
        componentName: component.componentName,
        fragments: component.fragments,
        query: {
          raw: queryRaw,
          fragments: queryFragments,
        },
      };

      await fs.promises.mkdir(componentPath, { recursive: true });
      for (const template of templates) {
        const fileName = template.fileNameCompiler(templateProps);
        cli.action.start(`\tCreating ${fileName}`);
        const fileContent = template.fileContentCompiler(templateProps);
        const filePath = path.resolve(componentPath, `./${fileName}`);
        if (!flags.force && fs.existsSync(filePath)) {
          cli.action.stop(`skipped as it already exists.`);
          continue;
        }
        await fs.promises.writeFile(filePath, fileContent);
        cli.action.stop(logSymbols.success);
      }
    }
  }
}
