## Docker

The app can be run in a docker container.

- [Build a local image](build-a-local-image)
- [Running-a-local-image](running-a-local-image)
- [Build time configuration](build-time-configuration)
- [Runtime configuration](runtime-configuration)

### Build a local image

The image can be easily built with `docker build` as follows:

```bash
docker build -t reporting-hub-bop-settlements-ui:local .
```

### Running a local image

You can run the app container as follows:

```bash
docker run -p 8081:8081 reporting-hub-bop-settlements-ui:local
```

### Build time configuration

You can pass the environment variable `REACT_APP_API_BASE_URL` if you want to use a static api base url in your application.

The frontend production build can include the version and commit hash the build uses.
The env variables responsible to add these values to the bundle are:

- `REACT_APP_VERSION` the package.json version
- `REACT_APP_COMMIT` the current commit hash

```bash
docker build \
  --build-arg REACT_APP_NAME=`npm run name --silent` \
  --build-arg REACT_APP_VERSION=`npm run version --silent` \
  --build-arg REACT_APP_COMMIT=`git rev-parse HEAD`\
  -t reporting-hub-bop-settlements-ui \
  .
```

### Runtime configuration

The application loads the runtime configuration from `public/runtime-env.js` as
a script in the html to determine where API's are located

`public/runtime-env.js` is populated at runtime, it uses environment variables passed to docker.

```bash
docker run --rm \
  -p 8083:8083 \
  -e CENTRAL_LEDGER_ENDPOINT="https://your-api-base-url" \
  -e CENTRAL_SETTLEMENTS_ENDPOINT="https://your-api-base-url" \
  -e REPORTING_TEMPLATE_API_ENDPOINT="https://your-api-base-url" \
   reporting-hub-bop-settlements-ui
```
