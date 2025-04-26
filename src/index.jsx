import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import ErrorBoundary from './js/common/components/Widgets/ErrorBoundary';
import { isAndroid } from './js/common/utils/isCordovaOrWebApp';


// The following line is rewritten to true by the buildSrcCordova.js node script
const isIndexCordova = false;

function redirectToStandardizedWeVoteUrl () {
  if (window && window.location && window.location.href) {
    // console.log(window.location);
    const oldURL = window.location.href;
    let changeFound = false;
    // hostname we can take down to all lower case, but we don't want to take href down to all lower case
    let newHostname = window.location.hostname.toLowerCase();
    if (window.location.hostname.toLowerCase().includes('//www.')) {
      newHostname = newHostname.replace('//www.', '//');
      changeFound = true;
    }
    if (changeFound) {
      // Take hostname to all lower case, but leave the rest of the URL with original case
      const newURL = oldURL.replace(window.location.hostname, newHostname);
      console.log(`index.jsx redirectToStandardizedWeVoteUrl, redirecting from ${oldURL} to ${newURL}`);
      window.location.replace(newURL);
    }
  }
}

function startReact () {
  const root = createRoot(document.getElementById('app'));
  root.render(
    <ErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>,
  );

  try {
    const { hostname } = window.location;
    if (hostname && hostname === 'localhost' && !isAndroid()) {
      module.hot.accept();   // For Webpack
    }
  } catch (e) {
    console.log('Webpack\'s module.hot.accept() threw:', e);
  }
}

// Begin inline code

if (isIndexCordova) {
  // initializeCordovaToken -- Do not remove this line!
} else {
  redirectToStandardizedWeVoteUrl();
  startReact();
}

