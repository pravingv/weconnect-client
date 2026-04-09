// showTeam.js

import { isSearchTextFoundInCohortTeam, isSearchTextFoundInTeam } from '../controllers/TeamController';
import { showPersonInCohortMemberList } from './showPerson';

export const showTeam = (team, searchText, getAppContextValue) => {
  if (!team || team.teamId < 0) return false; // Invalid person or personId
  const onlyFiltersSelected = getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH';
  // console.log('onlyFiltersSelected: ', onlyFiltersSelected);
  const numberOfTeamMembersFoundDict = getAppContextValue('numberOfTeamMembersFoundDict');
  if (!numberOfTeamMembersFoundDict) return false; // No data yet
  try {
    const teamMembersFound = numberOfTeamMembersFoundDict[team.teamId] && numberOfTeamMembersFoundDict[team.teamId] > 0;
    // console.log('showTeam, team.teamId: ', team.teamId, ', team.teamName: ', team.teamName, ', teamMembersFound: ', teamMembersFound);
    if (searchText) {
      // If the team has any members matching searchText, or team itself matches searchText, show it
      // console.log('searchText: ', searchText, ', team.teamName: ', team.teamName);
      return !!(teamMembersFound) || isSearchTextFoundInTeam(searchText, team);
    } else if (onlyFiltersSelected) {
      return !!(teamMembersFound);
    } else {
      return true; // Show the team if no searchText is provided
    }
  } catch (error) {
    console.error('Error in showTeam:', error);
    return false;
  }
};

export const cohortTeamMemberFound = (searchText, cohortMemberList) => {
  try {
    if (searchText && Array.isArray(cohortMemberList)) {
      return cohortMemberList.some((person) => showPersonInCohortMemberList(person, searchText));
    } else {
      return true;
    }
  } catch (error) {
    console.error('Error in showCohortTeam:', error);
    return false;
  }
};

export const showCohortTeam = (searchText, cohortMemberList, isNotOnTeamCohort = false, isOfferDecisionNeededCohort = false) => {
  if (searchText) {
    return (cohortTeamMemberFound(searchText, cohortMemberList) || isSearchTextFoundInCohortTeam(searchText, isNotOnTeamCohort, isOfferDecisionNeededCohort));
  } else {
    return true; // Show the cohort if no searchText is provided
  }
};
