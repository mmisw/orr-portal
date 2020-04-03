## change log ##

**2020-04: 3.9.1**

- update [development.md](development.md) notes

- fix #155 "Hash character not encoded for proper link in main list"
  Use `decodeURIComponent` to get the `requestedUri` from `windowBareHref`

- internal: some lib upgrades triggered by a reported vulnerability related with
  the indirect "kind-of" dependency.
  
    Again, my `gulp dev` command failed as indicated in  miscnotes, which I fixed in a similar way:
  
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
        
        nvm use lts/dubnium
        
        gulp dev   # now OK

* 2019-10-03: 3.8.9

- fix #128 "Update YASGUI" https://github.com/mmisw/orr-portal/issues/128#issuecomment-538172422

- resolve #149 "more permissive unregister access"

- resolve #150 "Add ability to update email of user's account"

* 2019-09-04: 3.8.7

- fix #147 "'Upload ontology' broken":
  explicit pass paramter in `ui-sref="rx({ uriNewVersion: null })`

- upgrade select2

* 2019-08-30: 3.8.7

- upgrade select2

* 2019-08-28: 3.8.6

- PR #139: reverting to angular 1.4.7 seems to make things work better,
  but this will need some good testing
 
* 2019-08-18: 3.8.6

- PR #139 plus upgrade of angular-ui-router to 1.0.22, which seems to fix
  the "trasition superseded" errors noted while testing the original PR

* 2019-08-08: 3.8.5

- adjust $http method calls to use ECMAScript 5 as uglify-js only supports this dialect.
  Issue noted while tryong to run `gulp install`.
  (`gulp dev` was fine because no uglification is performed).

- bump Angular from 1.4.7 to 1.6.0 and consequently replace
  several deprecated $http methods that were removed.

* 2019-02-07: 3.8.4

- internal: lib upgrade to address potential vulnerability

* 2019-01-25: 3.8.3

- resolve #127 "Update lodash and jquery dependncies"
  - jquery removed altogether by just upgrading angular-xeditable
  - lodash upgraded

* 2019-01-19: 3.8.2 - align with backend version

* 2019-01-15: 3.8.1

- resolve #126 "Increase size of upload data > 10MB"
  ah! the upload file size limit is hard-coded in upload.js
  Just set it there to '150MB' but the TODO has long been
  to retrieve this limit from the backend.

- update some dependencies and check in package-lock.json
  TODO: Not surprisingly, there are now several packages that should be upgraded.
  This will require some significant effort.
- 3.8.1 also toward aligning with next version of backend (orr-ont)

* 2018-03-05: 3.7.3

- per github notification about potential security vulnerability, upgrade moment (to 2.21.0 from 2.19.2)


* 2018-02-28: 3.7.2

