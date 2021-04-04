# Teams Tab Test Fixture

Simulated Teams desktop and mobile environment for testing embedded experiences.

There are two ways to use this library:

## Serve Locally

This library can be installed and run from npm.

```
npm install teams-tab-test-fixture
```

In your project, import and run the test fixture server.

```
const { startServer, stopServer } = require('teams-tab-test-fixture');

startServer({
  appContext: {
    urlTemplate: 'https://localhost:8080?tenantId={tid}&groupId={groupId}'
  },
});

```

https://localhost:8080?tenantId={tid}&groupId={groupId}

## Build and Deploy

ToDo: expand on instructions

## Authentication

This library expects you to bring your own authentication. (Mostly easier than it sounds, more details to be added later)
