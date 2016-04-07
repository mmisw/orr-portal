## A prototype for a new ORR Portal

This user interface is against a
[orr-ont](https://github.com/mmisw/orr-ont)-based endpoint.

### development

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

### test deployments

https://mmisw.org/experimental/orrportal/

https://mmisw.org/orr-ont/


### status

alpha
