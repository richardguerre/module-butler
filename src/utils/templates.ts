export const indexTemplate = `import React, { Suspense } from 'react';
import { graphql, useFragment } from 'react-relay';
{{#each fragments}}
import { {{this.name}}$key } from '__generated__/{{this.name}}.graphql';
{{/each}}
import {{componentName}}UI, { {{componentName}}Props, {{componentName}}Loader } from './{{componentName}}UI';

type Props = {{componentName}}Props & {
  {{#each fragments}}
  {{this.propName}}: {{this.name}}$key;
  {{/each}}
};

const {{componentName}}Container = (props: Props) => {
  {{#each fragments}}
  const {{this.propName}} = useFragment(
    graphql\`
      {{{this.raw}}}
    \`,
    props.{{this.propName}}
  );
  {{/each}}

  return <{{componentName}}UI {...props} {{#each fragments}}{{this.propName}}={ {{this.propName}} }{{/each}} />;
};

const {{componentName}} = (props: Props) => (
  <Suspense fallback={<{{componentName}}Loader />}>
    <{{componentName}}Container {...props} />
  </Suspense>
)

export default {{componentName}};
export { {{componentName}}Container, {{componentName}}Loader };
export type { {{componentName}}Props };
`;

export const UITemplate = `import React from 'react';
{{#each fragments}}
import { {{this.name}} } from '__generated__/{{this.name}}.graphql';
{{/each}}

export type {{componentName}}Props = {
  /**
   * Add inter-component props here
   * (i.e. props given by the parent component of {{componentName}})
   */
}

type Props = {{componentName}}Props & {
  {{#each fragments}}
  {{this.propName}}: {{this.name}};
  {{/each}}
  /**
   * Add intra-component props here
   * (i.e. props given by {{componentName}}/index.tsx)
   */
};

const {{componentName}}UI = (props: Props) => {
  return (
    <div>
      <h1>{{componentName}}</h1>
      {{#each fragments}}
      <div>
        <h2>{{this.name}}</h2>
        {{#each fragment.selectionSet}}
        { props.{{../this.propName}}.{{this.value}} }
        {{/each}}
      </div>
      {{/each}}
    </div>
  );
};

export const {{componentName}}Loader = () => {
  return <>Loading {{componentName}}...</>;
}

export default {{componentName}}UI;
`;

export const queryTemplate = `import React, { Suspense, useEffect } from 'react';
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  useQueryLoader
} from 'react-relay';
import { {{componentName}}Query as {{componentName}}QueryType, {{componentName}}QueryVariables } from '__generated__/{{componentName}}Query.graphql';
import {{componentName}}, { {{componentName}}Props, {{componentName}}Loader } from '.';

const query = graphql\`
  {{{query.raw}}}
\`;

export type {{componentName}}QueryProps = {{componentName}}Props & {{componentName}}QueryVariables & {
  // add any other props the query component might need
};

type QueryProps = {{componentName}}QueryProps & {
  queryRef: PreloadedQuery<{{componentName}}QueryType>;
};

export const {{componentName}}Query = (props: QueryProps) => {
  const data = usePreloadedQuery(query, props.queryRef);

  if({{#each query.fragments}}!data.{{this.dataPath}} {{#unless @last}}||{{/unless}}{{/each}}) {
    return null;
  }

  return <{{componentName}} {{#each query.fragments}}{{this.propName}}={ data.{{this.dataPath}} }{{/each}} />;
};

const {{componentName}}QueryLoader = () => {
  const [
    queryRef,
    loadQuery,
    disposeQuery
  ] = useQueryLoader<{{componentName}}QueryType>(query);

  useEffect(() => {
    loadQuery({});

    return () => {
      disposeQuery();
    }
  }, []);

  return (
    <Suspense fallback={ <{{componentName}}Loader /> } >
      {queryRef ? (
        <{{componentName}}Query queryRef={queryRef} />
      ) : null}
    </Suspense>
  );
};

export default {{componentName}}QueryLoader;
`;

export const storiesTemplate = `import React from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { Meta } from '@storybook/react';
import { useRelayMockEnvironment } from 'path/to/useRelayMockEnvironment';
import { RelayMockData } from 'use-relay-mock-environment';
import {{componentName}} from './{{componentName}}Query';

export default {
  title: '{{componentName}}',
  component: {{componentName}},
  excludeStories: ['{{componentName}}MockDefaultOverrides'],
  parameters: {
    docs: {
      description: {
        component: 'This is a Relay component. To use it you will have to spread the fragment(s) {{#each fragments}}\`{{this.name}}\`{{#unless @last}},{{/unless}}{{/each}}.',
      },
    },
  },
} as Meta;

export const {{componentName}}Mock = {
  /**
   * Add any mock overrides here to be shared with stories of parent components.
   * For example, a ListItem component might share its mock defaults with the List component stories.
   */
} as RelayMockData;

export const Default = () => {
  const environment = useRelayMockEnvironment({
    data: {{componentName}}Mock,
  });

  return (
    <RelayEnvironmentProvider environment={environment}>
      <{{componentName}} />
    </RelayEnvironmentProvider>
  );
};

export const Loading = () => {
  const environment = useRelayMockEnvironment({
    forceLoading: true,
  });

  return (
    <RelayEnvironmentProvider environment={environment}>
      <{{componentName}} />
    </RelayEnvironmentProvider>
  );
};
Loading.parameters = {
  chromatic: { disableSnapshot: true },
};
`;

export const templateAPITypes = `/**
* This file shows all available Handlebar expressions in template files.
*/

/**
 * TemplateProps is the root API for all template files. For example, you can access \`componentName\` by inserting {{componentName}} in a template file.
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
`;
