const makeRequestParams = (plainParams, data) => {
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
};

export const makeRequestParamsDictionary = makeRequestParams;

export default makeRequestParams;
