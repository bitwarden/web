[![appveyor build](https://ci.appveyor.com/api/projects/status/github/bitwarden/web?branch=master&svg=true)](https://ci.appveyor.com/project/bitwarden/web) [![DockerHub](https://img.shields.io/docker/pulls/bitwarden/web.svg)](https://hub.docker.com/u/bitwarden/) [![Join the chat at https://gitter.im/bitwarden/Lobby](https://badges.gitter.im/bitwarden/Lobby.svg)](https://gitter.im/bitwarden/Lobby)

# bitwarden Web

The bitwarden Web project is an AngularJS application that powers the web vault (https://vault.bitwarden.com/).

<img src="https://i.imgur.com/rxrykeX.png" alt="" width="791" height="739" />

# Build/Run

**Requirements**

- Node.js
- Gulp

By default the application points to the production API. If you want to change that to point to a local instance of
the [Core](https://github.com/bitwarden/core) API, you can modify the `package.json` `env` property to `Development`
and then set your local endpoints in `settings.json`.

Then run the following commands:

- `npm install`
- `gulp build`
- `gulp serve`

You can now access the web vault at `http://localhost:4001`.

# Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`](SECURITY.md) file.
