/* eslint-disable */
// Note that we import these values where needed as "webAppConfig"
module.exports = {
  // weconnect React server for the "weconnect-client" web app
  NAME_FOR_BROWSER_TAB_TITLE: 'WeConnect',
  ORGANIZATION_NAME: 'WeVote',
  PROTOCOL: 'http://', // 'http://' for local dev (if not using SSL), or 'https://' for live server
  HOSTNAME: 'localhost:4000', // Don't add 'http...' here.  Live server: 'WeVote.US', Quality: 'quality.WeVote.US', developers: 'localhost:4000'
  PORT: 'localhost:4000', // Don't add 'http...' here.  Live server: 'WeVote.US', Quality: 'quality.WeVote.US', developers: 'localhost:4000'
  IMAGE_PATH_FOR_CORDOVA: 'https://wevote.us',   // If you are not working with Cordova, you don't need to change this
  SECURE_CERTIFICATE_INSTALLED: false,
  WECONNECT_URL_FOR_SEO: 'https://wevoteconnect.org',
  SERVER_IS_SOURCE_OF_TRUTH: false,

  ///////////////////////////////////////////////
  // Keep all three configuration blocks below, but only uncomment one of them at a time.
  //// Connecting to local WeConnect "weconnect-server" APIs ////
  STAFF_API_SERVER_ROOT_URL: 'https://localhost:4500/',
  STAFF_API_SERVER_ADMIN_ROOT_URL: 'https://localhost:4500/admin/',
  STAFF_API_SERVER_API_ROOT_URL: 'https://localhost:4500/apis/v1/',
  STAFF_API_SERVER_API_CDN_ROOT_URL: 'https://localhost:4500/apis/v1/',
  //// weconnect-server local server running SSL/TLS HTTPS
  // STAFF_API_SERVER_ROOT_URL: 'https://wevotedeveloper.com:4500/',
  // STAFF_API_SERVER_ADMIN_ROOT_URL: 'https://wevotedeveloper.com:4500/admin/',
  // STAFF_API_SERVER_API_ROOT_URL: 'https://wevotedeveloper.com:4500/apis/v1/',
  // STAFF_API_SERVER_API_CDN_ROOT_URL: 'https://wevotedeveloper.com:4500/apis/v1/',
  //// Connecting to live WeConnect APIs ////
  // STAFF_API_SERVER_ROOT_URL: 'https://teamapi.wevote.org/',
  // STAFF_API_SERVER_ADMIN_ROOT_URL: 'https://teamapi.wevote.org/admin/',
  // STAFF_API_SERVER_API_ROOT_URL: 'https://teamapi.wevote.org/apis/v1/',
  // STAFF_API_SERVER_API_CDN_ROOT_URL: 'https://cdn.teamapi.wevote.org/apis/v1/',

  // For when we need to connect to the WeVote WebApp front end
  VOTER_FRONT_END_APP_URL_PROTOCOL: 'http://', // 'http://' for local dev (if not using SSL), or 'https://' for live server
  VOTER_FRONT_END_APP_HOSTNAME: 'localhost:3000', // Don't add 'http...' here.  Live server: 'WeVote.US', Quality: 'quality.WeVote.US', developers: 'localhost:3000'

  ///////////////////////////////////////////////
  // Keep all three configuration blocks below, but only uncomment one of them at a time.
  //// Connecting to local WeVoteServer APIs HTTP ////
  // VOTER_FRONT_END_APP_SERVER_ROOT_URL: 'http://localhost:8000/',
  // VOTER_API_SERVER_ADMIN_ROOT_URL: 'http://localhost:8000/admin/',
  // VOTER_API_SERVER_API_ROOT_URL: 'http://localhost:8000/apis/v1/',
  // VOTER_API_SERVER_API_CDN_ROOT_URL: 'http://localhost:8000/apis/v1/',
  //// Connecting to local WeVoteServer APIs HTTPS TLS/SSL ////
  // VOTER_FRONT_END_APP_SERVER_ROOT_URL: 'https://wevotedeveloper.com:8000/',
  // VOTER_API_SERVER_ADMIN_ROOT_URL: 'https://wevotedeveloper.com:8000/admin/',
  // VOTER_API_SERVER_API_ROOT_URL: 'https://wevotedeveloper.com:8000/apis/v1/',
  // VOTER_API_SERVER_API_CDN_ROOT_URL: 'https://wevotedeveloper.com:8000/apis/v1/',
  //// Connecting to live WeVoteServer APIs ////
  VOTER_API_SERVER_ROOT_URL: 'https://api.wevoteusa.org/',
  VOTER_API_SERVER_ADMIN_ROOT_URL: 'https://api.wevoteusa.org/admin/',
  VOTER_API_SERVER_API_ROOT_URL: 'https://api.wevoteusa.org/apis/v1/',
  VOTER_API_SERVER_API_CDN_ROOT_URL: 'https://cdn.wevoteusa.org/apis/v1/',

  ENABLE_NEXT_RELEASE_FEATURES: true,
  ENABLE_WORKBOX_SERVICE_WORKER: false,  // After setting this false, in Chrome DevTools go to Application Tab, Application/Service Worker and for the sw.js click the "unregister" button to the right

  DEBUG_MODE: false,
  SHOW_TEST_OPTIONS: false,    // On the DeviceDialog and elsewhere

  ENABLE_REACT_QUERY_TOOLS: false,        // Show ReactQueryDevtools icon/console
  LOG_AUTHENTICATION: false,              // authLog function prints to console
  LOG_CORDOVA_OFFSETS: false,
  LOG_HTTP_REQUESTS: false,
  LOG_RENDER_EVENTS__FIRST_ONLY: false,   // Log the render event for a component, but only the first time
  LOG_REACT_QUERY_EVENTS: false,          // Log query requests/responses
  LOG_RENDER_EVENTS: false,
  LOG_ROUTING: false,
  SHOW_CORDOVA_URL_FIELD: false,          // Only needed for debugging in Cordova

  // Use 1 or 0 as opposed to true or false
  test: {
    use_test_election: 0,
  },

  location: {
    text_for_map_search: '',
  },

  ENABLE_FACEBOOK: false,
  ENABLE_TWITTER: false,

  // API Keys, some of these are publishable (not secret)
  GOOGLE_ADS_TRACKING_ID: '',
  GOOGLE_TAG_MANAGER_ID: '',
  GOOGLE_ANALYTICS_TRACKING_ID: '',
  GOOGLE_MAPS_API_KEY: '',
  GOOGLE_RECAPTCHA_KEY: '',
  OPEN_REPLAY_PROJECT_KEY: '',
  OPEN_REPLAY_INGEST_POINT: 'https://openreplay.wevote.us/ingest',
};
