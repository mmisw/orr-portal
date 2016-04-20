//
// This is the base configuration file for orr-portal.
// Define/override properties for your particular instance in local.config.js.
// For example:
//   appConfig.orront.rest  = "https://example.net/ont";
//   appConfig.firebase.url = "https://my-mmiorr.firebaseio.com";
//

var appConfig = {
  help: "https://github.com/mmisw/orr-portal",

  orront: {
    // (required) orr-ont endpoint URL. (No trailing slash.)
    // This could be a full URL ("https://example.net/ont")
    // or a path relative to the orr-portal host ("/ont")
    rest: "/ont",

    // (required) SPARQL endpoint URL.  (No trailing slash.)
    // This could be a full URL ("https://example.net/sparql")
    // or a path relative to the orr-portal host ("/sparql")
    sparqlEndpoint: '/sparql'
  }

  // (required) firebase application.
  // NOTE: This may be removed in a future version.
  ,firebase: {
    url: "https://[myapp].firebaseio.com"
  }
};
