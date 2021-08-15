export type Config = {
  // module-butler specific
  componentsDirectory: string;
  nodeTypeName?: string;

  // relay.config.js specific
  schema: string;
  artifactDirectory?: string;
};

export type RelayConfig = {
  schema?: string;
};

export type ChildToParentTypeMapU = {
  typeName: string;
  path: string;
};

export type FragmentQuery = {
  path: string;
  partialQuery: string;
} | null;

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
