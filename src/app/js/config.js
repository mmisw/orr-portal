var appConfig = {
  help: "https://github.com/mmisw/orr-portal",

  orront: {
    // orr-ont endpoint (without trailing slash)
    rest: "https://mmisw.org/orr-ont",

    // prefix to recognize "self-resolvable" URLs
    selfHostPrefix: "http://mmisw.org/ont/",

    // SPARQL endpoint
    sparqlEndpoint: 'https://mmisw.org/sparql'
  }

  ,firebase: {
    url: "https://[myapp].firebaseio.com"
  }
};

// Override properties for local settings in a local.config.js file.
