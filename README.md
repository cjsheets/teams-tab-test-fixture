# Teams Tab Test Fixture

Simulated Teams desktop and mobile platforms for testing tab apps. Useful for CI testing scenarios.

## Authentication

This library expects you to bring your own authentication. This is done by providing an object or class with the following methods:

* `getAccessToken`
* `getUser`

A sample that uses [teams-authenticator](https://github.com/cjsheets/teams-authenticator) (MSAL helper library) is included: `/src/authentication.example.ts`.

This auth class is provided to Teams Tab Test Fixture one of three ways:
* [Recommended] Add a global property "`window.AuthenticationProvider`" to the page running the test fixture.
* If you're building this repository locally, you can add a module `authentication.js` to the root and it will be loaded
* Host the `authentication.js` file on a server and load it by passing "authScriptUrl" to `startServer`

## Quick Start

Install the package from npm.

```
npm install teams-tab-test-fixture
```

In your project, require and run the test fixture server.

```
const { startServer, stopServer } = require('teams-tab-test-fixture');

startServer({
  appContext: {
    urlTemplate: 'https://localhost:8181?tenantId={tid}&groupId={groupId}'
  },
});

```

With the server running, you can access Teams Tab Test Fixture on https://localhost:8080


### appContext.urlTemplate

`urlTemplate` is a string that uses the same variable replacement signature as teams tab apps. It's the url that the nested iframe will be set to.

