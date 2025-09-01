# whatsapp.hyperjump.tech

This project is a whatsapp integration for [Monika](https://monika.hyperjump.tech). It allows you to send recovery and incident notifications to your whatsapp number.

## Overview

This is a monorepo project using [Turborepo](https://turbo.build/repo/docs) and [pnpm](https://pnpm.io). It contains the apps (in `apps` directory) and packages (in `packages` directory).

### Apps

- `web`: The [Next.js](https://nextjs.org) web app that allows user to register their whatsapp number and to get the unique URL to use in their Monika configuration. They can also get the instructions to use Monika with WhatsApp. This app also allows user to delete the webhook from our database.
- `facebook-webhooks`: The [Hono](https://hono.dev) server that handles the webhooks from Facebook.
- `notify-api`: The [Hono](https://hono.dev) server that handles the notifications from Monika. The URL of this server is used in the Monika configuration.
- `whatsapp-mock-server`: The mock server that simulates the WhatsApp API for development purposes.
- `docs`: This documentation app which is using [Fumadocs](https://fumadocs.vercel.app) to generate the documentation.

### Packages

- `env`: The package that contains the environment variables for the project. Use this package to read environment variables in the apps and packages.
- `whatsapp`: The package that contains the WhatsApp API client and other helpers to send messages via WhatsApp.
- `database`: The package that contains the [prisma](https://www.prisma.io) client, schema, and other helpers to interact with the database.
- `ui`: The package that contains the [shadcn](https://ui.shadcn.com) components and other UI components which can be used in the apps like `web`.
- `eslint-config`: The package that contains the [eslint](https://eslint.org) config which can be used in other apps and packages.
- `eslint-config-custom`: The package that contains the custom eslint config which can be used in other apps and packages.
- `typescript-config`: The package that contains the typescript config which can be used in other apps and packages.
- `utils`: The package that contains the utility functions which can be used in other apps and packages.

## Getting Started

1. Run `pnpm install` to install the dependencies.
2. `cp env.example .env` from the `packages/env` directory.
3. Edit the environment variable values as needed.
4. Run `./dev-bootstrap.sh` to bootstrap the development environment. The script basically creates symlinks to the `packages/env/.env` file to `.env.local` in all apps and packages.

## Usage

### Developing `web` app

1. Run `docker-compose up` to start the database.
2. Run `pnpm run build` to build the apps and packages. We need to build the packages first because the apps depend on the packages.
3. Run `pnpm run dev --filter whatsapp-mock-server` to start the WhatsApp mock server.
4. Set `WHATSAPP_API_BASE_URL` to `http://localhost:5001` in the `packages/env/.env` file. The `5001` port is the port of the WhatsApp mock server you run in the step 3. If you change the port, you need to update this value.
5. Run `pnpm run dev --filter web` to start the development server.

### Developing `notify-api` app

1. Run `pnpm run build` to run the apps and packages.
2. Run `pnpm run dev --filter notify-api` to start the development server.

### Adding shadcn component to a next.js app

```
pnpm dlx shadcn@latest add button -c apps/web
```

### Adding new package

You can either create a new package manually by creating a new directory in the `packages` directory and adding a `package.json` file to it or by copying an existing package and modifying it. To duplicate an existing package, you can run the following command from the root of the project:

```
pnpm dlx turbo gen workspace --copy
```

After adding a new package, you need to:

1. run `pnpm install` from the root of the project to install the dependencies.
2. run `./dev-bootstrap.sh` to bootstrap the development environment.
3. If you want to use the package in the apps or other packages, you need to run `pnpm install` from the root of the project again after adding the package to `package.json` file.

### Environment variables

This project uses [env-to-t3](https://github.com/nicnocquee/env-to-t3) to generate strongly typed code to read environment variables. Follow these guides to use it in your app or package:

1. In your app or package, don't read environment variables using `process.env` directly. Instead, use the `env` package.
2. Every time you make changes (change the name, add new variables, delete variables) to the `.env` file in the `packages/env` package, you need to run `pnpm run build` from the `packages/env` package.
3. If you make changes to the `.env` file in the `packages/env` package, make sure to update the `env.example` file in the same package.

### Running tests

#### About

- The tests are written using [vitest](https://vitest.dev).
- To test React components, we use [testing-library](https://testing-library.com/docs/react-testing-library/intro).
- Contrary to common practice, the prisma client is not mocked in most of the tests. Instead, we use a test database. Each test will create a new schema in the test database. Then the function that is being tested will use the test database through the dependency injection mechanism. In this project, we use [async local storage](https://nico.fyi/blog/async-local-storage-to-prevent-props-drilling) to provide the database context. See the tests for more information.

#### How to

1. Before running tests, you need to run `docker-compose up` from the root of the project to start the database.
2. Run `pnpm run test` to run the tests.
3. Run `pnpm run coverage` to run the tests with coverage.
4. The coverage report will be generated in the `coverage` directories of each package.
5. To open the coverage reports in the browser, run `./open-coverages.sh`.

### Cleaning up

You can clean up node_modules, coverage, dist, build, .turbo, .cache, generated, and .next directories by running `./clean.sh`.

## Troubleshooting

- If you got typescript errors like cannot find module of the other package, try run `pnpm install` from the root of the project to install the dependencies, then `pnpm run build`.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
