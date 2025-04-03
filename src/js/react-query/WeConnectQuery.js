import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { reactQueryLog } from '../common/utils/logging';
import webAppConfig from '../config';

const METHOD = {
  GET: true,
  POST: false,
};

// https://refine.dev/blog/react-query-guide/#performing-basic-data-fetching
// Define a default query function that will receive the query key
const weConnectQueryFn = async (queryKey, params, isGet) => {
  // console.log('weConnectQueryFn : ', queryKey, params, isGet);
  const url = new URL(`${queryKey}/`, webAppConfig.STAFF_API_SERVER_API_ROOT_URL);
  console.log(queryKey, params, isGet);
  if (isGet) {
    url.search = new URLSearchParams(params);
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
  } catch (e) {
    console.error('Axios ', (isGet ? 'axios.get' : 'axios.post'), ' error: ', e);
  }

  return response?.data;
};

const useFetchData = (queryKey, fetchParams, isGet) => {
  reactQueryLog('useFetchData queryKey, fetchParams before fetch: ', queryKey, '  fetchParams: ', fetchParams);
  const { data, isSuccess, isFetching, isStale, refetch, error } = useQuery({
    queryKey,
    queryFn: () => weConnectQueryFn(queryKey, fetchParams, isGet),
    // networkMode: 'always',  // <-- This is not a solution, it just covers up some problem in our code, while disabling the biggest benefit of ReactQueries.
  });
  if (error) {
    console.log(`An error occurred with ${queryKey}: ${error.message}`);
  }
  return { data, isSuccess, isFetching, isStale, refetch };
};

export default weConnectQueryFn;
export { useFetchData, METHOD };
