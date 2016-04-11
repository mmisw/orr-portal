//
// This is the base configuration file for orr-portal.
// Define/override properties for your particular instance in local.config.js.
// For example:
//    appConfig.orront.rest           = "http://mmisw.org/orr-ont";
//    appConfig.orront.sparqlEndpoint = "http://mmisw.org/sparql";
//

var appConfig = {
  help: "https://github.com/mmisw/orr-portal",

  orront: {
    // (required) Full URL of orr-ont endpoint URL (without trailing slash).
    rest: "http://example.net/orr-ont",

    // (required) URL of the SPARQL endpoint:
    sparqlEndpoint: 'https://example.net/sparql'
  }

  // firebase application (NOTE: This may be removed in a future version)
  ,firebase: {
    url: "https://[myapp].firebaseio.com"
  }
};

