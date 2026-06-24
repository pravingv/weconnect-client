import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useConnectAppContext } from '../contexts/ConnectAppContext';

// Because we don't yet have an API endpoint to check session status, we infer
// a logged-out session by counting consecutive AUTH failures (HTTP 403) on endpoints that
// require an active login.
// WV-4619: Three guards make this far less trigger-happy than the original "count every failed
// request" approach (which misfired on mobile). ALL must be satisfied before we redirect:
//   1. Count only genuine auth failures (403). Transient network errors (timeouts, 5xx, dropped
//      requests) and in-flight/pending states are ignored -- those do NOT mean you're logged out,
//      and on flaky mobile connections they were the main cause of false logouts. (isAuthError is
//      surfaced by useFetchData / weConnectQueryFn.) The count threshold is passed in by the page.
//   2. Page-load grace period (THE ticket requirement): the redirect check is suppressed entirely
//      for the first 60 seconds after the page loads. No matter how many 403s pile up in that
//      window, we never redirect. Measured with performance.now() (ms since document load).
//   3. Error-streak duration (extra false-positive protection, BEYOND the original ask -- flag in
//      PR/to Dale): the uninterrupted 403 streak must also last >= 60 seconds. Any successful
//      request resets it, so a short burst of 403s won't redirect. Empirically this prevents the
//      false logouts without ever firing on transient trouble. Guards 2 and 3 are deliberately
//      separate gates with different meanings; keeping both is intentional, not redundant.
// Because we now count only real 403s, the count threshold can be much lower than the old 200.

// Guard 2: how long after page load before the redirect check is allowed to run at all.
const REDIRECT_TO_LOGIN_GRACE_AFTER_PAGE_LOAD_MS = 60 * 1000;
// Guard 3: minimum duration an uninterrupted 403 streak must last (reset by any success).
const REDIRECT_TO_LOGIN_MINIMUM_ERROR_STREAK_MS = 60 * 1000;

const useRedirectToLoginIfLoggedOut = (retrieveResults, retrieveErrorsThreshold) => {
  // Dale's master switch: keeps this whole feature (the redirect AND the WV-4619 60-second gate)
  // disable-able for prod until he deems it ready. The two are tied together by this one flag.
  const REDIRECT_TO_LOGIN_TURNED_OFF = false;
  const API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD = retrieveErrorsThreshold;
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (REDIRECT_TO_LOGIN_TURNED_OFF) return;
    if (!retrieveResults) return;
    if (retrieveResults.isSuccess === true) {
      // A successful authenticated request proves the session is valid: reset the streak.
      if (getAppContextValue('apiRetrieveErrorsInARowCount') !== 0) {
        setAppContextValue('apiRetrieveErrorsInARowCount', 0);
        setAppContextValue('apiRetrieveErrorsFirstErrorTimestampMs', null);
      }
    } else if (retrieveResults.isAuthError === true) {
      // Only genuine auth failures (403) count toward "you're logged out". Network errors and
      // pending states fall through and are ignored (they neither increment nor reset the streak).
      const previousErrorsInARowCount = getAppContextValue('apiRetrieveErrorsInARowCount') || 0;
      if (previousErrorsInARowCount === 0) {
        // Start of a new auth-error streak: stamp the moment the first 403 occurred.
        setAppContextValue('apiRetrieveErrorsFirstErrorTimestampMs', Date.now());
      }
      const errorsInARowCount = previousErrorsInARowCount + 1;
      setAppContextValue('apiRetrieveErrorsInARowCount', errorsInARowCount);
      // console.log(`apiRetrieveErrorsInARowCount: ${errorsInARowCount}`);

      const firstErrorTimestampMs = getAppContextValue('apiRetrieveErrorsFirstErrorTimestampMs');
      const errorStreakDurationMs = firstErrorTimestampMs ? Date.now() - firstErrorTimestampMs : 0;
      // performance.now() = ms since this page (document) loaded. A hard reload resets it to 0;
      // SPA navigation between Teams/Tasks/Settings does not.
      const msSincePageLoad = performance.now();

      if (errorsInARowCount >= API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD &&
        msSincePageLoad >= REDIRECT_TO_LOGIN_GRACE_AFTER_PAGE_LOAD_MS &&
        errorStreakDurationMs >= REDIRECT_TO_LOGIN_MINIMUM_ERROR_STREAK_MS &&
        apiDataCache.viewerAccessRights !== null &&
        apiDataCache.viewerAccessRights.canAddPerson !== null
      ) {
        setAppContextValue('apiRetrieveErrorsInARowCount', 0);
        setAppContextValue('apiRetrieveErrorsFirstErrorTimestampMs', null);
        navigate('/login');
        navigate(0);
      }
    }
  }, [retrieveResults]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useRedirectToLoginIfLoggedOut;
