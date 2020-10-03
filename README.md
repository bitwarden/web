<p align="center">
    <img src="https://raw.githubusercontent.com/bitwarden/brand/master/screenshots/web-vault-macbook.png" alt="" width="600" height="358" />
</p>
<p align="center">
    The Bitwarden web project is an Angular application that powers the web vault (https://vault.bitwarden.com/).
</p>
<p align="center">
  <a href="https://ci.appveyor.com/project/bitwarden/web/branch/master" target="_blank">
    <img src="https://ci.appveyor.com/api/projects/status/github/bitwarden/web?branch=master&svg=true" alt="appveyor build" />
  </a>
  <a href="https://crowdin.com/project/bitwarden-web" target="_blank">
    <img src="https://d322cqt584bo4o.cloudfront.net/bitwarden-web/localized.svg" alt="Crowdin" />
  </a>
  <a href="https://hub.docker.com/u/bitwarden/" target="_blank">
    <img src="https://img.shields.io/docker/pulls/bitwarden/web.svg" alt="DockerHub" />
  </a>
  <a href="https://gitter.im/bitwarden/Lobby" target="_blank">
    <img src="https://badges.gitter.im/bitwarden/Lobby.svg" alt="gitter chat" />
  </a>
</p>

## Build/Run

### Requirements

- [Node.js](https://nodejs.org) v8.11 or greater

-New version [Node.js] (https://nodejs.org) 11.10.0. / v8.10


### Run the app

```
npm install
npm run build:watch
```

You can now access the web vault in your browser at `https://localhost:8080`. You can adjust your API endpoint settings in `src/app/services/services.module.ts` by altering the `apiService.setUrls` call. For example:

```typescript
await apiService.setUrls({
    base: isDev ? null : window.location.origin,
    api: isDev ? 'http://mylocalapi' : null,
    identity: isDev ? 'http://mylocalidentity' : null,
});
```

If you want to point the development web vault to the production APIs, you can set:

```typescript
await apiService.setUrls({
    base: null,
    api: 'https://api.bitwarden.com',
    identity: 'https://identity.bitwarden.com',
});
```


## Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`](SECURITY.md) file.
