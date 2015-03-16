## A prototype for a new ORR Portal

This user interface is against the [orr-ont](https://github.com/mmisw/orr-ont) endpoint.

### Development

```
$ npm install
$ bower install
$ gulp dev   # launches server and browser for local testing
$ gulp dist  # creates installable zip archive under dist/
```

### Test deployment

https://mmisw.org/experimental/orrportal/

**Status**: pre-alpha


## ChangeLog ##

* 2015-03-15: 0.0.4
    * 'gulp dev' to launch server and browser for local testing

* 2015-03-14: 0.0.3
    * enable ontologyTye and resourceType facets
    * all facet values set to lowercase for unification of mixed case in original values

* 2015-03-08: 0.0.2
    * initial authentication scheme

* 2015-02-27: 0.0.1
    * initial version

