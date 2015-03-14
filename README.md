## A prototype for a new ORR Portal

This user interface is against the [orr-ont](https://github.com/mmisw/orr-ont) endpoint.

### Development

```
$ npm install
$ bower install
$ http-server
$ open http://localhost:8080/src/app/indexdev.html
```

A installable zip archive is created under `dist/` by running `gulp`.

### Test installation

https://mmisw.org/experimental/orrportal/indexdev.html

**Status**: very preliminary


## ChangeLog ##

* 2015-03-08: 0.0.3
    * enable ontologyTye and resourceType facets
    * all facet values set to lowercase for unification of mixed case in original values

* 2015-03-08: 0.0.2
    * initial authentication scheme

* 2015-02-27: 0.0.1
    * initial version

