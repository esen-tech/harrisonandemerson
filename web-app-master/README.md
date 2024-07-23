# Web App

## Create New App

```
npx create-next-app packages/my-awesome-app
```

## Development

Launch apps

```
yarn workspace internal-portal dev
yarn workspace customer-portal dev
```

Install dependencies

```
yarn workspace internal-portal add <package-name>
yarn workspace customer-portal add <package-name>
yarn workspace @esen/utils add <package-name>
yarn workspace @esen/components add <package-name>
yarn workspace @esen/essence add <package-name>
```

## Storybook

![Storybook](https://cdn.jsdelivr.net/gh/storybookjs/brand@main/badge/badge-storybook.svg)

To run your Storybook, type:

```
yarn workspace @esen/components storybook
yarn workspace @esen/essence storybook
```

> For more information visit: https://storybook.js.org

## Release and Deployment

```
git tag emerson-v0.1.0
git tag harrison-v0.1.0
git tag webflow-hack-v0.1.0
git push --tag
```

Undo:

```
git tag -d emerson-v0.1.0
git tag -d harrison-v0.1.0
git tag -d webflow-hack-v0.1.0
git push origin :emerson-v0.1.0 :harrison-v0.1.0 :webflow-hack-v0.1.0
```
