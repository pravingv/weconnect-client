// TaskController.js
import arrayContains from '../common/utils/arrayContains';

export const searchWordFoundInOneTask = (searchWord, task, taskDefinitionList) => {
  const taskDefinitionFieldsToSearch = [
    'taskActionUrl', 'taskName', 'taskNameCompleted', 'taskWhatToDo', 'taskWhyWeDoIt',
  ];
  const taskFieldsToSearch = [
    'statusResolvedComment',
  ];
  let found = false;
  // console.log('=== *** TaskController searchWordFoundInOneTask task:', task);
  // console.log('=== *** taskDefinitionList:', taskDefinitionList);
  const taskDefinition = taskDefinitionList.find((taskDef) => taskDef.taskDefinitionId === task.taskDefinitionId) || {};
  // console.log('=== *** taskDefinition:', taskDefinition);

  const normalizedSearchWord = searchWord.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  taskDefinitionFieldsToSearch.forEach((fieldValue) => {
    const taskDefinitionFieldValue = taskDefinition[fieldValue];
    // console.log('* taskDefinitionFieldValue:', taskDefinitionFieldValue);
    if (taskDefinitionFieldValue) {
      const normalizedTaskDefinitionFieldValue = taskDefinitionFieldValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalizedTaskDefinitionFieldValue.includes(normalizedSearchWord)) {
        found = true;
        // console.log('** FOUND');
      }
    }
  });
  if (!found) {
    taskFieldsToSearch.forEach((fieldValue) => {
      const taskFieldValue = task[fieldValue];
      // console.log('* taskFieldValue:', taskFieldValue);
      if (taskFieldValue) {
        const normalizedTaskFieldValue = taskFieldValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalizedTaskFieldValue.includes(normalizedSearchWord)) {
          found = true;
          // console.log('** FOUND');
        }
      }
    });
  }
  return found;
};

export const isSearchTextFoundInTask = (incomingSearchText, task, taskDefinitionList) => {
  // console.log('***** TaskController isSearchTextFoundInTask taskDefinitionList:', taskDefinitionList);
  // console.log('**** incomingSearchText: ', incomingSearchText, ', task:', task);
  if (!task || !task.taskDefinitionId) return false; // Missing task
  if (!incomingSearchText || (incomingSearchText && incomingSearchText.length === 0)) return true; // No searchText provided
  const searchWords = incomingSearchText.split(' ');
  let atLeastOneSearchWordFound = false;
  let allSearchWordsFound = true;
  let searchWordFound = false;
  const searchWordsFoundList = [];
  searchWords.forEach((searchWord) => {
    searchWordFound = searchWordFoundInOneTask(searchWord, task, taskDefinitionList);
    if (searchWordFound) {
      atLeastOneSearchWordFound = true;
      if (!arrayContains(searchWord, searchWordsFoundList)) {
        searchWordsFoundList.push(searchWord);
      }
    }
    if (!searchWordFound) {
      allSearchWordsFound = false;
    }
  });
  // console.log('**** isSearchTextFoundInTask searchWordsFoundList:', searchWordsFoundList, ', allSearchWordsWereFound:', atLeastOneSearchWordFound && allSearchWordsFound);
  return {
    searchWordsFoundList,
    allSearchWordsWereFound: atLeastOneSearchWordFound && allSearchWordsFound,
  };
};
