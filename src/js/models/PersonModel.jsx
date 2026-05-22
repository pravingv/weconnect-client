// PersonModel.js
// Functions related to getting data from the apiDataCache, which stores data
// received from our API servers.
import isEqual from 'lodash-es/isEqual';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnectAppContext } from '../contexts/ConnectAppContext';
import weConnectQueryFn, { METHOD } from '../react-query/WeConnectQuery';

// If you make any changes to the following, also update controllers/PersonController.js getPersonAwayLabel
export const PERSON_AWAY_REASONS = ['isLeaveOfAbsence', 'isNotFeelingWell', 'isNotAttending', 'isResigned', 'isVacation', 'isWorkTrip'];
export const PERSON_AWAY_REASONS_WITH_HR = [...PERSON_AWAY_REASONS, 'isNonResponsive'];

export function capturePersonRetrieveData (incomingResults = {}, apiDataCache = {}, dispatch) {
  const { data, isSuccess } = incomingResults;
  const allPeopleCache = apiDataCache.allPeopleCache || {};
  let changeResults = {
    allPeopleCache,
    allPeopleCacheChanged: false,
  };
  const allPeopleCacheNew = { ...allPeopleCache };
  // We need to only update allPeopleCache the first time we have received new data from the API server
  if (data && data.personId && isSuccess === true) {
    let newDataReceived = false;
    const person = data;
    if (person && person.personId && person.personId >= 0) {
      if (!allPeopleCacheNew[person.personId]) {
        allPeopleCacheNew[person.personId] = person;
        newDataReceived = true;
      } else if (!isEqual(person, allPeopleCacheNew[person.personId])) {
        allPeopleCacheNew[person.personId] = person;
        newDataReceived = true;
      }
    }
    // console.log('person-retrieve setting allPeopleCacheNew:', allPeopleCacheNew, ', newDataReceived:', newDataReceived);
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

export const useGetPersonById = (personId) => {
  const { apiDataCache } = useConnectAppContext();
  const { allPeopleCache } = apiDataCache;
  // console.log('useGetPersonById personId:', personId, ', allPeopleCache:', allPeopleCache);
  if (allPeopleCache) {
    return allPeopleCache[personId] || {};
  } else {
    return {};
  }
};

// Needed to avoid Dependency cycle problem, and to get this string from within maps
export const getFullNamePreferredPerson = (person, firstNameOnly = false) => {
  let fullName = '';
  if (person.id >= 0) {
    if (person.firstNamePreferred) {
      fullName += person.firstNamePreferred;
    } else if (person.firstName) {
      fullName += person.firstName;
    }
    if (!firstNameOnly) {
      if (fullName.length > 0 && person.lastName) {
        fullName += ' ';
      }
      if (person.lastName) {
        fullName += person.lastName;
      }
    }
  }
  return fullName;
};

export const useGetFirstNamePreferred = (personId) => {
  const person = useGetPersonById(personId);
  return getFullNamePreferredPerson(person, true);
};

export const useGetFullNamePreferred = (personId) => {
  const person = useGetPersonById(personId);
  return getFullNamePreferredPerson(person);
};

export const getPreferredEmail = (person) => {
  let preferredEmail = '';
  if (person.id >= 0) {
    if (person.emailPreferred) {
      preferredEmail = person.emailPreferred;
    } else if (person.emailOfficial) {
      preferredEmail = person.emailOfficial;
    } else if (person.emailPersonal) {
      preferredEmail = person.emailPersonal;
    }
  }
  return preferredEmail;
};

export const usePersonSave = () => {
  // PLEASE DO NOT REMOVE
  // const { apiDataCache } = useConnectAppContext();
  // const dispatch = useConnectDispatch();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-save', params, METHOD.GET),
    // networkMode: 'always', // <- This is not a solution, it just covers up some problem in our code, while disabling the biggest benefit of ReactQueries. Send queries to the server even if the cache has the data
    onError: (error) => {
      console.log('onError in usePersonSave: ', error);
      queryClient.refetchQueries({ queryKey: ['person-list-retrieve'], refetchType: 'active', exact: true, force: true })
        .then(() => console.log('PersonModel API call error recovery refetch completed'))
        .catch((error2) => console.error('PersonModel API call refetch failed:', error2));
    },
    onSuccess: (results) => {
      // console.log('PersonModel person-save onSuccess true, results: ', results);

      // PLEASE DO NOT REMOVE
      // const { allPeopleCache } = apiDataCache;
      // const allPeopleCacheNew = { ...allPeopleCache };
      // console.log('useGetPersonById personId:', personId, ', allPeopleCacheNew:', allPeopleCacheNew);
      if (results.success === false) {
        console.log('usePersonSave onSuccess failed results:', results);
      } else if (results.personId >= 0) {
        // PLEASE DO NOT REMOVE
        // console.log('usePersonSave personId:', results.personId, ', results: ', results);
        // allPeopleCacheNew[results.personId] = results;
        // dispatch({ type: 'updateByKeyValue', key: 'allPeopleCache', value: allPeopleCacheNew });

        // setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['person-list-retrieve'], refetchType: 'active', exact: true, force: true })
          .then(() => console.log('PersonModel refetch completed'))
          .catch((error) => console.error('PersonModel refetch failed:', error));
        // }, 1000);  // 1 second delay
      } else {
        console.log('usePersonSave personId not >= 0:', results);
      }
    },
  });
};
