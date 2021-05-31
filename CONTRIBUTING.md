# Contributing

**The issue tracker is only for issue reporting or proposals/suggestions. If you have a question, you can find us in our [Discord Server]**.

To contribute to this repository, feel free to create a new fork of the repository and
submit a pull request. We highly suggest [ESLint] to be installed, and if using VSCode, the [ESLint Extension].
in your text editor or IDE of your choice to ensure builds from GitHub Actions do not fail.

1. Fork, clone, and select the **master** branch.
2. Create a new branch in your fork.
3. Make your changes.
4. Ensure your linting passes and unit-tests work by running `yarn lint`, `yarn format`, and `yarn test` (Tests failing may not be your fault, if they do fail, try running them without your changes and if it still fails, just ignore it).
5. Commit your changes, and push them.
6. Submit a Pull Request [here]!

## Running Godfather locally

To run Godfather locally, a few steps must be taken:

1. Install [Node.JS] and [Yarn].
2. Optionally, setup a PostgreSQL server on your machine.
3. In the Discord Developer portal go to your application and then to the "Bot" menu.
4. At "Privileged Gateway Intents" enable "SERVER MEMBERS INTENT".
5. Copy and paste the [`config.example.ts`] file in the `src` directory and rename it to `config.ts`.
6. Enter your own bot token in the appropriate export.
7. Fill in any other config variables you want to (you only need a token for the bare minimum)
8. Install all project dependencies using `yarn install`
9. Run Godfather using `yarn dev`

-   For setting up TypeORM with PostgreSQL, refer to the end of this file.

## Godfather Concept Guidelines

There are a number of guidelines considered when reviewing Pull Requests to be merged. _This is by no means an exhaustive list, but here are some things to consider before/while submitting your ideas._

-   Godfather should never change sapphire's or discordjs's default behavior. Godfather should only add to Sapphire and discord.js, and be as consistent as possible with them.
-   Everything in Godfather should be generally useful for the majority of users. Don't let that stop you if you've got a good concept though, as your idea still might be a great addition.
-   Everything should follow [OOP paradigms] and generally rely on behaviour over state where possible. This generally helps methods be predictable, keeps the codebase simple and understandable, reduces code duplication through abstraction, and leads to efficiency and therefore scalability.
-   Everything should follow our ESLint rules as closely as possible, and should pass lint tests even if you must disable a rule for a single line.
-   Everything should follow [Discord Bot Best Practices]

## Setting up a database

Godfather uses PostgreSQL to store data such as server-settings, game results and player records. To start using PostgreSQL with your local version of Godfather:

1. Install [PostgreSQL]
2. Create a database, and add details to `config.ts`. Make sure `PGSQL_ENABLED` is set to true.
3. Build Godfather using `yarn build`.
4. Run all TypeORM migrations using `yarn typeorm migration:run`.
5. Start the bot, with complete database support!

## Running Godfather on Docker (recommended)

1. Install [Docker].
2. Make a `.env` file referencing `.env.example`.

-   If you're running Godfather on Docker for the first time, or have new TypeORM migrations, start the database individually with `docker-compose up -d postgres` and `yarn dev:typeorm migration:run`.

3. Run `docker-compose up` to start the bot in development mode.
4. The bot runs in watch-mode, and will compile and reboot on every TS file change.

## Credits

This guide is heavily based on the [Skyra Contributor Guide](https://github.com/skyra-project/skyra/blob/main/.github/CONTRIBUTING.md)

<!-- Link Dump -->

[discord server]: https://discord.gg/gFhvChy
[here]: https://github.com/Soumil07/godfather/pulls
[eslint]: https://eslint.org/
[eslint extension]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[node.js]: https://nodejs.org/en/download/
[yarn]: https://classic.yarnpkg.com/en/docs/install
[docker]: https://www.docker.com
[installation instructions for node-canvas]: https://github.com/Automattic/node-canvas/blob/main/Readme.md#installation
[oop paradigms]: https://en.wikipedia.org/wiki/Object-oriented_programming
[discord bot best practices]: https://github.com/meew0/discord-bot-best-practices
[`config.example.ts`]: /src/config.example.ts
[postgresql]: https://www.postgresql.org/docs/9.3/tutorial-install.html
