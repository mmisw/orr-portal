////////////////////////////////////////////////////////////
// Template for creation of a local configuration file for the orr-portal
//
// NOTE:
//
// - Values below are only for illustration; adjust as appropriate for your instance.
//
// - The settings below are focused on the Docker-based deployment of the complete
//   ORR system (see https://github.com/mmisw/orr-ont/blob/master/DEPLOYMENT.md).
//   For more advanced settings, you can look at the base configuration file
//   (https://github.com/mmisw/orr-portal/blob/master/src/app/js/config.js)
//   and set the new values here as desired.
////////////////////////////////////////////////////////////

// (required) main ORR page URL.
// This can start with '//' to dynamically accommodate http or https access.
appConfig.portal.mainPage  = "//my-orr.org/ont/";

// (optional) URL of image to show in the page header.
// By default, this will be MMI ORR's logo.
//appConfig.branding.logo  = "http://example.net/my_logo.png";

// (optional) string used for <head><title> in main pages.
// By default, this will be related with the MMI ORR.
appConfig.branding.title  = "My ORR Instance";

// (optional) "Contact us" link.
// No default value.
//appConfig.branding.contactUs  = "http://example.net/contact";

// (optional) "Terms of Use" link.
// No default value.
//appConfig.branding.tou = "http://example.net/termsofuse";


// recaptcha: optional but recommended.
// See https://www.google.com/recaptcha/intro/index.html
appConfig.recaptcha = {
  // The "site key" corresponding to the `recaptcha.privateKey` entry in the backend configuration
  //siteKey: "..."
};

// (required) firebase application URL (https://www.firebase.com/docs/web/guide/login/custom.html).
// NOTE: This dependency is planned to be removed, see https://github.com/mmisw/orr-ont/issues/25.
// In the mean time, please contact us if this is preventing you from moving forward with your ORR instance.
appConfig.firebase.url = "https://[myapp].firebaseio.com";
