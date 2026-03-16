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
  Object.keys(params).forEach((key) => {
    res[key] = params[key];
  });


  httpLog(`HTTP weConnectQueryFn ${queryKey} (${isGet ? 'GET' : 'POST'}): ${JSON.stringify(res || {})}`);
  const url = new URL(`${queryKey}/`,
    forceMaster ? 'https://teamapi.wevote.org/apis/v1/' : webAppConfig.STAFF_API_SERVER_API_ROOT_URL);
  // console.log(queryKey, params, isGet);
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
    if (response.data.displayErrorMessage) {
      // TODO Consider showing this API error in the interface to the viewer
      console.error(`displayErrorMessage ${queryKey} status: ${response.data.status}`);
    }
  } catch (err) {
    const errorMsg = typeof err !== 'undefined' ? err : '';
    console.error('Axios ', (isGet ? 'axios.get' : 'axios.post'), ' error: ', errorMsg);
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
    console.log(`An error occurred with ${queryKey}: ${error.message}`);
  }
  // if (queryKey === 'task-status-list-retrieve')   {
  //   console.log(`-----${queryKey} isSuccess: ${isSuccess}, isStale: ${isStale}, refetch: ${refetch}`);
  //   console.log(`+++++${queryKey} data: ${JSON.stringify(data)}`);
  // }
  return { data, isSuccess, isFetching, isStale, refetch };
};

export default weConnectQueryFn;
export { useFetchData, METHOD };
