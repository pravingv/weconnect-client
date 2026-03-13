// TeamModel.js
// Functions related to getting data from the apiDataCache, which stores data
// received from our API servers.
import isEqual from 'lodash-es/isEqual';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import weConnectQueryFn from '../react-query/WeConnectQuery';
import { useConnectAppContext } from '../contexts/ConnectAppContext';
import arrayContains from '../common/utils/arrayContains';

export const useGetTeamById = (teamId) => {
  const { apiDataCache } = useConnectAppContext();
  const { allTeamsCache } = apiDataCache;
  // console.log('useGetTeamById teamId:', teamId, ', allTeamsCache:', allTeamsCache);
  // console.log('||||||| useGetTeamById teamId:', teamId, ', allTeamsCache[2].teamName:', allTeamsCache && allTeamsCache && allTeamsCache[2].teamName);

  if (allTeamsCache) {
    return allTeamsCache[teamId] || {};
  } else {
    return {};
  }
};

export const getTeamMemberEntryByPersonIdAndTeamId = (personId, teamId, apiDataCache) => {
  const { allTeamMembersCache } = apiDataCache;
  if (!allTeamMembersCache || !allTeamMembersCache[teamId]) {
    return undefined;
  }
  return allTeamMembersCache[teamId].find((teamMember) => teamMember.personId === personId);
};

export const getTeamMemberListByTeamId = (teamId, apiDataCache) => {
  const { allTeamMembersCache } = apiDataCache;
  if (!allTeamMembersCache || !allTeamMembersCache[teamId]) {
    return [];
  }
  return allTeamMembersCache[teamId];
};

export const getTeamMemberPersonListByTeamId = (teamId, apiDataCache) => {
  const { allPeopleCache, allTeamMembersCache } = apiDataCache;
  if (!allTeamMembersCache || !allTeamMembersCache[teamId]) {
    return [];
  }
  const teamMemberPersonIdsSet = new Set(
    Object.values(allTeamMembersCache[teamId])
      .flat()
      .map((teamMember) => teamMember.personId));
  // const personIds = allTeamMembersCache[teamId];
  const teamMemberPersonIds = Array.from(teamMemberPersonIdsSet);
  const teamMemberPersonList = teamMemberPersonIds.map((personId) => allPeopleCache[personId] || null).filter(Boolean);
  const teamMemberPersonListSorted = teamMemberPersonList.sort((a, b) => {
    // Check if dateStartDate is empty or null
    if (!a.dateStartDate && !b.dateStartDate) return 0; // Both empty, maintain original order
    if (!a.dateStartDate) return 1; // a should come after b
    if (!b.dateStartDate) return -1; // b should come after a

    const dateA = new Date(a.dateStartDate);
    const dateB = new Date(b.dateStartDate);
    return dateA - dateB; // ascending order (oldest first)
  });
  // Add sort to put team leads at top of list
  return teamMemberPersonListSorted;
};

