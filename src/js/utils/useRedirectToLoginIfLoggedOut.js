import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useConnectAppContext } from '../contexts/ConnectAppContext';

// Because we don't yet have an API endpoint to check session status, we infer
// a logged-out session by counting consecutive failures on endpoints that
// require an active login. The threshold is intentionally high (50) because
// occasional errors happen even when logged in; 15 was too trigger-happy.
// API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD was originally 30-50, and that worked for desktop tests,
// but was too trigger-happy on mobile, detecting subsequent errors of a logged in user as proof of being logged out
// now it's 200 to be on the safe side

const useRedirectToLoginIfLoggedOut = (retrieveResults, retrieveErrorsThreshold) => {
  const REDIRECT_TO_LOGIN_TURNED_OFF = true; // This feature is currently causing some problems for the HR team, so we're disabling it for now.
  const API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD = retrieveErrorsThreshold;
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (REDIRECT_TO_LOGIN_TURNED_OFF) return;
    if (!retrieveResults) return;
    if (retrieveResults.isSuccess === false) {
      if (getAppContextValue('apiRetrieveErrorsInARowCount') === null) {
        setAppContextValue('apiRetrieveErrorsInARowCount', 0);
      }
      setAppContextValue('apiRetrieveErrorsInARowCount', getAppContextValue('apiRetrieveErrorsInARowCount') + 1);
      // console.log(`apiRetrieveErrorsInARowCount: ${getAppContextValue('apiRetrieveErrorsInARowCount')}`);
      if (getAppContextValue('apiRetrieveErrorsInARowCount') >= API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD &&
        apiDataCache.viewerAccessRights !== null &&
        apiDataCache.viewerAccessRights.canAddPerson !== null
      ) {
        setAppContextValue('apiRetrieveErrorsInARowCount', 0);
        navigate('/login');
        navigate(0);
      }
    } else if (retrieveResults.isSuccess === true && getAppContextValue('apiRetrieveErrorsInARowCount') !== 0) {
      setAppContextValue('apiRetrieveErrorsInARowCount', 0);
      console.log(`apiRetrieveErrorsInARowCount: ${getAppContextValue('apiRetrieveErrorsInARowCount')}`);
    }
  }, [retrieveResults]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useRedirectToLoginIfLoggedOut;
