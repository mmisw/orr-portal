# Development

Based on [NodeJs](https://nodejs.org/),
[Gulp](http://gulpjs.com/),
[AngularJs](https://angularjs.org/),
and several other open-source libraries.

## Local development and testing

To set everything up:

    $ npm install

In all of the following, adjust `src/app/js/local.config.js` as appropriate.

Launch server and browser for local development:

    $ gulp dev


## Installing

- Create installable directory and compressed archive under `dist/`,
  adjust `src/app/js/local.config.js` and then:

        $ gulp dist --localConfig

    To locally verify the "local" installation involved in the above,
    open [http://localhost:9001/dist/orrportal/](http://localhost:9001/dist/orrportal/)


- Install under a running `ont` service:

        $ gulp install --base=/ont/ --dest=/opt/tomcat/webapps/ont/

    Adjust the `--base` parameter value above depending on the actual
    deployed application context of the `ont` service.


- Install under the `orr-ont` codebase for subsequent packaging/dockerization:

        $ gulp install --base=/ont/ --dest=/path/to/orr-ont/src/main/webapp/

    Adjust `--base` and `--dest` parameters as appropriate:
