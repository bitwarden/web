[![appveyor build](https://ci.appveyor.com/api/projects/status/github/bitwarden/web?branch=master&svg=true)](https://ci.appveyor.com/project/bitwarden/web) [![DockerHub](https://img.shields.io/docker/pulls/bitwarden/web.svg)](https://hub.docker.com/u/bitwarden/) [![Join the chat at https://gitter.im/bitwarden/Lobby](https://badges.gitter.im/bitwarden/Lobby.svg)](https://gitter.im/bitwarden/Lobby)

# Bitwarden Web Vault

The Bitwarden web project is an Angular application that powers the web vault (https://vault.bitwarden.com/).

<img src="https://i.imgur.com/WB8J2bt.png" alt="" />

# Build/Run

**Requirements**

- [Node.js](https://nodejs.org) v8.11 or greater

**Run the app**

```
npm install
npm run build:watch
```

You can now access the web vault in your browser at `https://localhost:8080`. You can adjust your API endpoint settings in `src/app/services/services.module.ts` by altering the `apiService.setUrls` call. For example:

```
await apiService.setUrls({
    base: isDev ? null : window.location.origin,
    api: isDev ? 'http://mylocalapi' : null,
    identity: isDev ? 'http://mylocalidentity' : null,
});
```

If you want to run a production build of the web vault (pointed to the production API), run:

```
npm run build:prod:watch
```

# Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`](SECURITY.md) file.
