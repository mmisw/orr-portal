## change log ##

* 2016-05-09: 0.3.1:
  - adjust "POST/PUT /ont" requests to pass parameters in the body.
  - automatic conversion from "voc2rdf" to "v2r" to use new v2r
    interface including the editing for a new version.

  - preliminary generic viz of non-v2r ontologies based on ui-grid
    with triples extracted from the 'rj' format
  - various adjustments and clean-up

* 2016-05-08: 0.3.1:
  - some metadata initialization for brand new

* 2016-05-06: 0.3.1:
  - introduce metaUtil (for sections handling); expand standard vocabularies
  - brand-new v2r creation...
  - switch to ui-router

* 2016-05-05: 0.3.1:
  - v2r: add property column drop-down menus
  - ont/v2r: at contents submission, omit keys starting with '_',
    which are used only for UI purposes

* 2016-05-04: 0.3.1:
  - both only metadata (non-v2r cases), and v2r case -ie., complete
    contents (metadata + data)-- are now handled for registration of new version.
  - overall review and improvements for ont dispatch, including much better coordination with v2r
  - new orrportal.ont module toward reorganizing Ont dispatch.

* 2016-05-03: 0.3.1:
  - add editInProgress scope parameter in orrportalV2rEdit directive to notify
    UriController when there's a change in cell editing status
  - initial working version with registering new version with metadata edits
    (NOTE: this only for non v2r/m2r ontologies)

  - do not show data section if editing ontology that is not v2r or m2r
  - startEditMode: full edit for v2r (and m2r, later on); and either metadata
    of file upload for anything else
  - add rules for canEditNewVersion.  Basically, besides an admin, the
    logged in user can edit if member of the ontology's organization

* 2016-05-02: 0.3.1:
  - basis for a `<orp-multivalue-edit>` directive
  - reorganizing for general ontology page dispatch
  - use new metadata reported from backend as part of "!md" response
    (sparql-based mechanism not used anymore)

* 2016-04-30: 0.3.1:
  - note: v2r term ID editing only handles local name for now
  - preliminaries of v2r editing using x-editable

  - new mklink4uriAlwaysUriParameter filter to always just make a link with
    `?uri=<the-uri>` -- helps with development specially when running the
    UI against orr-ont elsewhere, and not focusing on self-resolution.
    Used in voc.tpl.html, which is just in very preliminary stages.

* 2016-04-25: 0.3.1:
  - shown message dialog upon successful registration with link to
    the submitted ontology, and going to that link if user closes the dialog
  - add util/util.js module
  - validations via immediate filtering in the associated fields:
    - create organization and user: orgName and username only composed of
      `[a-z0-1_\.-]` and not starting with `[_\.-]`
    - some filtering for fields: originalUri, name, short-name

* 2016-04-24: 0.3.1:
  - verify user can submit new version according to URI owner
  - new org option available only for user with admin role
  - verify user with backend upon firebase login
    For now, only capturing role snd organizations from backend
    TODO get general user info from backend (only use fb for auth per se)

  - pass `originalUri` in fully-hosted registration request, which is
    now used by orr-ont to perform the associated "namespace transfer"

* 2016-04-20: 0.3.1:
  - adjust and document base config.js
    (start using /ont as the default path to the orr-ont endpoint)

* 2016-04-19: 0.3.1:
  - prefix `appConfig.orront.rest` with window.location's protocol and
    host when it starts with "/".
    This in particular to properly create new URI in fully-hosted submission.
  - upload: display all ontology metadata for confirmed URI

* 2016-04-18: 0.3.1:
  - adjustments related with possible ontology URIs and associated names
    upon file upload
  - re-hosted registration: if URI already exists, then the known
    owner is used and, as in the fully-hosted case below, a new version
    of the existing ontology is registered; otherwise, a brand new entry.

* 2016-04-16: 0.3.1:
  - fully-hosted registration: if URI already exists, then a new version of
    the existing ontology is registered; otherwise, a brand new entry.

* 2016-04-14/15: 0.3.1:
  - directives to modularize upload sequence
  - start using ui-select

* 2016-04-12: 0.3.1:
  - complete basic sequence to register new ontology in re-hosted mode,
    starting with initial upload of the file then continuing with some
    fields and the with actual registration
  - /user/username: show organizations
  - include user's organizations is selection for "owner" in ontology registration.
    TODO: username itself is also included but not yet handled as owner (orr-ont)

* 2016-04-11: 0.3.1:
  - some upload ontology styling

* 2016-04-10: 0.3.1:
  - use orr-portal's own "href" to determine the url for an ontology link,
    in particular, for self-resolvable ontology URLs (later one for terms too)
  - remove orront.selfHostPrefix config property; orront.rest serves the purpose as well

  - initial org creation

* 2016-04-08: 0.3.1:
  - initial basis for ontology upload operation

* 2016-04-07: 0.3.1:
  - adjustment and documentation of the configuration (config.js)

* 2016-01-18: 0.3.0:
  - add option to request email with username reminder
  - add options to view/update general user account info, and change password
  - add option to create user account
  - add option to request password reset

* 2016-01-13: 0.2.0:
    * user authentication now based on Firebase and JWT tokens, along with corresponding support from orr-ont.
    * general clean-up per the simplification provided by the Firebase mechanism
        * js/app.js: remove reference to 'orrportal.login' module and associated stuff, including
          the httpInterceptor.  (js/auth/** files still there but to be removed eventually)
        * no need for angular-base64 dependency (previously required by js/auth/*.js)
        * (also, no need for jsSHA dependency (used in a previous scheme for Secure Hash operations)


* 2016-01-03: 0.1.0: preliminaries to dispatch this orr-portal UI with an orr-ont-based URL
    * ontgrid: use new mklink4uriWithSelfHostPrefix filter to use appConfig.orront.selfHostPrefix
      with "?uri" parameter for the link (this still exploratory)

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

