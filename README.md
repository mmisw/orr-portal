[![Build Status](https://travis-ci.org/mmisw/orr-portal.svg)](https://travis-ci.org/mmisw/orr-portal)
[![Stories in Ready](https://badge.waffle.io/mmisw/orr-portal.svg?label=ready&title=Ready)](http://waffle.io/mmisw/orr-portal)

## The new ORR front-end

This user interface is against a
[orr-ont](https://github.com/mmisw/orr-ont)-based endpoint.

### Status

alpha


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


- Install under a running `orr-ont` service:

    ```shell
    $ gulp install --base=/orr-ont/ --dest=/opt/tomcat/webapps/orr-ont/
    ```

    Adjust the `--base` parameter value above depending on the actual
    deployed application context of the `orr-ont` service.


- Install under the `orr-ont` codebase for subsequent packaging:

    As needed, adjust contents of `src/app/js/local.config.js`
    and the `--base` parameter value below, and then:

    ```shell
    $ gulp install --localConfig --base=/orr-ont/ --dest=/path/to/orr-ont/src/main/webapp/
    ```

### Test deployment

https://mmisw.org/orr-ont/
