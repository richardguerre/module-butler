export type Config = {
  // module-butler specific
  outputDirectory: string;
  templateDirectory?: string;
};

/**
 * If any changes are made to the following types, please replace the contents of templateAPI in templates.ts
 */

export type TemplateProps = {
  componentName: string;
  fragments: TemplateFragment[];
  query: TemplateQuery;
};

export type TemplateFragment = {
  name: string;
  propName: string;
  raw: string;
  selectionSet: string[];
};

export type TemplateQuery = {
  raw: string;
  fragments: {
    propName: string;
    dataPath: string;
  }[];
};
