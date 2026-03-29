import isEqual from 'lodash-es/isEqual';

export default function capturePersonListRetrieveData (incomingResults, apiDataCache, dispatch) {
  const { data, isSuccess } = incomingResults;
  const allPeopleCache = apiDataCache.allPeopleCache || {};
  let changeResults = {
    allPeopleCache,
    allPeopleCacheChanged: false,
  };
  const allPeopleCacheNew = { ...allPeopleCache };
  // console.log('PersonListRetrieve data: ', data, ', isFetching:', isFetching, ', isSuccess:', isSuccess);
  // We need to only update allPeopleCache the first time we have received new data from the API server
  if (data && data.personList && isSuccess === true) {
    let newDataReceived = false;
    data.personList.forEach((person) => {
      if (person && person.personId && person.personId >= 0) {
        if (!allPeopleCacheNew[person.personId]) {
          allPeopleCacheNew[person.personId] = person;
          newDataReceived = true;
        } else if (!isEqual(person, allPeopleCacheNew[person.personId])) {
          allPeopleCacheNew[person.personId] = person;
          newDataReceived = true;
        }
      }
    });
    // console.log('person-list-retrieve setting allPeopleCacheNew:', allPeopleCacheNew, ', newDataReceived:', newDataReceived);
    if (newDataReceived) {
      // setAppContextValue('allPeopleCache', allPeopleCache);
      dispatch({ type: 'updateByKeyValue', key: 'allPeopleCache', value: allPeopleCacheNew });
      changeResults = {
        allPeopleCache: allPeopleCacheNew,
        allPeopleCacheChanged: true,
      };
    }
  }
  return changeResults;
}

