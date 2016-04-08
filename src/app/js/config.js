//
// This is the base configuration file for orr-portal.
// Define/override properties for your particular instance in local.config.js.
// For example, for the http://mmisw.org instance:
//    appConfig.orront.selfHostPrefix = "http://mmisw.org/orr-ont/";
//    appConfig.orront.sparqlEndpoint = "https://mmisw.org/sparql";
//

var appConfig = {
  help: "https://github.com/mmisw/orr-portal",

  orront: {
    // (required) orr-ont endpoint (without trailing slash).
    // The default value here, "/orr-ont", assumes that the orr-ont service is
    // under the same host as this orr-portal instance.
    // You can indicate the full URL of the endpoint if needed.
    rest: "/orr-ont",

    // (required) prefix to recognize "self-resolvable" URLs.
    // Typically this will be the same as the full URI of the orr-ont REST endpoint.
    selfHostPrefix: "http://example.net/ont/",

    // (required) URL of the SPARQL endpoint:
    sparqlEndpoint: 'https://example.net/sparql'
  }

  // firebase application (NOTE: This may be removed in a future version)
  ,firebase: {
    url: "https://[myapp].firebaseio.com"
  }
};

