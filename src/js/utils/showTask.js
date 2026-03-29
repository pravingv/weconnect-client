// showTask.js
import { isSearchTextFoundInTask, isSearchTextFoundInTaskDefinition } from '../controllers/TaskController';

export const showTask = (task, searchText, taskDefinitionList) => {
  // console.log('=== *** showTask:', task, ', searchText:', searchText, ', taskDefinitionList:', taskDefinitionList);
  // if (!task || task.taskDefinitionId < 1) return false; // Invalid task or task.id
  if (searchText) {
    const results = isSearchTextFoundInTask(searchText, task, taskDefinitionList);
    return results.allSearchWordsWereFound;
  } else {
    return true; // Show the task if no searchText is provided
  }
};

export const showTaskDefinition = (searchText, taskDefinition) => {
  // console.log('=== *** showTask:', task, ', searchText:', searchText, ', taskDefinitionList:', taskDefinitionList);
  // if (!task || task.taskDefinitionId < 1) return false; // Invalid task or task.id
  if (searchText) {
    const results = isSearchTextFoundInTaskDefinition(searchText, taskDefinition);
    return results.allSearchWordsWereFound;
  } else {
    return true; // Show the task if no searchText is provided
  }
};
