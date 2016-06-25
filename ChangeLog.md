## change log ##

* 2016-06-25: 3.0.2-alpha:
  - implement #32 "resource type selection in ontology metadata".
     Implemented in a generic way so other properties can also be dispatched by just indicating them
     in the configuration:
    - appConfig: new valueSelections entry to indicate properties and corresponding class for
      selection of terms. If a metadata property URI is found in appConfig.valueSelections, then
      a button with selection of corresponding terms (instances) is included.
    - <orp-multivalue-edit> now with new prop-uri attribute for generic class instance selection
    - new queryUtil service for general handling of SPARQL queries
    - new utl.selectFromList for more general dispatch of selection
    - utl.select renamed to utl.selectButton

* 2016-06-24: 3.0.2-alpha:
  - resolve #12 "capture visibility attribute for ontologies"
    Only "owner" and "public" now handled.
  - fix #33 "Avoid invalid characters in given local name"
    TODO in general, character in URIs needs systematic revision/handling. For now we restrict some
    characters that are in general considered [unsafe](http://www.ietf.org/rfc/rfc1738.txt) or
    simply not yet properly handled by the tool
    (for example, parens should be OK but are avoided at the moment)

  - implement #25 "admin interface to edit organization"

* 2016-06-22: 3.0.1-alpha:
  - gulpfile: sparql/index.html now gets branding logo and main page link from appConfig

  - v2r property column header: show label in header; show "prefixed" notation in tooltip
  - ont: confirm leaving page when in editing mode
  - v2r: substitute "term set" for "vocabulary" when referring to a particular collection of terms within the vocabulary.
    This is to avoid confusion by overloading the "vocabulary" concept to refer to a whole ontology, but also (particularly
    in the context of the vocabulary tool) to a particular collection of terms within the ontology.
    So a "vocabulary" is comprised of one or more "term sets", with a "term set" referring to
    a particular class, list of properties, and the terms themselves (instances of that class).
  - v2r: improve vocabulary drop-down menu
  - implement #31 "CSV import for vocabulary table".
    For parsing the given CSV contents, using [knrz/CSV.js](https://github.com/knrz/CSV.js/) which seems
    good enough at least initially.
    ([SheetJS/js-xlsx](https://github.com/SheetJS/js-xlsx) can be considered for a future more sophisticated version.)

      The following cases are considered for creation of the properties according to each header string:
       - if the string is a prefixed notation for one of the "standard" properties (eg, "skos:definition"),
       then the corresponding URI is associated to the property;
       - otherwise, if the string contains a colon (:), then it's assumed to be a full URI;
       - else, the string is taken as a "local" name for the property.

       TODO This logic can be made more robust later on.


* 2016-06-21: 3.0.0-alpha:
  - some code clean-up and new evtAuthenticateStateChanged:
    - orr-org and orr-org-create directives
    - admin-users directive
    - admin-orgs directive
    - orr-main directive
    - orr-user directive
  - uiRoutes is only used for main page and associated actions (no need for rUri parameter)

* 2016-06-20: 3.0.alpha:
  - implement #21 "v2r: for column property definition allow selection from standard vocabularies"
    A selected property is displayed with associated typical prefix, eg., skos:definition (#19).
    The list is for now hard-coded. TODO capture list in a registered (internal) ontology.
  - implement #15 "branding"

* 2016-06-18: 0.3.2:
  - implement #26 "option to unregister ontology"
    - Menu with option to unregister current displayed version, and whole ontology entry (all versions)
    - only available to admin

  - resolve #30 "dispatch term request"
    - extract view-as-options utility into a directive, and also use it in term.html
    - extract clipboard-copy utility into a directive
    - initial preparations to dispatch given URI (rUri) so it uses the existing 'ont' display,
      a new 'term' display, or a "Not found" message

* 2016-06-14: 0.3.2:
  - \#12: add dropdown in main ontology page to directly change visibility (in non-edit mode).
    This is available for logged-in user that is authorized to change the ontology.
    NOTE: For v2r/m2r, not yet capturing visibility at time of registration, so the ontology gets the
    default 'owner' visibility. But the user can then go to the ontology page and use the new option as needed.

    TODO: some code clean-up as there's some replication in upload.js and ont.js

* 2016-06-13: 0.3.2:
  - upload: fix proper '~' prefix handling of username as owner in fully-hosted registration
  - \#12 capture visibility attribute for ontologies.
    Initialize it with previous value (if any) in checkNewUriIsAvailable
  - fix #17 ontology name becomes hidden in re-hosted upload sequence
  - resolve #18 v2r: select corresp tab when creating a new vocab

* 2016-06-05: 0.3.2:
  - get rid of bower;
  - some adjustments arising from differences in angular-ui-bootstrap: uib-tab-heading stopped
    working nicely in ont-meta.html, so was replaced with direct heading attribute.
    (uib-tab-heading continues to work fine in v2r).
  - some clean-up in gulpfile

* 2016-06-04: 0.3.1:
  - test/travis preparations; put some basic utilities in bUtil

* 2016-06-02: 0.3.1:
  - v2r general edit improvements:
    - make cell focusable to facilitate navigation with keyboard; in the case of term name, the field is
      automatically entered in edit mode; for property values, press Enter to start editing.
    - process some key strokes in property value cell:
      - Ctrl-Shift-Enter to apply changes
      - Esc to cancel changes
      - Ctrl-Shit-+ to add a value
    - auto focus new term field when the +Term button is clicked
    - navigation with arrow keys

  - header: proper link to main page depending on whether dispatching main app (with routing) or particular ontology

* 2016-06-01: 0.3.1:
  - pass version parameter in service.getOntologyFormat so correct requested version is
    actually retrieved and displayed
  - in linkForVersion, include version parameter only if it's not the latest
  - hide "Edit new version" button if currently viewing explicitly requested version
  - if given, use requestedVersion in service.refreshOntology
    TODO also pass version parameter in other operations like service.getOntologySubjects
  - rename appUtil.uri to appUtil.requestedUri; introduce appUtil.requestedVersion
  - introduce portal.mainPage configuration property:
    - use it for term-search (#st) keyword-search (#kw) and link to main page in main header
    - adjustments to determine requested 'uri' and 'version' (if any) from the window
      location's search and/or href.

  - clean-up:
    - remove old voc module
    - move pieces from old 'uri' module to 'ont'

* 2016-05-31: 0.3.1:
  - utl.openRegistrationProgressModal: to show some progress feedback while registering

  - mainly to facilitate local development, use variations of window.location.href
    for purposes of self-hosted dispatch and registration of fully-hosted ontology:
    - getHref4uriWithSelfHostPrefix: use windowHref, not cfg.orront.rest,
      so the dispatch is always with href hosting the UI. This is particular
      facilitates local development.
    - With a new getBareWindowHref utility (which completely excludes any search
      part--as opposed to getWindowHref, which keeps it), similar strategy for
      registration of "fully-hosted" ontology via upload or v2r/m2r.

  - add app/sparql/index.html and include it as part of 'install';
    also add link to it from term-search and keyword-search

  - m2r: show localName instead of symbol for the relation predicates
    (the symbols shown in the past have been rather ad hoc)

  - Do not use routing mechanism when dispatching a given URI.
    Key goal here is to keep the URI in the browser URL field "clean", that is,
    without the trailing `#/` automatically added by the routing library.

* 2016-05-21: 0.3.1:
  - add admin dropdown with "new org" and also "organizations" and "users"
  - keyword-terms: style adjs and use of <items-viewer>
  - search-terms: style adjs and use of <items-viewer>
  - extract generic triples viewer from rj-viewer into a reusable directive

* 2016-05-20: 0.3.1:
  - show dct.contributor, if defined, in general metadata section
  - add Create Mapping button

* 2016-05-19: 0.3.1:
  - m2r editing: first version with saving of new mappings
    - TODO remove redundant triples in general
    - TODO clear selection upon addition of mappings
  - m2r editing: allow to select from registered ontologies and
    from external ontology URI (URL)

* 2016-05-17: 0.3.1:
  - m2r: some refact preparing for editing dispatch
  - m2r: show associated name for mapped ontologies
    TODO: capture version (if available) of mapped ontology at time of m2r creation

* 2016-05-18: 0.3.1:
  - m2r: incorporate getOntologySubjects to allow selection for mapping

* 2016-05-16: 0.3.1:
  - automatic conversion from "vine" to "m2r" to use new m2r dispatch
  - initial m2r mapping format handling

* 2016-05-13: 0.3.1:
  - ontologies now with ownerName attribute (either an orgName or a ~userName)

* 2016-05-12: 0.3.1:
  - v2r: improve editing layout, specially for brand new table
  - metadata: add some properties; associate and show prefix
  - metadata: hide some "standard" properties to avoid duplicates in
    entries that the old system added as copies of omv/omvmmi property values)

* 2016-05-10: 0.3.1:
  - rj-viewer: enable filtering and optional grouping
  - meta handling: introduce hideIfUndefined attribute to be used in view mode.
    TODO: the proper selection of what meta properties to expose in general
  - openLink workaround only needed in template under <uib-tab>
  - voc2rdf->v2r: missing values were not properly handled

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

