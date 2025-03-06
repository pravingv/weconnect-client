const clearSignedInGlobals = (setAppContextValue, getAppContextData) => {
  setAppContextValue('authenticatedPerson', {});
  setAppContextValue('isAuthenticated', false);
  setAppContextValue('secretCodeVerifiedForReset', false);
  setAppContextValue('secretCodeVerified', false);
  console.log('appContextData in clearSignedInGlobals after clear: ', getAppContextData());
};

// eslint-disable-next-line import/prefer-default-export
export { clearSignedInGlobals };
