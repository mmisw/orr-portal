*2016-01-03*

html5Mode

When exercising dispatch from orr-ont and with $locationProvider.html5Mode(true), there was an error
in angular.js:11449 because of access to undefined url parameter.
I included condition:
```js
function trimEmptyHash(url) {
  return url ? url.replace(/(#.+)|#$/, '$1') : url;
}
```

Anyway, seems like $locationProvider.html5Mode(true) (or $locationProvider.html5Mode({ enabled: true, requireBase: false }))
makes the base href to get displayed, that is,
if initially:  http://localhost:8080/orr-ont/api/v0/ont?uri=http://mmisw.org/ont/ooi_epe/instruments
then replaced to: http://localhost:8080/orrportal/

but what I need is to continue showing the {orr-}ont-based URL

So, seems like html5Mode cannot be used in conjunction here.
