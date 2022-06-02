> **Repository Reorganization in Progress**
>
> We are currently migrating some projects over to a mono repository. For existing PR's we will be providing documentation on how to move/migrate them. To minimize the overhead we are actively reviewing open PRs. If possible please ensure any pending comments are resolved as soon as possible.
>
> New pull requests created during this transition period may not get addressed —if needed, please create a new PR after the reorganization is complete.

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

- [Node.js](https://nodejs.org) v16.13.1 or greater
- NPM v8

### Run the app

For local development, run the app with:

```
npm install
npm run build:oss:watch
```

You can now access the web vault in your browser at `https://localhost:8080`.

If you want to point the development web vault to the production APIs, you can run using:

```
npm install
ENV=cloud npm run build:oss:watch
```

You can also manually adjusting your API endpoint settings by adding `config/local.json` overriding any of the following values:

```json
{
  "dev": {
    "proxyApi": "http://your-api-url",
    "proxyIdentity": "http://your-identity-url",
    "proxyEvents": "http://your-events-url",
    "proxyNotifications": "http://your-notifications-url",
    "allowedHosts": ["hostnames-to-allow-in-webpack"]
  },
  "urls": {}
}
```

Where the `urls` object is defined by the [Urls type in jslib](https://github.com/bitwarden/jslib/blob/master/common/src/abstractions/environment.service.ts).

## We're Hiring!

Interested in contributing in a big way? Consider joining our team! We're hiring for many positions. Please take a look at our [Careers page](https://bitwarden.com/careers/) to see what opportunities are currently open as well as what it's like to work at Bitwarden.

## Contribute

Code contributions are welcome! Please commit any pull requests against the `master` branch. Learn more about how to contribute by reading the [`CONTRIBUTING.md`](CONTRIBUTING.md) file.

Security audits and feedback are welcome. Please open an issue or email us privately if the report is sensitive in nature. You can read our security policy in the [`SECURITY.md`](SECURITY.md) file.

## Prettier

We recently migrated to using Prettier as code formatter. All previous branches will need to updated to avoid large merge conflicts using the following steps:

1. Check out your local Branch
2. Run `git merge 2b0a9d995e0147601ca8ae4778434a19354a60c2`
3. Resolve any merge conflicts, commit.
4. Run `npm run prettier`
5. Commit
6. Run `git merge -Xours 56477eb39cfd8a73c9920577d24d75fed36e2cf5`
7. Push

### Git blame

We also recommend that you configure git to ignore the prettier revision using:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```
