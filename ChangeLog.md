## change log ##

* 2016-01-03: 0.1.0: preliminaries to dispatch this orr-portal UI with an orr-ont-based URL
    * when there's no explicit uri query parameter, use window.location.href and
      appConfig.orront.selfHostPrefix to determine whether the application URL corresponds
      to a URI request or a request to the main ontology list.
    * gulpfile:
        * accept --localConfig to include local.config.js in dist and install tasks
        * insert `<base href="path">` in .html if `--base=path` is passed.
        * add `install` target, which works along with required `--dest=dir`, eg:
          ```gulp install --base=/orr-ont/ --dest=/opt/tomcat/webapps/orr-ont/```
          this "installs" the UI application under the orr-ont service.
    * add orrmain and orruri directives in case of direct dispatch of main and URI pages
    * set "/" route depending on whether there's a URI to dispatch (for now only from windowLocationSearch.uri)
    * add appUtil.windowLocationSearch with object capturing the parsing of window.location.search.
      In particular, this will allow to dispatch ../orr-ont?uri=xxx with the specific URI


* 2015-12-28: 0.0.9
    * add button to copy ontology URI to clipboard (note: safari not supported)

* 2015-12-27: 0.0.9
    * \#2: new voc module and directive with preliminaries for displaying ontologies marked "vocabulary"
      Note: initially using ui-grid, but now a simple table to display all contents. Possibly to use tr-ng-grid
      for view-only, and ui-grid for editing.

* 2015-12-21: 0.0.9
    * update some vendor libraries
    * show performed query in a popover for st and kw

* 2015-12-20: 0.0.8
    * include section with "other" metadata properties, ie. those not classified/aggregated in other sections.

* 2015-12-18: 0.0.8
    * initial version of keyword search, which works on the metadata property for keywords.
      At this point basically copied from "search terms" but with different query.
      Todo: perhaps unify this new search at some point.
      Note also that 'keyword' could be one other filter facet in the main page.
    * style adjustments in display of ontology page
    * adjustments in container for the ui-grid (main ontology grid) so it re-sizes in a much better
      way upon changes in browser window size or changes in browser zoom.
      The width of this grid, however, is not 100% (which would be ideal) but 90% so the grid remains
      within the visible area for a couple levels of zooming in with the browser.
    * style adjustments including use of google fonts Merriweather for text, Inconsolata for links

* 2015-12-16: 0.0.8
    * initial version of "search terms"

* 2015-12-15: 0.0.8
    * include viewAs options in ontology display
    * show only external link for ontology metadata property values
    * ontology style adjustments and display simplification

* 2015-11-05: 0.0.7
    * check res.error in endpoint responses to properly notify error like not found ontology/user/org

* 2015-10-02: 0.0.6
    * fix #1 "re-validate credentials": intercept 401 to do a signOut

* 2015-05-26: 0.0.5
    * fix logo img url

* 2015-03-18: 0.0.5
    * sign in/out and other various style adjustments
    * do immediate redirect if already signed in
    * code reorganization closer to by-module

* 2015-03-15: 0.0.4
    * 'gulp dev' to launch server and browser for local testing

* 2015-03-14: 0.0.3
    * enable ontologyTye and resourceType facets
    * all facet values set to lowercase for unification of mixed case in original values

* 2015-03-08: 0.0.2
    * initial authentication scheme

* 2015-02-27: 0.0.1
    * initial version

