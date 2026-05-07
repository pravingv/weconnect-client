// showPerson.js
import { TASK_TYPES } from '../constants/TaskTypeConstants';
import {
  isSearchTextFoundInPerson, onlyShowPersonWithPeopleFiltersExactMatch,
  onlyShowPersonWithPeopleFiltersLogicalOrMatch,
} from '../controllers/PersonController';
import { isSearchTextFoundInTask } from '../controllers/TaskController';


export const isPersonActive = (person) => {
  if (person.dateEndDate === null) {
    return true;
  }
  const endDate = new Date(person.dateEndDate);
  const nowDate = new Date();
  // console.log(`${person.firstName} ---  ${endDate < nowDate}  ${endDate} ${nowDate}`);
  return endDate > nowDate;
};

export const showPersonInCohortMemberList = (person, searchTextLocal) => {
  if (!person || person.id < 0) return false; // Invalid person or personId
  if (searchTextLocal) {
    const results = isSearchTextFoundInPerson(searchTextLocal, person);
    return results.allSearchWordsWereFound;
  } else {
    return true; // Show the person if no searchText is provided, or there are any other filters
  }
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
  } else if (person.statusActive === false) {   // Mar 2026, Allow people with null statusActive through
    // Only show people marked with statusActive = false when searching
    // Mar 2026: Hopefully we won't find null statusActive going forward, but treat these as true
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

export const showPersonInTaskList = (person, searchTextLocal, selectedTaskType, showCompletedTasks, taskDefinitionList, taskListByPersonId) => {
  if (!person || !person.personId < 0) return false; // Invalid person or personId
  const taskList = taskListByPersonId[person.personId] || [];
  let modifiedTaskList = [];
  if (searchTextLocal) {
    const personResults = isSearchTextFoundInPerson(searchTextLocal, person);
    const searchWordsFoundInPersonList = personResults.searchWordsFoundList;
    // console.log('=== searchWordsFoundInPersonList:', searchWordsFoundInPersonList);

    const allIncomingSearchWords = searchTextLocal.toLowerCase().split(/\s+/);
    // Filter out words found in person
    const searchWordsListMinusFoundInPersonList = allIncomingSearchWords.filter((word) => !searchWordsFoundInPersonList.includes(word.toLowerCase()));
    // Join the remaining words back into a string
    const searchTextMinusWordsFoundInPersonList = searchWordsListMinusFoundInPersonList.join(' ');
    let taskResults = {};
    const { allSearchWordsWereFound } = personResults;
    taskList.forEach((task) => {
      if (allSearchWordsWereFound) {
        // If search words found in person, don't bother limiting tasks by the search words
        if (showCompletedTasks || !task.statusDone) {
          modifiedTaskList.push(task);
        }
      } else if (showCompletedTasks || !task.statusDone) {
        if (searchWordsListMinusFoundInPersonList && searchWordsListMinusFoundInPersonList.length > 0) {
          taskResults = isSearchTextFoundInTask(searchTextMinusWordsFoundInPersonList, task, taskDefinitionList);
          if (taskResults.allSearchWordsWereFound) {
            modifiedTaskList.push(task);
          }
        }
      }
    });
    if (selectedTaskType !== TASK_TYPES.ALL_TASKS) {
      // Remove tasks that do not match the current filter, so we only show a person if they have tasks under the current filter
      modifiedTaskList = modifiedTaskList.filter((task) => task.taskType === selectedTaskType);
      // console.log('Removing if not selectedTaskType: ', selectedTaskType);
    }
    // if (allSearchWordsWereFound) {
    //   console.log('=== allSearchWordsWereFound:', person.firstName, person.lastName);
    // }
    // console.log('===== modifiedTaskList has items:', modifiedTaskList.length > 0);
    // console.log('===== allSearchWordsWereFoundInPerson:', allSearchWordsWereFoundInPerson, ', modifiedTaskList:', modifiedTaskList);
    // console.log('===== searchTextLocal: ', searchTextLocal, ', allIncomingSearchWords:', allIncomingSearchWords, ', searchWordsFoundInPersonList:', searchWordsFoundInPersonList, ', searchWordsListMinusFoundInPersonList:', searchWordsListMinusFoundInPersonList, ', searchTextMinusWordsFoundInPersonList:', searchTextMinusWordsFoundInPersonList);
    // console.log('===== searchTextMinusWordsFoundInPersonList:', searchTextMinusWordsFoundInPersonList);
    return {
      allSearchWordsWereFound,
      hideBecauseInactive: false,
      searchTextMinusWordsFoundInPersonList,
      tasksExistToShow: modifiedTaskList && modifiedTaskList.length > 0,
    };
  } else {
    // Show all people since no search text provided
    modifiedTaskList = (showCompletedTasks) ? taskList : taskList.filter((task) => !task.statusDone);
    // if (person.id === 575) {
    //   console.log('*** 575: person: ', person, ', selectedTaskType:', selectedTaskType, ', modifiedTaskList:', modifiedTaskList);
    // }
    // Do not show the person in task list if there aren't any tasks under the current filter
    if (selectedTaskType !== TASK_TYPES.ALL_TASKS) {
      // Remove tasks that do not match the current filter, so we only show a person if they have tasks under the current filter
      modifiedTaskList = modifiedTaskList.filter((task) => task.taskType === selectedTaskType);
    }
    return {
      allSearchWordsWereFound: false,
      hideBecauseInactive: !person.statusActive,
      searchTextMinusWordsFoundInPersonList: searchTextLocal,
      tasksExistToShow: modifiedTaskList && modifiedTaskList.length > 0,
    };
  }
};
