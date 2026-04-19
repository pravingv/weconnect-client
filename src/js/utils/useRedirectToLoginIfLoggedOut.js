import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useConnectAppContext } from '../contexts/ConnectAppContext';

// Because we don't yet have an API endpoint to check session status, we infer
// a logged-out session by counting consecutive failures on endpoints that
// require an active login. The threshold is intentionally high (50) because
// occasional errors happen even when logged in; 15 was too trigger-happy.
// const API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD = 50;
// Teams = 50, other pages make fewer requests and are set to 30, shouldn't be less than about 20.
// Number might have to change in the future if/when the back-end requests etc are changed.
// Now it's an argument rather than a constant.

const useRedirectToLoginIfLoggedOut = (retrieveResults, retrieveErrorsThreshold) => {
  const API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD = retrieveErrorsThreshold;
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const navigate = useNavigate();

  useEffect(() => {
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
      // console.log(`apiRetrieveErrorsInARowCount: ${getAppContextValue('apiRetrieveErrorsInARowCount')}`);
    }
  }, [retrieveResults]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useRedirectToLoginIfLoggedOut;
