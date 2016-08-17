[![Build Status](https://travis-ci.org/mmisw/orr-portal.svg)](https://travis-ci.org/mmisw/orr-portal)
[![Stories in Ready](https://badge.waffle.io/mmisw/orr-portal.svg?label=ready&title=Ready)](http://waffle.io/mmisw/orr-portal)

## The new ORR front-end

This the user interface counterpart of [orr-ont](https://github.com/mmisw/orr-ont).


### Development

To set everything up:

```shell
$ npm install
```

In all of the following, adjust `src/app/js/local.config.js` as appropriate.

Launch server and browser for local development:

```shell
$ gulp dev
```

### Installing

- Create installable directory and zip archive under `dist/`,
  adjust `src/app/js/local.config.js` and then:

    ```shell
    $ gulp dist --localConfig
    ```

    To locally verify the "local" installation involved in the above,
    open [http://localhost:9001/dist/orrportal/](http://localhost:9001/dist/orrportal/)


- Install under a running `ont` service:

    ```shell
    $ gulp install --base=/ont/ --dest=/opt/tomcat/webapps/ont/
    ```

    Adjust the `--base` parameter value above depending on the actual
    deployed application context of the `ont` service.


- Install under the `orr-ont` codebase for subsequent packaging/dockerization:

    ```shell
    $ gulp install --base=/ont/ --dest=/path/to/orr-ont/src/main/webapp/
    ```

    Adjust `--base` and `--dest` parameters as appropriate:

### Test deployments

See [wiki/ORR-deployments](https://github.com/mmisw/orr-portal/wiki/ORR-deployments).
