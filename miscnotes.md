*2019-08-06*

After a long while, I just tried running `gulp dev` as usual but got unexpected error
`primordials is not defined in node`.
Fortunately, was able to quickly "fix" this by following https://stackoverflow.com/a/56328843/830737,
basically:

```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

$ export NVM_DIR="$HOME/.nvm"
$ [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
$ [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

$ nvm install lts/dubnium
$ nvm use lts/dubnium

$ npm install

$ gulp dev
[15:06:50] Building version 3.8.4
[15:06:50] Using gulpfile ~/github/mmisw/orr-portal/gulpfile.js
[15:06:50] Starting 'webserver'...
[15:06:50] Webserver started at http://localhost:9001
[15:06:50] Finished 'webserver' after 13 ms
[15:06:50] Starting 'dev'...
[15:06:50] Finished 'dev' after 6.3 ms
```



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