- fix #121 "Update jQuery to 3.0.0".
  Actually, I just removed jQuery as a dependecy as after some careful inspection
  it doesn't seem to be used at all. I don't recall why I added it as a dependency
  but likely it was because of some interim testing not supported
  by [Angular's jqLite](https://docs.angularjs.org/api/ng/function/angular.element).

* 2018-01-16: 3.7.1

- \#117: link to https://mmisw.org/orrdoc/query/#some-sparql-examples in the sparql yasgui page
- show triple store size when zero

* 2017-11-22: 3.7.0

- remove `template.local.config.js` (unneeded)
- only include `local.config.js` in `gulp dist` if `--localConfig` is given
  (this got broken somehow).
  This noted while doing adjustments to the backend, which will take care of
  automatically generating `local.config.js` based on the ORR master configuration.

* 2017-11-17: 3.7.0

- upgrade moment to 2.19.2
- align version with backend (orr-ont)

* 2017-10-11: 3.6.8

- align version with backend (orr-ont)

* 2017-10-11: 3.6.7

- align version with backend (orr-ont)

* 2017-10-04: 3.6.6

- align version with backend (orr-ont)

* 2017-09-20: 3.6.5

- enable "N-Quads" and "TriG" in view-as-options,
  which are now properly handle by Jena in the backend

* 2017-07-21: 3.6.4

- align version with backend (orr-ont)

* 2017-06-10: 3.6.3

- align version with backend (orr-ont)

* 2017-06-06: 3.6.2

- fix: use cfg.portal.mainPage, not appUtil.windowBareHref, in link to start
  file upload for new version of (non-ORR) ontology
- getHref4uriWithSelfHostPrefix: when self-resolvable IRI, make sure the same
  http/https scheme as the mainPage is used.

- resolve #111 "minify resources"
  - `gulp dist` creates minified version
  - `gulp dev` opens http://localhost:9001/src/app/indexdev.html
  - some details:
    - use gulp-uglify for js, gulp-csso for css
    - rename index.html to indexdev.html
    - new index.html for the minified version
    - Dev mode: mainPage set to undefined in local.config.js so it gets window.location in
      appUtil.expandPortalMainPageUrl

- re #107 "PWA - Progressive Web App"
  - add rel="noopener" to all _blank refs
  - add viewport and noscript in index files

* 2017-05-31: 3.6.0

- resolve #48 "URIs should be IRIs"  (backend orr-ont#32)
    - use "IRI"/"iri" instead of "URI"/"iri" in all user-visible widgets/messages
    - use iri/oiri/tiri parameters in all relevant requests to the backend
    - consider windowLocationSearch.iri in appUtil.setRequestedUriAndVersionIfAny
    - NOTE: underlying variable/function names continue to use 'uri'.

* 2017-05-29: 3.5.1

- fix #109 "fully-hosted filter should consider https and http"
  bUtil.uriEqualOrHasPrefixWithSlash now also considers https-http scheme change

- (internal) remove gulp-load-plugins (unneeded)

* 2017-05-29: 3.5.0

- set version 3.5.0 (aligning with orr-ont)

- create user account:
  - first check for username
  - reset vm.recaptchaResponse upon error

* 2017-05-22:

- simple orr client demo page now with xdomes.org/sparql as (default) SPARQL endpoint.
  (CORS just enabled there -- BTW, I also enabled this for COR.)

* 2017-05-09:

- a simple orr client demo page

* 2017-04-12:  3.4.3
  - resolve #101: "CSV import: option to indicate that all columns are properties (and values)"

* 2017-03-08:  3.4.2
  - remove WebVOWL (until we have time to have a loca deployment)

* 2017-03-07:  3.4.1
  - LOD adjustments/fixes (related: #88, #92):
    - use mklink4uriWithSelfHostPrefix and mkLinks filters in grids for:
       - term page
       - keyword-search, term-search, and generic ontology data viewer (rj-viewer)
    - use cfg.portal.mainPage instead of windowHref in some filters dealing with creating uri links
    - mkLinks filter: use getHref4uriWithSelfHostPrefix (instead of older mechanism `/#uri/...`)
  - fix #97 "create vocab/mapping dialog stays open when user navigates back in browser".
    Simply cancelUriEdit() upon $stateChangeStart
  - in create vocab/mapping, use new option in rest call to check for ontology existence
  - include list of ontologies in user page (those owned by ~username -- not as submitter)

* 2017-03-03:  3.4.0
  - in create vocab/mapping dialog:
    - visibility/status were not required; fixed
    - show cfg.branding.title to refer to the particular ORR instance
    - some style adjustments

* 2017-03-02:  3.3.1
  - fix #85 "user page is wrong"

* 2017-02-28:  3.3.0
  - resolve #84 "capture log message for ontology version registration".
    Upon clicking "Register" now a dialog appears for user to enter the log message.
    This is only in the case of a new version. The log message is optional.

* 2017-02-28:  3.2.5
  - when no ontology/term found by given URI, make it clickable if it's not a self-hosted one

* 2017-02-26:  3.2.5
  - improve search options
    - show SPARQL query for term-search and keyword-search including clipboard-copy
    - term-search now also applied on the simple name of the subjects
      (also, preliminaries to allow user indicate where to search: subject, predicate, and or object)

* 2017-02-26:  3.2.4
  - introduce appUtil.getOntUrlForExternalTool to get the URL to resolve an ontology
    for purposes of dispatch of external visualization tool.
    This utility is directly based on cfg.orront.rest.
  - include external viewers as additional options in view/download dropdown menu
  - resolve #83 "include LODE in list of external ontology viewers"
  - resolve #82 "include list of ontologies in organization page"
  - organization's name was not editable; fixed.
  - resolve #80 "too much unused real estate".
    use `height: calc(98vh - 110px)` for the ui-grid: 110 is just an estimate of the
    height of the header section. This was only done for the main page (class ontListGrid).
    There are other uses of ui-grid than can be addressed similarly (bot not now).
    (Also, note that issues with dynamic adjustment of ui-grid's width is still to be addressed.)

* 2017-02-22:  3.2.3
  - as part of the preparations to migrate the MMI ORR to this new v3:
    - add metaUtil.removeDuplicateMetadataAttributes: when an ontology URI is resolved
      (UriController), this helper removes the duplicate values added by the
      old ORR system.  Effects:
      - immediate display effect when just viewing the ontology (no changes at all
        in the original registered ontology)
      - but will have persistent effect if a new version of the ontology is registered
        (those duplicates will be removed in the registered version).
    - for redirection from /orr/ -> /ont/ once v3 is installed, see https://github.com/mmisw/mmiorr/wiki

  - remove adjustOntology (interim ontology status setting)
  - re-enable ontologyType facet
  - put "-undefined-" value at the end of facet section
  - adjust style of triple store page; increment timeout to 300secs

* 2017-02-17:  3.2.2
  - for version tag point to https://mmisw.org/orrdoc/changes/
  - resolve #79 "Allow to register a remote URL".
    Upload sequence starts with selection of "local file" or "remote url".
    Unless there's an argument to the `#rx` route (meaning "original uri" is fixed
    to that value), there will be (as in the "local file" case) an "original uri"
    field (initialized to the given remote url), where the user can adjust the
    associated uri if needed / as appropriate.
    The found URIs in the remote file (as in the local file case) are also shown
    to help with the inspection or selection.

* 2017-02-16:  3.2.1
  - fix #22 "upload option for new version".
    The `#rx` route now accepts the URI of the ontology for the registration of a new version.
    A link to this route is now dispatched from the dialog.
  - fix #14 "admin option to repopulate triplestore".
    There is now a new UI page to get the size and to reload the triple store in the backend.
    Using "authorization" header to transfer token for this triple store operations.
    NOTE: use same header mechanism in all other requests.
  - move admin drop-down menu to a directive
  - fix #60 "capture status and visibility when creating new vocab or new mapping"

* 2017-02-14:  3.2.1
  - fix #57 "m2r: check and avoid triple duplications"
    Also, avoid duplicates when loading mapping triples in m2r interface in case registered
    content contains such duplicates (which may be the case due to initial implementations).

  - fix #75 ""No such ontology" for external case in mapped ontologies"

* 2017-02-09:  3.2.0
  - reverting: mostRecentByOwner back to false by default per JG's suggestion
* 2017-02-08:  3.2.0
  - for better display of ontology list when single owners have many ontologies with
    similar version (that is, time of registration), now the mostRecentByOwner is to
    true by default. Concrete example: there are 223 SWEET 2.3 ontologies.

* 2017-02-03:  3.1.9
  - re #76 "iceOfLandOrigin ontology: RDF/XML failing to upload" -
    make exception visible in UI
  - fix #77 "iceOfLandOrigin ontology: not dispatched as ontology"
    services.js: use proper mechanism to indicate parameters in http requests
  - auth/controllers.js: use proper mechanism to indicate parameters in http requests

* 2017-02-03:  3.1.8
  - fix #70 "duplicate ontology URI not checked at creation"

* 2017-02-01:  3.1.7
  - remove the interim "Testing!" badge/popup (orr-testing directive)

* 2016-11-09:  3.1.6
  - re orr-ont#31 "https == http...", reflect reported ontology URI from response

* 2016-10-30:  3.1.5
  - align version with orr-ont
  - improve placement of various tooltips (metadata and v2r)
  - Noted issue with the external WebVOWL service when trying to visualize an ontology at
    the secure XDOMES ORR instance: https://github.com/VisualDataWeb/WebVOWL/issues/66

* 2016-10-28:  3.1.4
  - toward #68 "better display of regular ontology"
    - besides the existing "triple table", new appConfig.externalTools entry with an
      ontViewers array to specify external tools that will be dispatched via iframe.
    - Experimenting with WebVOWL and ORRV for this purpose.

  - resolve #51 "Couldn't get out of term search mode"
    In general, include "Home" link when not at home.

* 2016-09-04:  3.1.3
  - update readme and add development.md
  - gulpfile: do not depend on contents of configuration for changes in distributed html files.
    These changes should instead be done at runtime!

* 2016-09-03:  3.1.3
  - resolve #71 "remove firebase". Lots of clean-up as well.
  - create account: move password fields next to username (so typical browser assistance with remembering
    password does the association with username, not with phone number!)

* 2016-09-01: 3.1.2
  - align version with orr-ont

* 2016-08-22: 3.1.1
  - fix: require recaptchaResponse only if reCaptcha has been configured

* 2016-08-16: 3.1.0
  - add `template.local.config.js` to facilitate docker-based configuration/deployment
  - update testing badge contents
  - for dockerization (on orr-ont side), do not include `--localConfig` in `gulp install`.
    Now, orr-ont has a mechanism to capture the `local.config.js` directly at launch time.

* 2016-07-27: 3.0.4-beta
  - set Help link again to https://mmisw.org/orrdoc/
    See https://github.com/mmisw/orr-portal/issues/64#issuecomment-235758003
  - resolve #66 "recaptcha"
    Used in create-account. New optional config property: recaptcha.siteKey

* 2016-07-27: 3.0.3-beta
  - show location of SPARQL endpoint in sparql/index.html
  - re #63, add "SPARQL Search" link in header (next to "Term Search")

* 2016-07-17: 3.0.2-beta
  - v2r view: add `<clipboard-copy>` for URIs in popovers for vocab classes, properties, and terms
  - resolve #61: "v2r: for a property definition allow to indicate vocabulary from which to select values"
    - New `valueClassUri` in model (backend)
    - New `valueClassUri` attribute in <multivalueedit> directive.
  - gulpfile: include select2/** in distro as there are other resources used (select2.png)

* 2016-07-15: 3.0.1-beta
  - bUtil.uriEqualOrHasPrefixWithSlash also to be used in facetModel for the "hosting" facet
  - v2r: resolve #55 "export vocabulary table to CSV".
    This is enabled is new drop-down menu next to the class in View mode.
    Note, for multi-valued attributes, the new CSV export function uses the `-----` separator in the
    corresponding CSV cell. This separator is recognized by the CSV import function to reflect the multiple values.
    So, this separator handling is similar as that in the <multivalueedit> directive.
    Needs some code clean-up to put the common "separator" stuff in a helper module that the other modules can reuse.
  - resolve #58 "status marks"

* 2016-07-13: 3.0.0-beta
  - fix logic to determine whether a requested URI will be self-dispatched or not.
    Basically this is true when the URI has the window location as a prefix with
    slash as separator (or when both pieces are equal).
    TODO logic to be extended when considering https==http for purposes of URI identification.

* 2016-07-12: 3.0.0-beta
  - start beta status

* 2016-07-12: 3.0.6-alpha:
  - resolve #56 "m2r: various pending enhancements and bugs"
  - utl.message: ad optional autoClose to close the box within the given timeout.
    Used in m2r when mapping triples are added to the table.
  - m2r: fixes and general improvements in editing mode.
    Satisfactory local testing ... but testing by others is needed!
    - use regular <table> on the left- and hand- sides in Term and predicate selection section.
      (again, one big drawback of ui-grid is that variable-height rows are not possible,
      or perhaps they are but far from clear how to it could be accomplished. Another thing is
      that setting popovers that can be hover in cell templates is rather complicated).
    - checkboxes for selection of terms to be mapped laid out in a "symmetric" way
    - display term information in an expandable box (not using tooltips for this as we want
      to allow multiple terms to be expanded for easier review by the user)
    - defined mappings can now be selected for removal (also buttons to select and un-select all)
    - some TODOs
      - check and avoid triple duplications to avoid
      - bug: since triples could duplicated, upon removing one occurrence, make sure to
        remove all corresp duplicates
      - revisit m2r model in backend, perhaps could be simplified/adjusted fo easier (mainly client-side) handling
  - m2r: bug fix: clear selection on both sides upon addition of mappings
  - m2r: include explanation of the three sections in the edit interface
  - ont: make edit new version button a bit more prominent (btn-info);
  - ont: also use check mark in newvoc/newmap uri construction options

* 2016-07-08: 3.0.5-alpha:
  - make facet box height dependent on the number of values.
  - some minor facet module refact
  - show "undefined" for undefined facet values (instead of confusing blank).
  - hide the "ontology type" facet while this is revisited.
  - adjust status tooltips depending on what specific version is being displayed.
    In particular, recall that rvm.rVersion is only defined when dispatching a version prior to the latest.
  - besides status, also allow changing visibility on any version (not only on the latest)
  - show ontology version status even when user cannot change it
  - resolve #41 "Workflow for defining IRIs: term set class"
    Added some text and improved the visual feedback for the "Local name" vs. "Full URI" selection.
    Also the relevant field is automatically focused.
    Did add the part about "..defaults are reflected below; click OK to accept them" because
    it would require some additional logic (are we editing an already entered entity?, is it the
    first term class..). Can be improved later.
  - resolve #13 "capture status"
    - possible values: `unstable`, `testing`, `stable`, `archaic`, plus `draft` and `deprecated`,
      with "resource" substituted for "term" in text descriptions in the first 4 above
      from https://www.w3.org/2003/06/sw-vocab-status/note.html.
      This set of values is given in new configuration entry `cfg.ontologyStatuses`.
    - capture status in the upload sequence
    - allow to change status for registered ontology

* 2016-07-07: 3.0.5-alpha:
  - style adjustments in confirmation and selection dialogs
  - <multivalueedit>: handle these keystrokes:
    - Ctrl-s to open the select dialog
    - Ctrl-+ to add value.
      This required naming the textarea (via e-name) for xeditable to update corresponding
      $data.<the-name> upon changes during editing, and thus one be able to $watch those changes
      (note that watching vm.valueEntry directly only sees a change when the form is accepted).
      Textarea also resized according to new number of lines in the contents.
  - resolve #35 "allow any member of an organization to edit the corresponding membership list"
    This was actually resolved as part of fix to #54.
    (note, related and pending #36 "organization manager")
  - fix #54 "edit organization enabled when not authorized"
  - v2r: also allow selection of values from set of instances of given class for the property, if any.
    Exercised with http://www.w3.org/2003/06/sw-vocab-status/ns#term_status and ad hoc
    values just captured in http://cor.esipfed.org/ont3/testorg/termstatus/Status.
    Enabled this particular property in my local.config.js:

      ```js
        appConfig.valueSelections["http://www.w3.org/2003/06/sw-vocab-status/ns#term_status"] = {
          class: "http://cor.esipfed.org/ont3/testorg/termstatus/Status",
          sparqlEndpoint: "http://cor.esipfed.org/ont3sparql"
        };
     ```

* 2016-07-06: 3.0.4-alpha:
  - resolve #44 "metadata attribute help needs help"
    Copy-n-pasted the description from the ORR v2 directly.

  - minor adjust style in metadata section header tooltip
  - display and capture organization URL; improve display of organization
  - resolve #53 "Create organization dialog box URI not right?"
    Just remove the displayed URL, which seems I added with a blind copy-n-paste

  - resolve #47 "term set class dialog box help text context issue"

  - resolve #43 "modal issues with parameter entry".
    - new simplified handling in <multivalueedit> directive:
      - now, only a single text area for the cell value is used
      - Enter and blur event immediately accept the cell contents
      - five dashes in a line by itself serve a separator for multi-value cell
      - Ctrl-Enter used to enter a new line for a multi-line value
      - Esc cancels changes in the cell
    - also use <multivalueedit> in v2r editing
    - v2r: move/insert/delete property operations again working upon an adjustment in <multivalueedit> to
      update vm.valueEntry when vm.propValue changes (using a $watch)
    - make metadata property cells focusable so one can navigate with tab and shift-tab

  - fix #40 "Testing popup is offscreen left" --tested with chrome and safari
  - metadata: if undefined hide omv.name and omv.description (but show them in edit mode)
    TODO the general configuration/dispatch of metadata properties is still to be fully defined/implemented.
  - metadata: include dc.description and dc.creator in General section (used in http://data.gcoos.org/dp/data/Parameters.owl)
  - looking into #42 "updating metadata for an ontology doesn't show or maintain existing values"
    - OntController: do not duplicate refresh ontology request if we already have the information from enclosing UriController;
      but still set the view and visibility options and retrieve the ontology *data*.
    - marking as fixed as could not reproduce either locally (both directly or via local docker deployment) or
      on COR.  Likely resolved by various adjustments.

  - metadata: include rdfs.label in General section (the SWEET ontologies use it)
  - resolve #50 "Capitalize 'o' in Upload Ontology button"
  - resolve #49 "need contact us in web app":  new optional config parameter branding.contactUs

* 2016-07-05: 3.0.3-alpha:
  - fix bug: upload: getUserCanRegisterNewVersion was using "name" and not "orgName" for checking organizations
  - fix bug: re-hosted brand new submission with organization as owner was actually associated with user and not with
    selected organization
  - gulpfile: add missing select2.css in distribution
  - metadata: include dc.title and rdfs.comment in General section
  - upload: more explanation of registration types and selection of name from detected properties
  - upload: include info about recognized formats and make selection of URI more clear
  - various style adjustments and auto-focus in user account related dialogs
  - add create account button in header

* 2016-06-26: 3.0.2-alpha:
  - specially for alpha testing, add "Testing!" badge in application header with some info and links to issue tracker

  - resolve #39 "add option in Upload to let the ORR determine the format".
    Actually, decided to not even prompt the user about this, so always
    use the special `_guess` format supported by the backend.

  - ont: better handling of "leave page" confirmation when editing brand new ontology or new version

* 2016-06-25: 3.0.2-alpha:
  - resolve #38 "improve error message when failing to load URL for external ontology"
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

