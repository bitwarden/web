<p align="center">
    <img src="https://raw.githubusercontent.com/bitwarden/brand/master/screenshots/web-vault-macbook.png" alt="" width="600" height="358" />
</p>
<p align="center">
    The Bitwarden web project is an Angular application that powers the web vault (https://vault.bitwarden.com/).
</p>
<p align="center">
  <a href="https://github.com/bitwarden/web/actions?query=branch:master" target="_blank">
    <img src="https://github.com/bitwarden/web/actions/workflows/build.yml/badge.svg?branch=master" alt="Github Workflow build on master" />
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

### Run the app

For local development, run the app with:

```
npm install
npm run build:watch
```

You can now access the web vault in your browser at `https://localhost:8080`.

If you want to point the development web vault to the production APIs, you can run using:

```
npm install
npm run build:prod:watch
```

You can also manually adjusting your API endpoint settings in `webpack.config.js` by altering the `targets` within `proxy`. For example:

```typescript
proxy: {
  '/api': {
      target: 'http://localhost:4000',
      pathRewrite: {'^/api' : ''}
  },
  '/identity': {
      target: 'http://localhost:33656',
      pathRewrite: {'^/identity' : ''}
  },
  '/events': {
      target: 'http://localhost:46273',
      pathRewrite: {'^/events' : ''}
  }
},
```

## Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch. Learn more about how to contribute by reading the [`CONTRIBUTING.md`](CONTRIBUTING.md) file.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`](SECURITY.md) file.
