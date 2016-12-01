[![appveyor build](https://ci.appveyor.com/api/projects/status/github/bitwarden/web?branch=master&svg=true)] (https://ci.appveyor.com/project/bitwarden/web) [![Join the chat at https://gitter.im/bitwarden/Lobby](https://badges.gitter.im/bitwarden/Lobby.svg)](https://gitter.im/bitwarden/Lobby)

# bitwarden Web

The bitwarden Web project is an AngularJS application that powers the web vault (https://vault.bitwarden.com/).

# Build/Run

**Requirements**

- Node.js
- Gulp

Unless you are running the [Core](https://github.com/bitwarden/core) API locally, you'll probably need to switch the 
application to target the production API. Open `package.json` and set `production` to `true`.

Then run the following commands:

- `gulp build`
- `gulp serve`

You can now access the web vault at `http://localhost:4001`.

# Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature.
