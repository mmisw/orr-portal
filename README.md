## A prototype for a new ORR Portal

This user interface is against a
[orr-ont](https://github.com/mmisw/orr-ont)-based endpoint.

### Development

```shell
$ npm install
$ bower install
```

Launch server and browser for local testing:

```shell
$ gulp dev
```

Create installable zip archive under `dist/`:

```shell
$ gulp dist
```

Install under a running `orr-ont` service:

```shell
$ gulp install --base=/orr-ont/ --dest=/opt/tomcat/webapps/orr-ont/
```

Install under the `orr-ont` codebase for subsequent packaging:

Adjust `src/app/js/local.config.js` as needed and then:

```shell
$ gulp install --localConfig --base=/orr-ont/ --dest=/path/to/orr-ont/src/main/webapp/
```

### Test deployments

Most testing is local so the following deployments are only
occasionally updated at this point.

https://mmisw.org/experimental/orrportal/

https://mmisw.org/orr-ont/


### Status

alpha
