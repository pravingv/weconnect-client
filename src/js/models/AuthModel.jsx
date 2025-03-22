// AuthModel.js
// Functions related to getting data from the apiDataCache, which stores data
// received from our API servers.
import isEqual from 'lodash-es/isEqual';


export const viewerCanSeeOrDo = (accessRightName, viewerAccessRights) => {
  if (!viewerAccessRights || !(accessRightName in viewerAccessRights)) {
    return false;
  }
  return viewerAccessRights[accessRightName] || false;
};

export const viewerCanSeeOrDoFromList = (accessRightNameList, viewerAccessRights) => {
  if (!viewerAccessRights) {
    return false;
  } else if (!accessRightNameList || accessRightNameList.length === 0) {
    return false;
  }
  return accessRightNameList.some((accessRightName) => viewerCanSeeOrDo(accessRightName, viewerAccessRights));
};

export const viewerCanSeeOrDoForThisTeam = (accessRightName, teamId = -1, teamAccessRights = {}) => {
  if (!accessRightName || !teamId || !teamAccessRights) {
    return false;
  }
  if (teamId > -1 && teamAccessRights && teamAccessRights[teamId] && teamAccessRights[teamId][accessRightName]) {
    return teamAccessRights[teamId][accessRightName] || false;
  }
  return false;
};

export function captureAccessRightsData (data = {}, isSuccess = false, apiDataCache = {}, dispatch) {
  const viewerTeamAccessRights = apiDataCache.viewerTeamAccessRights || {};
  const viewerAccessRights = apiDataCache.viewerAccessRights || {};
  let changeResults = {
    viewerAccessRights,
    viewerAccessRightsChanged: false,
    viewerTeamAccessRights,
    viewerTeamAccessRightsChanged: false,
  };
  let viewerAccessRightsNew = { ...viewerAccessRights };
  let viewerTeamAccessRightsNew = { ...viewerTeamAccessRights };
  // console.log('captureAccessRightsData data:', data);
  if (data && data.accessRights && isSuccess === true) {
    let newDataReceived = false;
    const { accessRights } = data;
    // Checking to make sure common access right exists so we know results were returned
    if (accessRights && !('canAddPerson' in accessRights)) {
      viewerAccessRightsNew = accessRights;
      newDataReceived = true;
    } else if (!isEqual(accessRights, viewerAccessRightsNew)) {
      viewerAccessRightsNew = accessRights;
      newDataReceived = true;
    }
    if (newDataReceived) {
      // console.log('=== captureAccessRightsData viewerAccessRightsNew:', viewerAccessRightsNew, ', newDataReceived:', newDataReceived);
      dispatch({ type: 'updateByKeyValue', key: 'viewerAccessRights', value: viewerAccessRightsNew });
      changeResults = {
        ...changeResults,
        viewerAccessRights: viewerAccessRightsNew,
        viewerAccessRightsChanged: true,
      };
    }
  }
  if (data && data.teamAccessRights && isSuccess === true) {
    let newDataReceived = false;
    const { teamAccessRights } = data;
    // Checking to make sure common access right exists so we know results were returned
    if (teamAccessRights && !('canEditPersonThisTeam' in teamAccessRights)) {
      viewerTeamAccessRightsNew = teamAccessRights;
      newDataReceived = true;
    } else if (!isEqual(teamAccessRights, viewerTeamAccessRightsNew)) {
      viewerTeamAccessRightsNew = teamAccessRights;
      newDataReceived = true;
    }
    if (newDataReceived) {
      // console.log('=== captureAccessRightsData viewerTeamAccessRightsNew:', viewerTeamAccessRightsNew, ', newDataReceived:', newDataReceived);
      dispatch({ type: 'updateByKeyValue', key: 'viewerTeamAccessRights', value: viewerTeamAccessRightsNew });
      changeResults = {
        ...changeResults,
        viewerTeamAccessRights: viewerTeamAccessRightsNew,
        viewerTeamAccessRightsChanged: true,
      };
    }
  }
  return changeResults;
}
