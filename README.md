## module-butler

A React Relay CLI that takes in GraphQL fragments and outputs React components.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/module-butler.svg)](https://npmjs.org/package/module-butler)
[![Downloads/week](https://img.shields.io/npm/dw/module-butler.svg)](https://npmjs.org/package/module-butler)
[![License](https://img.shields.io/npm/l/module-butler.svg)](https://github.com/richardguerre/module-butler/blob/master/package.json)

## Table of Contents

<!-- toc -->

- [Geting started](#geting-started)
- [Example](#example)
- [Tips](#tips)
- [Templates](#templates)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Geting started

1. Install module-butler within your project

```
yarn add -D module-butler
```

or

```
npm install -D module-butler
```

2. Set up module-butler by running:

```
module-butler init
```

3. Makes changes in `.module-butler/config.js`
4. Make changes to any template in `.module-butler/templates/`.
5. Add your GraphQL fragments in `.module-butler/inpug.graphql`. (See [example](#example))
6. Generate your components by running:

```
module-butler generate
```

# Example

The following example used the templates that come out-of-the-box when running `module-butler init`.

## Input

```graphql
// .module-butler/input.graphql
fragment Avatar_user on users {
  firstName
  lastName
  avatarUrl
}

// Tip: add all your fragments to generate all components at the same time.
```

## Outputs

```tsx
// components/Avatar/index.tsx
import React, { Suspense } from 'react';
import { graphql, useFragment } from 'react-relay';
import { Avatar_user$key } from 'lib/graphql/relay/__generated__/Avatar_user.graphql';
import AvatarUI, { AvatarProps, AvatarLoader } from './AvatarUI';

type Props = AvatarProps & {
  user: Avatar_user$key;
};

const AvatarContainer = (props: Props) => {
  const user = useFragment(
    graphql`
      fragment Avatar_user on users {
        firstName
        lastName
        avatarUrl
      }
    `,
    props.user
  );

  return <AvatarUI {...props} user={user} />;
};

const Avatar = (props: Props) => (
  <Suspense fallback={<AvatarLoader />}>
    <AvatarContainer {...props} />
  </Suspense>
);

export default Avatar;
export { AvatarContainer, AvatarLoader };
export type { AvatarProps };
```

```tsx
// components/Avatar/AvatarUI.tsx
import React from 'react';
import { Avatar_user } from 'lib/graphql/relay/__generated__/Avatar_user.graphql';

export type AvatarProps = {
  /**
   * Add inter-component props here
   * (i.e. props given by the parent component of Avatar)
   */
};

type Props = AvatarProps & {
  user: Avatar_user;
  /**
   * Add intra-component props here
   * (i.e. props given by Avatar/index.tsx)
   */
};

const AvatarUI = (props: Props) => {
  return (
    <div>
      <h1>Avatar</h1>
      <div>
        <h2>Avatar_user</h2>
      </div>
    </div>
  );
};

export const AvatarLoader = () => {
  return <>Loading Avatar...</>;
};

export default AvatarUI;
```

```tsx
// components/Avatar/AvatarQuery.tsx
import React, { Suspense, useEffect } from 'react';
import { graphql, PreloadedQuery, usePreloadedQuery, useQueryLoader } from 'react-relay';
import { AvatarQuery as AvatarQueryType } from 'lib/graphql/relay/__generated__/AvatarQuery.graphql';
import Avatar, { AvatarProps, AvatarLoader } from '.';

const query = graphql`
  query AvatarQuery {
    user: node(id: "mockId") {
      ... on users {
        ...Avatar_user
      }
    }
  }
`;

export type AvatarQueryProps = AvatarProps & {};

type QueryProps = AvatarQueryProps & {
  queryRef: PreloadedQuery<AvatarQueryType>;
};

export const AvatarQuery = (props: QueryProps) => {
  const data = usePreloadedQuery(query, props.queryRef);

  if (!data.user) {
    return null;
  }

  return <Avatar {...props} user={data.user} />;
};

const AvatarQueryLoader = (props: AvatarQueryProps) => {
  const [queryRef, loadQuery, disposeQuery] = useQueryLoader<AvatarQueryType>(query);

  useEffect(() => {
    loadQuery({});

    return () => {
      disposeQuery();
    };
  }, []);

  return <Suspense fallback={<AvatarLoader />}>{queryRef ? <AvatarQuery {...props} queryRef={queryRef} /> : null}</Suspense>;
};

export default AvatarQueryLoader;
```

```tsx
// components/Avatar/Avatar.stories.tsx
import React from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { Meta } from '@storybook/react';
import { RelayMockData, useRelayMockEnvironment } from 'lib/hooks/relay';
import Avatar from './AvatarQuery';

export default {
  title: 'Avatar',
  component: Avatar,
  excludeStories: ['AvatarMockDefaultOverrides'],
} as Meta;

export const AvatarMockDefaultOverrides = {
  /**
   * Add any mock default overrides here to be shared with stories of parent components.
   * For example, a ListItem component might share its mock defaults with the List component stories.
   */
} as RelayMockData;

export const Default = () => {
  const environment = useRelayMockEnvironment({
    data: AvatarMockDefaultOverrides,
  });

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Avatar />
    </RelayEnvironmentProvider>
  );
};

export const Loading = () => {
  const environment = useRelayMockEnvironment({
    forceLoading: true,
  });

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Avatar />
    </RelayEnvironmentProvider>
  );
};
```

# Tips

## Add a script in package.json

It is recommended to add a script in package.json, that runs `module-butler generate` then `relay-compiler` and any other script (e.g. prettier)
For example:

```json
{
  "scripts": {
    "module-butler": "module-butler generate && relay-compiler && prettier --write src/components/"
  }
}
```

Then you can just run `npm run module-butler` or `yarn module-butler`.

## Use Storybook with [`use-relay-mock-environment`](https://www.npmjs.com/package/use-relay-mock-environment)

If you want to create Storybook stories out of your Relay components, we recommend using [`use-relay-mock-environment`](https://www.npmjs.com/package/use-relay-mock-environment), and adding it directly within your storybook template.

If you have set up Storybook before setting up module-butler, `module-butler init` will detect Storybook and will automatically create a `{{componentName}}.stories.tsx.hbs` template with Storybook stories and `use-relay-mock-environment`. After which, all you need to do is install `use-relay-mock-environment` and change the path to your `useRelayMockEnvironment` hook in the template.

Alternatively, you can manually create the `{{componentName}}.stories.tsx.hbs` template by running:

```
module-butler init --storybook
```

## Adding/removing/customizing templates

By default, running `module-butler init`, provides you with at least 3 templates, but you are free to add/remove templates and change their content. You can, for example, create a template for your CSS styles. You can even change the file name of the template, like changing the file extension to `.ts` instead of `.tsx`.

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
module-butler/1.1.3 darwin-x64 node-v12.22.0
$ module-butler --help [COMMAND]
USAGE
  $ module-butler COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`module-butler generate`](#module-butler-generate)
- [`module-butler help [COMMAND]`](#module-butler-help-command)
- [`module-butler init`](#module-butler-init)

## `module-butler generate`

generates component using GraphQL operations in input.graphql and template files in the templates directory.

```
USAGE
  $ module-butler generate

OPTIONS
  -F, --force  forcily overwrite existing files
  -h, --help   show help for generate command
```

_See code: [src/commands/generate.ts](https://github.com/richardguerre/module-butler/blob/v1.1.3/src/commands/generate.ts)_

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

sets up module-butler by creating config.js, templates/\*.hbs files, input.graphql in .module-butler/ directory.

```
USAGE
  $ module-butler init

OPTIONS
  -a, --all    generate all template files
  -h, --help   show help for init command
  --storybook  generate storybook template
```

_See code: [src/commands/init.ts](https://github.com/richardguerre/module-butler/blob/v1.1.3/src/commands/init.ts)_

<!-- commandsstop -->
