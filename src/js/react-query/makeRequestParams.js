export function makeRequestParamsDictionary (plainParams, data) {
  // plainParams could also be considered lookup params
  const expandedParams = {};
  Object.keys(plainParams).forEach((key) => {
    expandedParams[`${key}`] = plainParams[key];
  });
  Object.keys(data).forEach((key) => {
    expandedParams[`${key}ToBeSaved`] = data[key];
    expandedParams[`${key}Changed`] = 'true';
  });
  return expandedParams;
}

// Make request string
export default function makeRequestParams (plainParams, data) {
  const expandedParams = makeRequestParamsDictionary(plainParams, data);

  const queryString = Object.entries(expandedParams)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return queryString;
}
