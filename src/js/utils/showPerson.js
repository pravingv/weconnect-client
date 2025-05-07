import {
  isSearchTextFoundInPerson, onlyShowPersonWithPeopleFiltersExactMatch,
  onlyShowPersonWithPeopleFiltersLogicalOrMatch,
} from '../controllers/PersonController';


export const isPersonActive = (person) => {
  if (person.dateEndDate === null) {
    return true;
  }
  const endDate = new Date(person.dateEndDate);
  const nowDate = new Date();
  // console.log(`${person.firstName} ---  ${endDate < nowDate}  ${endDate} ${nowDate}`);
  return endDate > nowDate;
};

export const showPersonInMemberList = (person, searchTextLocal, getAppContextValue) => {
  if (!person || person.id < 0) return false; // Invalid person or personId
  const pigsCanFly = false;
  if (searchTextLocal) {
    const results = isSearchTextFoundInPerson(searchTextLocal, person);
    return results.allSearchWordsWereFound;
  } else if (pigsCanFly) {
    // Used for testing while developing
    return true;
  } else if (!person.statusActive) {
    // Only show people marked with statusActive = false when searching
    // Eventually weave in the ability to show as a "show" filter option
    return false;
  } else if (getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'LOGICAL_OR') {
    // "Include" option, where we show people who match any of the filters
    return onlyShowPersonWithPeopleFiltersLogicalOrMatch(person, getAppContextValue);
  } else if (getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH') {
    // "Only" option, where we only show people who match the exact filters
    return onlyShowPersonWithPeopleFiltersExactMatch(person, getAppContextValue);
  } else {
    return true; // Show the person if no searchText is provided, or there are any other filters
  }
};
