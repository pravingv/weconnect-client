// /src/js/react-query/WeConnectQuery.js
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { httpLog, reactQueryLog } from '../common/utils/logging';
import webAppConfig from '../config';

const METHOD = {
  GET: true,
  POST: false,
};

const buildSearchParams = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, item);
        }
      });
      return;
    }

    searchParams.append(key, value);
  });

  return searchParams;
};


// https://refine.dev/blog/react-query-guide/#performing-basic-data-fetching
// Define a default query function that will receive the query key
const weConnectQueryFn = async (queryKey, params, isGet, forceMaster = false) => {
  const res = { queryKey, isGet, forceMaster };
  // console.log('weConnectQueryFn queryKey: ', queryKey.toString(), ', params: ', params, ', isGet: ', isGet, ', forceMaster: ', forceMaster);
  Object.keys(params).forEach((key) => {
    res[key] = params[key];
  });


  httpLog(`HTTP weConnectQueryFn ${queryKey} (${isGet ? 'GET' : 'POST'}): ${JSON.stringify(res || {})}`);
  const url = new URL(`${queryKey}/`,
    forceMaster ? 'https://teamapi.wevote.org/apis/v1/' : webAppConfig.STAFF_API_SERVER_API_ROOT_URL);
  // console.log(`HTTP weConnectQueryFn url ${url}`);
  if (isGet) {
    url.search = buildSearchParams(params).toString();
  }
  reactQueryLog(`weConnectQueryFn ${isGet ? 'GET' : 'POST'} url.href: ${url.href}`);

  let response;
  try {
    response = isGet ?
      await axios.get(url.href, { withCredentials: true }) :
      await axios.post(url.href, params, { withCredentials: true });
    // if needed:  httpLog('weConnectQueryFn  response.data: ', JSON.stringify(response.data));
    // console.log('weConnectQueryFn response.status: ', response.status, ', response.data: ', JSON.stringify(response.data) || 'No data');
    window.networkError = false;
    if (response.data.displayErrorMessage) {
      console.error(`displayErrorMessage ${queryKey} status: ${response.data.status}`);
      if (!response.data.errorMessage.message.includes('403')) {
        window.networkError = true;
      }
    }
  } catch (err) {
    const errorMsg = typeof err !== 'undefined' ? err : '';
    const httpStatusCode = err?.response?.status;
    // A 403 from an authenticated endpoint means "not authorized" (likely logged out), as opposed
    // to a transient network error (timeout, 5xx, dropped request). Telling them apart lets the
    // logged-out-redirect heuristic count only genuine auth failures. (WV-4619)
    const isAuthError = httpStatusCode === 403 || (errorMsg?.message?.includes('403') ?? false);
    if (!isAuthError) {
      window.networkError = true;
    }
    console.error('Axios ', (isGet ? 'axios.get' : 'axios.post'), ' error: ', errorMsg);
    // Re-throw so React Query records the failed query and exposes the error (with its HTTP status)
    // to callers via useFetchData. Tag it so callers can distinguish an auth failure from a network
    // error without reparsing the message. (Previously errors were swallowed and undefined was
    // returned, which React Query already treated as a failed query, so callers see no change.)
    if (err && typeof err === 'object') {
      err.weConnectIsAuthError = isAuthError;
      err.weConnectHttpStatusCode = httpStatusCode;
    }
    throw err;
  }

  return response?.data;
};

const useFetchData = (queryKey, fetchParams, isGet, shouldExecute = true, queryOptions = {}) => {
  if (shouldExecute) {
    reactQueryLog('useFetchData queryKey, fetchParams before fetch: ', queryKey, '  fetchParams: ', fetchParams);
  }

  const { data, isSuccess, isFetching, isStale, refetch, error } = useQuery({
    queryKey,
    queryFn: () => weConnectQueryFn(queryKey, fetchParams, isGet),
    enabled: shouldExecute,
    ...queryOptions,
    // staleTime: shouldExecute ? 0 : '',
  });
  if (error) {
    console.log(`An error occurred with ${queryKey}, queryOptions ${queryOptions}: ${error.message}`);
  }
  // WV-4619: surface whether the most recent failure was an auth error (403 / likely logged out)
  // vs. a transient network error, so useRedirectToLoginIfLoggedOut counts only genuine auth failures.
  const isAuthError = error ? (error.weConnectIsAuthError === true || error?.response?.status === 403) : false;
  // if (queryKey === 'task-status-list-retrieve')   {
  //   console.log(`-----${queryKey} isSuccess: ${isSuccess}, isStale: ${isStale}, refetch: ${refetch}`);
  //   console.log(`+++++${queryKey} data: ${JSON.stringify(data)}`);
  // }
  return { data, isSuccess, isFetching, isStale, refetch, isAuthError };
};

export default weConnectQueryFn;
export { useFetchData, METHOD };
