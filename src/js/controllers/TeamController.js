// TeamController.js
// Functions for manipulating data related to teams and team membership.

export const searchWordFoundInOneCohortTeam = (searchWord, isNotOnTeamCohort = false, isOfferDecisionNeededCohort = false) => {
  let found = false;
  let termsToSearch = [];
  if (isNotOnTeamCohort) {
    termsToSearch = ['cohort', 'not', 'on', 'team'];
  } else if (isOfferDecisionNeededCohort) {
    termsToSearch = ['cohort', 'connect', 'with', 'hiring', 'manager'];
  } else {
    termsToSearch = ['cohort', 'team'];
  }

  const normalizedSearchWord = searchWord.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  termsToSearch.forEach((fieldValue) => {
    const normalizedPersonFieldValue = fieldValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalizedPersonFieldValue.includes(normalizedSearchWord)) {
      found = true;
    }
  });
  return found;
};

export const searchWordFoundInOneTeam = (searchWord, team) => {
  const fieldsToSearch = ['description', 'teamName'];
  let found = false;

  const normalizedSearchWord = searchWord.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  fieldsToSearch.forEach((fieldValue) => {
    const teamFieldValue = team[fieldValue];
    if (teamFieldValue) {
      const normalizedPersonFieldValue = teamFieldValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalizedPersonFieldValue.includes(normalizedSearchWord)) {
        found = true;
      }
    }
  });
  return found;
};

export const isSearchTextFoundInCohortTeam = (incomingSearchText, isNotOnTeamCohort = false, isOfferDecisionNeededCohort = false) => {
  if (!incomingSearchText || (incomingSearchText && incomingSearchText.length === 0)) return true; // No searchText provided
  const searchWords = incomingSearchText.split(' ');
  let atLeastOneSearchWordFound = false;
  let allSearchWordsFound = true;
  let searchWordFound = false;
  searchWords.forEach((searchWord) => {
    searchWordFound = searchWordFoundInOneCohortTeam(searchWord, isNotOnTeamCohort, isOfferDecisionNeededCohort);
    if (searchWordFound) {
      atLeastOneSearchWordFound = true;
    }
    if (!searchWordFound) {
      allSearchWordsFound = false;
    }
  });
  return atLeastOneSearchWordFound && allSearchWordsFound;
};

export const isSearchTextFoundInTeam = (incomingSearchText, team) => {
  if (!team || team.teamId < 0) return false; // Invalid team or teamId
  if (!incomingSearchText || (incomingSearchText && incomingSearchText.length === 0)) return true; // No searchText provided
  const searchWords = incomingSearchText.split(' ');
  let atLeastOneSearchWordFound = false;
  let allSearchWordsFound = true;
  let searchWordFound = false;
  searchWords.forEach((searchWord) => {
    searchWordFound = searchWordFoundInOneTeam(searchWord, team);
    if (searchWordFound) {
      atLeastOneSearchWordFound = true;
    }
    if (!searchWordFound) {
      allSearchWordsFound = false;
    }
  });
  return atLeastOneSearchWordFound && allSearchWordsFound;
};
