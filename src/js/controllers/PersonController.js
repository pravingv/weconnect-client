// PersonController.js
// Functions for manipulating data related to the person table.
import { PERSON_AWAY_REASONS } from '../models/PersonModel';
import webAppConfig from '../config';
import arrayContains from '../common/utils/arrayContains';

export const getPersonAwayReason = (personAway) => {
  let personAwayReasonFound = 'isVacation'; // Default to vacation if none of the other reasons are found
  PERSON_AWAY_REASONS.forEach((personAwayReason) => {
    if (personAway[personAwayReason] === true) {
      personAwayReasonFound = personAwayReason;
    }
  });
  return personAwayReasonFound;
};

export const getPersonAwayParamsToSave = (incomingPersonAwayReason) => {
  const paramsToReturn = {};
  PERSON_AWAY_REASONS.forEach((personAwayReason) => {
    paramsToReturn[personAwayReason] = personAwayReason === incomingPersonAwayReason;
  });
  return paramsToReturn;
};

export const getPersonAwayLabel = (personAwayReason) => {
  switch (personAwayReason) {
    case 'isLeaveOfAbsence':
      return 'Leave of Absence';
    case 'isNotFeelingWell':
      return 'Not feeling well';
    case 'isNonResponsive':
      return 'Has stopped responding to management contact';
    case 'isNotAttending':
      return 'Around, but cannot attend meetings';
    case 'isResigned':
      if (webAppConfig.ORGANIZATION_NAME) {
        return `Resigning from ${webAppConfig.ORGANIZATION_NAME}`;
      } else {
        return 'Resigning';
      }
    case 'isVacation':
      return 'Vacation';
    case 'isWorkTrip':
      return 'Work Trip';
    default:
      return personAwayReason;
  }
};

// Offer process steps:
// - Attended Intro to WeVote: statusOfferDecisionNeeded === true
// - Email sent to volunteer asking them to schedule meeting: statusOfferDecisionNeeded === false
// - Hiring manager likes, offer should be made: statusOfferApproved === true
// - Hiring manager does not approve, no offer: statusOfferWillNotBeMade === true
// - Offer letter sent: statusOfferLetterSent === true
// - Offer letter signed: statusOfferLetterSigned === true
// export const isInOfferProcess = (person) => ((person.statusOfferDecisionNeeded === true) || (person.statusOfferApproved === true)) && person.statusOfferWillNotBeMade !== true && person.statusOfferLetterSigned !== true;
export const isInOfferProcess = (person) => person.statusOfferWillNotBeMade !== true && person.statusOfferLetterSigned !== true;

export const searchWordFoundInOnePerson = (searchWord, person) => {
  const fieldsToSearch = [
    'birthdayMonthAndDay', 'bluesky', 'facebookUrl', 'githubUrl',
    'linkedInUrl', 'portfolioUrl', 'snapchat', 'twitch', 'twitterHandle',
    'websiteUrl', 'emailOfficial', 'emailPersonal',
    'firstName', 'firstNamePreferred', 'jobTitle', 'lastName',
    'location', 'stateCode', 'zipCode',
  ];
  let found = false;

  const normalizedSearchWord = searchWord.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  fieldsToSearch.forEach((fieldValue) => {
    const personFieldValue = person[fieldValue];
    // console.log('searchWordFoundInOnePerson, fieldValue: ', fieldValue, ', personFieldValue:', personFieldValue);
    if (personFieldValue) {
      const normalizedPersonFieldValue = personFieldValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalizedPersonFieldValue.includes(normalizedSearchWord)) {
        found = true;
      }
    }
  });
  return found;
};

export const onlyShowPersonWithPeopleFiltersExactMatch = (person, getAppContextValue) => {
  // "Only" option, where we only show people who match the exact filters
  let personIsVisible = false;
  if (getAppContextValue('isInternPeopleFilter') === true && person.isIntern === true) {
    personIsVisible = true;
  } else if (getAppContextValue('isHiringManagerPeopleFilter') === true && person.isHiringManager === true) {
    personIsVisible = true;
  } else if (getAppContextValue('isTeamLeadPeopleFilter') === true && person.isTeamLead === true) {
    personIsVisible = true;
  } else if (getAppContextValue('statusInOfferProcessPeopleFilter') === true && isInOfferProcess(person)) {
    personIsVisible = true;
  } else if (getAppContextValue('statusOnLeavePeopleFilter') === true && person.statusOnLeave === true) {
    personIsVisible = true;
  } else if (getAppContextValue('statusResignedPeopleFilter') === true && person.statusResigned === true) {
    personIsVisible = true;
  } else if (getAppContextValue('statusAvailableForSpecialProjectsPeopleFilter') === true && person.statusAvailableForSpecialProjects === true) {
    personIsVisible = true;
  }
  return personIsVisible;
};

export const onlyShowPersonWithPeopleFiltersLogicalOrMatch = (person, getAppContextValue) => {
  // "Include" option, where we show people who match any of the filters
  // Default is 'Active people' but we make people visible if the chosen filters below also match the person
  const inOfferProcess = isInOfferProcess(person);
  // console.log('onlyShowPersonWithPeopleFiltersLogicalOrMatch, person.lastName:', person.lastName, ', inOfferProcess:', inOfferProcess);
  let personIsVisible = person.statusActive === true && person.statusOfferLetterSigned === true && person.statusOnLeave !== true && person.statusResigned !== true && !inOfferProcess;
  if (getAppContextValue('statusOnLeavePeopleFilter') === true && person.statusOnLeave === true) {
    personIsVisible = true;
  }
  if (getAppContextValue('statusResignedPeopleFilter') === true && person.statusResigned === true) {
    personIsVisible = true;
  }
  if (getAppContextValue('statusInOfferProcessPeopleFilter') === true) {
    // If Resigned is not checked, do not show resigned people when 'In Offer Process' is selected
    if (inOfferProcess && getAppContextValue('statusResignedPeopleFilter') === true) {
      // No restrictions - show both
      personIsVisible = true;
    } else if (person.statusResigned !== true) {
      // If resigned, cannot be in offer process
      personIsVisible = true;
    }
  }
  return personIsVisible; // Show the person if no searchText is provided
};

export const isSearchTextFoundInPerson = (incomingSearchText, person) => {
  if (!person || person.personId < 0) return false; // Invalid person or personId
  if (!incomingSearchText || (incomingSearchText && incomingSearchText.length === 0)) return true; // No searchText provided
  const searchWords = incomingSearchText.split(' ');
  let atLeastOneSearchWordFound = false;
  let allSearchWordsFound = true;
  let searchWordFound = false;
  const searchWordsFoundList = [];
  // console.log('isSearchTextFoundInPerson BEFORE searchWords:', searchWords, ', person:', person);
  searchWords.forEach((searchWord) => {
    searchWordFound = searchWordFoundInOnePerson(searchWord, person);
    // console.log('isSearchTextFoundInPerson, searchWord: ', searchWord, ', searchWordFound:', searchWordFound);
    if (searchWordFound) {
      atLeastOneSearchWordFound = true;
      if (!arrayContains(searchWord, searchWordsFoundList)) {
        searchWordsFoundList.push(searchWord);
        // console.log('isSearchTextFoundInPerson FOUND, searchWord: ', searchWord, ', searchWordFound:', searchWordFound);
      }
    }
    if (!searchWordFound) {
      allSearchWordsFound = false;
    }
  });
  return {
    searchWordsFoundList,
    allSearchWordsWereFound: atLeastOneSearchWordFound && allSearchWordsFound,
  };
};
