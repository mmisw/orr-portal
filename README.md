## A prototype for a new ORR Portal

This user interface is against the [orr-ont](https://github.com/mmisw/orr-ont) endpoint.

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

Install under the `orr-ont` service:

```shell
$ gulp install --base=/orr-ont/ --dest=/opt/tomcat/webapps/orr-ont/
```

### Test deployments

https://mmisw.org/experimental/orrportal/

https://mmisw.org/orr-ont/


### Status

pre-alpha