// This is called following:
// const teamListRetrieveResults = useFetchData(['team-list-retrieve'], {});
export function captureTeamListRetrieveData (
  incomingRetrieveResults = {},
  apiDataCache = {},
  dispatch,
) {
  // console.log('||||||| captureTeamListRetrieveData should be called after useFetchData([\'team-list-retrieve\'], {})')
  const { data, isSuccess } = incomingRetrieveResults;
  const allPeopleTeamIdLists = apiDataCache.allPeopleTeamIdLists || {};
  const allTeamMembersCache = apiDataCache.allTeamMembersCache || {};
  const allTeamsCache = apiDataCache.allTeamsCache || {};
  // console.log('TeamListRetrieve data: ', data, ', isFetching:', isFetching, ', isSuccess:', isSuccess);
  const changeResults = {
    allPeopleTeamIdLists,
    allPeopleTeamIdListsChanged: false,
    allTeamMembersCache,
    allTeamMembersCacheChanged: false,
    allTeamsCache,
    allTeamsCacheChanged: false,
  };
  const allPeopleTeamIdListsNew = { ...allPeopleTeamIdLists };
  const allTeamMembersCacheNew = { ...allTeamMembersCache };
  const allTeamsCacheNew = { ...allTeamsCache };
  if (data && data.teamList && isSuccess === true) {
    let newPeopleTeamIdDataReceived = false;
    let newTeamDataReceived = false;
    let teamTrimmed;
    let newTeamMemberDataReceived = false;
    const teamMemberListOfPersonIdsAtStart = [];

    data.teamList.forEach((team) => {
      if (team && team.teamId && team.teamId >= 0) {
        teamTrimmed = { ...team };
        teamTrimmed.id = teamTrimmed.teamId;
        delete teamTrimmed.teamMemberInfoList;
        delete teamTrimmed.teamMemberList;
        if (!allTeamsCacheNew[teamTrimmed.teamId]) {
          allTeamsCacheNew[teamTrimmed.teamId] = teamTrimmed;
          newTeamDataReceived = true;
        } else if (!isEqual(teamTrimmed, allTeamsCacheNew[teamTrimmed.teamId])) {
          allTeamsCacheNew[teamTrimmed.teamId] = teamTrimmed;
          newTeamDataReceived = true;
        }
      }
      if (team && team.teamMemberInfoList) {
        if (!allTeamMembersCacheNew[team.teamId]) {
          allTeamMembersCacheNew[team.teamId] = [];
        }
        // Reset this list, so we can see if any former team members have been removed
        if (allTeamMembersCacheNew) {
          const allTeamMembersAsList = Object.values(allTeamMembersCacheNew[team.teamId]);
          // console.log('allTeamMembersAsList:', allTeamMembersAsList);
          allTeamMembersAsList.forEach((teamMember) => {
            if (teamMember && teamMember.personId >= 0 && !arrayContains(teamMember.personId, teamMemberListOfPersonIdsAtStart)) {
              teamMemberListOfPersonIdsAtStart.push(teamMember.personId);
            }
          });
        }
        // console.log('teamMemberListOfPersonIdsAtStart:', teamMemberListOfPersonIdsAtStart);
        team.teamMemberInfoList.forEach((teamMember) => {
          if (teamMember && teamMember.personId && teamMember.personId >= 0) {
            // Capture for each person, which teams they are in
            if (!allPeopleTeamIdListsNew[teamMember.personId]) {
              allPeopleTeamIdListsNew[teamMember.personId] = [];
            }
            if (!allPeopleTeamIdListsNew[teamMember.personId].includes(team.teamId)) {
              allPeopleTeamIdListsNew[teamMember.personId].push(team.teamId);
              newPeopleTeamIdDataReceived = true;
            }
            // Capture which team this person is in
            if (!allTeamMembersCacheNew[team.teamId].some((oneTeamMember) => oneTeamMember.personId === teamMember.personId)) {
              allTeamMembersCacheNew[team.teamId].push(teamMember);
              newTeamMemberDataReceived = true;
            }
            // Remove the person from the list of team members in the cache so we know if anyone has been removed
            if (teamMemberListOfPersonIdsAtStart && teamMemberListOfPersonIdsAtStart.includes(teamMember.personId)) {
              try {
                const index = teamMemberListOfPersonIdsAtStart.indexOf(teamMember.personId);
                teamMemberListOfPersonIdsAtStart.splice(index, 1);
              } catch (error) {
                console.error('Error removing team member from teamMemberListOfPersonIdsAtStart:', error);
              }
            }
          }
        });
        if (teamMemberListOfPersonIdsAtStart && teamMemberListOfPersonIdsAtStart.length > 0) {
          // We need to remove these people from the cache as they have been removed from the team
          // console.log('+++ team members leftover in teamMemberListOfPersonIdsAtStart');
          allTeamMembersCacheNew[team.teamId] = allTeamMembersCacheNew[team.teamId].filter(
            (teamMemberDict) => !teamMemberListOfPersonIdsAtStart.includes(teamMemberDict.personId),
          );
          newTeamMemberDataReceived = true;
        }
      }
    });
    if (newPeopleTeamIdDataReceived) {
      // console.log('newPeopleTeamIdDataReceived, dispatching allPeopleTeamIdLists');
      dispatch({ type: 'updateByKeyValue', key: 'allPeopleTeamIdLists', value: allPeopleTeamIdListsNew });
      changeResults.allPeopleTeamIdLists = allPeopleTeamIdListsNew;
      changeResults.allPeopleTeamIdListsChanged = true;
    }
    if (newTeamMemberDataReceived) {
      // console.log('newTeamMemberDataReceived, dispatching allTeamMembersCache');
      dispatch({ type: 'updateByKeyValue', key: 'allTeamMembersCache', value: allTeamMembersCacheNew });
      changeResults.allTeamMembersCache = allTeamMembersCacheNew;
      changeResults.allTeamMembersCacheChanged = true;
    }
    if (newTeamDataReceived) {
      dispatch({ type: 'updateByKeyValue', key: 'allTeamsCache', value: allTeamsCacheNew });
      changeResults.allTeamsCache = allTeamsCacheNew;
      changeResults.allTeamsCacheChanged = true;
    }
  }
  return changeResults;
}

// 2/6/24 Doesn't work and previously used the same function name as the working one in mutations.js
export const useRemoveTeamMemberMutationDiverged = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('remove-person-from-team', params),
    // networkMode: 'always', // <-- This is not a solution, it just covers up some problem in our code, while disabling the biggest benefit of ReactQueries.  Send queries to the server even if the cache has the data
    onError: (error) => {
      console.log('onError in useRemoveTeamMemberMutation: ', error);
      queryClient.refetchQueries({ queryKey: ['team-list-retrieve'], refetchType: 'active', exact: true, force: true })
        .then(() => console.log('TeamModel team-list-retrieve API call error recovery refetch completed'))
        .catch((error2) => console.error('TeamModel team-list-retrieve API call refetch failed:', error2));
    },
    onSuccess: (results) => {
      // console.log('team-list-retrieve onSuccess true, results: ', results);
      if (results.success === false) {
        console.log('useRemoveTeamMemberMutation onSuccess failed results:', results);
      } else {
        queryClient.refetchQueries({ queryKey: ['team-list-retrieve'], refetchType: 'active', exact: true, force: true })
          .then(() => console.log('TeamModel team-list-retrieve refetch completed'))
          .catch((error) => console.error('TeamModel team-list-retrieve refetch failed:', error));
      }
    },
  });
};
