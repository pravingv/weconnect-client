import isEqual from 'lodash-es/isEqual';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import weConnectQueryFn from '../react-query/WeConnectQuery';
// import { useConnectAppContext } from '../contexts/ConnectAppContext';

export function getInitialGlobalTaskVariables () {
  return {
    allTaskGroupsCache: {}, // This is a dictionary key: taskGroupId, value: TaskGroup dict
    allTaskGroupTeamLinksCache: {}, // This is a dictionary key: taskGroupId, value: list of TaskGroupTeamLink entries
    allTaskDefinitionsCache: {}, // This is a dictionary key: taskDefinitionId, value: TaskDefinition dict
    allTaskDependenciesCache: {}, // This is a dictionary key: taskDependencyId, value: TaskDependency dict
    allTasksByDefinitionIdCache: {}, // This is a dictionary key: taskDefinitionId, value: list of Task dicts
    allTasksCache: {}, // This is a dictionary key: personId, value: another dictionary key: taskDefinitionId, value: Task dict
    mostRecentTaskDefinitionIdSaved: -1,
    mostRecentTaskDefinitionSaved: {
      taskDefinitionId: -1,
    },
    mostRecentTaskGroupIdSaved: -1,
    mostRecentTaskGroupSaved: {
      firstName: '',
      lastName: '',
      taskDefinitionId: -1,
    },
    taskDefinitionsCompletedPersonIdList: {}, // This is a dictionary key: taskDefinitionId, value: list of personIds who have completed the TaskDefinition
    taskGroupCompletedByPersonList: {}, // This is a dictionary key: taskGroupId, value: list of personIds who have completed the TaskGroup
    searchResults: [],
  };
}

// This is called after making this fetchData request:
// const taskStatusListRetrieveResults = useFetchData(['task-definition-list-retrieve'], {});
export function captureTaskDefinitionListRetrieveData (
  incomingRetrieveResults = {},
  apiDataCache = {},
  dispatch,
) {
  const { data, isSuccess } = incomingRetrieveResults;
  const allTaskDefinitionsCache = apiDataCache.allTaskDefinitionsCache || {};
  const changeResults = {
    allTaskDefinitionsCache,
    allTaskDefinitionsCacheChanged: false,
  };
  const allTaskDefinitionsCacheNew = { ...allTaskDefinitionsCache };
  let newTaskDefinitionListDataReceived = false;
  if (data && data.taskDefinitionList && isSuccess === true) {
    data.taskDefinitionList.forEach((taskDefinition) => {
      if (taskDefinition && taskDefinition.taskDefinitionId && taskDefinition.taskDefinitionId >= 0) {
        if (!allTaskDefinitionsCacheNew[taskDefinition.taskDefinitionId]) {
          allTaskDefinitionsCacheNew[taskDefinition.taskDefinitionId] = taskDefinition;
          newTaskDefinitionListDataReceived = true;
        } else if (!isEqual(taskDefinition, allTaskDefinitionsCacheNew[taskDefinition.taskDefinitionId])) {
          allTaskDefinitionsCacheNew[taskDefinition.taskDefinitionId] = taskDefinition;
          newTaskDefinitionListDataReceived = true;
        }
      }
    });
  }
  if (newTaskDefinitionListDataReceived) {
    // console.log('TaskStatusListRetrieve setting allTaskDefinitionsCacheNew:', allTaskDefinitionsCacheNew);
    dispatch({ type: 'updateByKeyValue', key: 'allTaskDefinitionsCache', value: allTaskDefinitionsCacheNew });
    changeResults.allTaskDefinitionsCache = allTaskDefinitionsCacheNew;
    changeResults.allTaskDefinitionsCacheChanged = true;
  }
  return changeResults;
}

// This is called after making this fetchData request:
// const taskGroupTeamLinkListRetrieveResults = useFetchData(['task-group-team-link-list-retrieve'], {});
export function captureTaskGroupTeamLinkListRetrieveData (
  incomingRetrieveResults = {},
  apiDataCache = {},
  dispatch,
) {
  const { data, isSuccess } = incomingRetrieveResults;
  const allTaskGroupTeamLinksCache = apiDataCache.allTaskGroupTeamLinksCache || {};
  const changeResults = {
    allTaskGroupTeamLinksCache,
    allTaskGroupTeamLinksCacheChanged: false,
  };
  // Start with empty dict. Otherwise we will keep deleted links in place.
  const allTaskGroupTeamLinksCacheNew = {};
  let newTaskGroupTeamLinkListDataReceived = false;
  if (data && data.taskGroupTeamLinkList && isSuccess === true) {
    newTaskGroupTeamLinkListDataReceived = true;
    data.taskGroupTeamLinkList.forEach((taskGroupTeamLink) => {
      if (taskGroupTeamLink && taskGroupTeamLink.taskGroupId && taskGroupTeamLink.taskGroupId >= 0) {
        if (!allTaskGroupTeamLinksCacheNew[taskGroupTeamLink.taskGroupId]) {
          allTaskGroupTeamLinksCacheNew[taskGroupTeamLink.taskGroupId] = [];
        }
        allTaskGroupTeamLinksCacheNew[taskGroupTeamLink.taskGroupId].push(taskGroupTeamLink);
      }
    });
  }
  const twoDictionariesAreIdentical = isEqual(allTaskGroupTeamLinksCache, allTaskGroupTeamLinksCacheNew);
  if (newTaskGroupTeamLinkListDataReceived && !twoDictionariesAreIdentical) {
    // console.log('taskGroupTeamLinkListRetrieve setting allTaskGroupTeamLinksCache:', allTaskGroupTeamLinksCacheNew);
    dispatch({ type: 'updateByKeyValue', key: 'allTaskGroupTeamLinksCache', value: allTaskGroupTeamLinksCacheNew });
    changeResults.allTaskGroupTeamLinksCache = allTaskGroupTeamLinksCacheNew;
    changeResults.allTaskGroupTeamLinksCacheChanged = true;
  }
  return changeResults;
}

// This is called after making this fetchData request:
// const taskStatusListRetrieveResults = useFetchData(['task-group-list-retrieve'], {});
export function captureTaskGroupListRetrieveData (
  incomingRetrieveResults = {},
  apiDataCache = {},
  dispatch,
) {
  const { data, isSuccess } = incomingRetrieveResults;
  const allTaskGroupsCache = apiDataCache.allTaskGroupsCache || {};
  const changeResults = {
    allTaskGroupsCache,
    allTaskGroupsCacheChanged: false,
  };
  const allTaskGroupsCacheNew = { ...allTaskGroupsCache };
  let newTaskGroupListDataReceived = false;
  if (data && data.taskGroupList && isSuccess === true) {
    data.taskGroupList.forEach((taskGroup) => {
      if (taskGroup && taskGroup.taskGroupId && taskGroup.taskGroupId >= 0) {
        if (!allTaskGroupsCacheNew[taskGroup.taskGroupId]) {
          allTaskGroupsCacheNew[taskGroup.taskGroupId] = taskGroup;
          newTaskGroupListDataReceived = true;
        } else if (!isEqual(taskGroup, allTaskGroupsCacheNew[taskGroup.taskGroupId])) {
          allTaskGroupsCacheNew[taskGroup.taskGroupId] = taskGroup;
          newTaskGroupListDataReceived = true;
        }
      }
    });
  }
  if (newTaskGroupListDataReceived) {
    // console.log('TaskStatusListRetrieve setting allTaskGroupsCacheNew:', allTaskGroupsCacheNew);
    dispatch({ type: 'updateByKeyValue', key: 'allTaskGroupsCache', value: allTaskGroupsCacheNew });
    changeResults.allTaskGroupsCache = allTaskGroupsCacheNew;
    changeResults.allTaskGroupsCacheChanged = true;
  }
  return changeResults;
}

// This is called after making this fetchData request:
// const taskStatusListRetrieveResults = useFetchData(['task-status-list-retrieve'], { personIdList: personIdsList }, METHOD.POST);
// TODO: Dale still thinking about this. Please leave this commented out code until April 2025
export function captureTaskStatusListRetrieveData (
  incomingRetrieveResults = {},
  apiDataCache = {},
  dispatch,
) {
  const { data, isSuccess } = incomingRetrieveResults;
  // const allTaskDefinitionsCache = apiDataCache.allTaskDefinitionsCache || {};
  // const allTaskDependenciesCache = apiDataCache.allTaskDependenciesCache || {};
  // const allTaskGroupsCache = apiDataCache.allTaskGroupsCache || {};
  const allTasksByDefinitionIdCache = apiDataCache.allTasksByDefinitionIdCache || {};
  const allTasksCache = apiDataCache.allTasksCache || {};
  const changeResults = {
    // allTaskDefinitionsCache,
    // allTaskDefinitionsCacheChanged: false,
    // allTaskDependenciesCache,
    // allTaskDependenciesCacheChanged: false,
    // allTaskGroupsCache,
    // allTaskGroupsCacheChanged: false,
    allTasksByDefinitionIdCache,
    allTasksByDefinitionIdCacheChanged: false,
    allTasksCache,
    allTasksCacheChanged: false,
  };
  // const allTaskDefinitionsCacheNew = { ...allTaskDefinitionsCache };
  // const allTaskDependenciesCacheNew = { ...allTaskDependenciesCache };
  // const allTaskGroupsCacheNew = { ...allTaskGroupsCache };
  const allTasksByDefinitionIdCacheNew = { ...allTasksByDefinitionIdCache };
  const allTasksCacheNew = { ...allTasksCache };
  // let newTaskDefinitionListDataReceived = false;
  // if (data && data.taskDefinitionList && isSuccess === true) {
  //   data.taskDefinitionList.forEach((taskDefinition) => {
  //     if (taskDefinition && taskDefinition.taskDefinitionId && taskDefinition.taskDefinitionId >= 0) {
  //       if (!allTaskDefinitionsCacheNew[taskDefinition.taskDefinitionId]) {
  //         allTaskDefinitionsCacheNew[taskDefinition.taskDefinitionId] = taskDefinition;
  //         newTaskDefinitionListDataReceived = true;
  //       } else if (!isEqual(taskDefinition, allTaskDefinitionsCacheNew[taskDefinition.taskDefinitionId])) {
  //         allTaskDefinitionsCacheNew[taskDefinition.taskDefinitionId] = taskDefinition;
  //         newTaskDefinitionListDataReceived = true;
  //       }
  //     }
  //   });
  // }
  // let newTaskDependenciesListDataReceived = false;
  // TODO TaskDependencies API processing when data available
  // let newTaskGroupListDataReceived = false;
  // if (data && data.taskGroupList && isSuccess === true) {
  //   data.taskGroupList.forEach((taskGroup) => {
  //     if (taskGroup && taskGroup.taskGroupId && taskGroup.taskGroupId >= 0) {
  //       if (!allTaskGroupsCacheNew[taskGroup.taskGroupId]) {
  //         allTaskGroupsCacheNew[taskGroup.taskGroupId] = taskGroup;
  //         newTaskGroupListDataReceived = true;
  //       } else if (!isEqual(taskGroup, allTaskGroupsCacheNew[taskGroup.taskGroupId])) {
  //         allTaskGroupsCacheNew[taskGroup.taskGroupId] = taskGroup;
  //         newTaskGroupListDataReceived = true;
  //       }
  //     }
  //   });
  // }
  let newTaskListByDefinitionIdDataReceived = false;
  if (data && data.taskList && isSuccess === true) {
    data.taskList.forEach((task) => {
      if (task && task.taskDefinitionId && task.taskDefinitionId >= 0) {
        if (!allTasksByDefinitionIdCacheNew[task.taskDefinitionId]) {
          allTasksByDefinitionIdCacheNew[task.taskDefinitionId] = [];
        }
        const existingTaskIndex = allTasksByDefinitionIdCacheNew[task.taskDefinitionId].findIndex(
          (existingTask) => existingTask.personId === task.personId && existingTask.taskDefinitionId === task.taskDefinitionId);

        if (existingTaskIndex === -1) {
          // Task doesn't exist, so add it
          allTasksByDefinitionIdCacheNew[task.taskDefinitionId].push(task);
          newTaskListByDefinitionIdDataReceived = true;
        } else if (!isEqual(allTasksByDefinitionIdCacheNew[task.taskDefinitionId][existingTaskIndex], task)) {
          // Task exists, update it if it's different
          allTasksByDefinitionIdCacheNew[task.taskDefinitionId][existingTaskIndex] = task;
          newTaskListByDefinitionIdDataReceived = true;
        }
      }
    });
  }
  let newTaskListDataReceived = false;
  if (data && data.taskList && isSuccess === true) {
    data.taskList.forEach((task) => {
      if (task && task.personId && task.personId >= 0 && task.taskDefinitionId && task.taskDefinitionId >= 0) {
        if (!allTasksCacheNew[task.personId]) {
          allTasksCacheNew[task.personId] = {};
        }
        if (!allTasksCacheNew[task.personId][task.taskDefinitionId]) {
          allTasksCacheNew[task.personId][task.taskDefinitionId] = task;
          newTaskListDataReceived = true;
        } else if (!isEqual(task, allTasksCacheNew[task.personId][task.taskDefinitionId])) {
          allTasksCacheNew[task.personId][task.taskDefinitionId] = task;
          newTaskListDataReceived = true;
        }
      }
    });
  }
  // if (newTaskDefinitionListDataReceived) {
  //   // console.log('TaskStatusListRetrieve setting allTaskDefinitionsCacheNew:', allTaskDefinitionsCacheNew);
  //   dispatch({ type: 'updateByKeyValue', key: 'allTaskDefinitionsCache', value: allTaskDefinitionsCacheNew });
  //   changeResults.allTaskDefinitionsCache = allTaskDefinitionsCacheNew;
  //   changeResults.allTaskDefinitionsCacheChanged = true;
  // }
  // if (newTaskDependenciesListDataReceived) {
  //   // console.log('TaskStatusListRetrieve setting allTaskDependenciesCacheNew:', allTaskDependenciesCacheNew);
  //   dispatch({ type: 'updateByKeyValue', key: 'allTaskDependenciesCache', value: allTaskDependenciesCacheNew });
  //   changeResults.allTaskDependenciesCache = allTaskDependenciesCacheNew;
  //   changeResults.allTaskDependenciesCacheChanged = true;
  // }
  if (newTaskListByDefinitionIdDataReceived) {
    // console.log('TaskStatusListRetrieve setting allTasksByDefinitionIdCacheNew:', allTasksByDefinitionIdCacheNew);
    dispatch({ type: 'updateByKeyValue', key: 'allTasksByDefinitionIdCache', value: allTasksByDefinitionIdCacheNew });
    changeResults.allTasksByDefinitionIdCache = allTasksByDefinitionIdCacheNew;
    changeResults.allTasksByDefinitionIdCacheChanged = true;
  }
  if (newTaskListDataReceived) {
    // console.log('TaskStatusListRetrieve setting allTasksCacheNew:', allTasksCacheNew);
    dispatch({ type: 'updateByKeyValue', key: 'allTasksCache', value: allTasksCacheNew });
    changeResults.allTasksCache = allTasksCacheNew;
    changeResults.allTasksCacheChanged = true;
  }
  // if (newTaskGroupListDataReceived) {
  //   // console.log('TaskStatusListRetrieve setting allTaskGroupsCacheNew:', allTaskGroupsCacheNew);
  //   dispatch({ type: 'updateByKeyValue', key: 'allTaskGroupsCache', value: allTaskGroupsCacheNew });
  //   changeResults.allTaskGroupsCache = allTaskGroupsCacheNew;
  //   changeResults.allTaskGroupsCacheChanged = true;
  // }
  return changeResults;
}

// TODO Update to task-definition-save
// export function TaskDefinitionSave () {
//   // Transferred from react-query/mutation.jsx to test a new approach
//   const { getAppContextValue, setAppContextValue } = useConnectAppContext();
//   const queryClient = useQueryClient();
//
//   // We want to add to onSuccess below a function that stores in the Context the person data which was stored on the API server
//   return useMutation({
//     mutationFn: (params) => weConnectQueryFn('person-save', params),
//     onError: (error) => console.log('error in personSaveMutation: ', error),
//     onSuccess: (results) => {
//       // Update the cached people with the new/changed person data, stored in allPeopleCache
//       // console.log('person-save onSuccess true, results: ', results);
//       const allPeopleCache = getAppContextValue('allPeopleCache');
//       if (results.personId >= 0) {
//         allPeopleCache[results.personId] = results;
//         setAppContextValue('allPeopleCache', allPeopleCache);
//       }
//       // And now invalidate other queries that pulled in this data
//       queryClient.invalidateQueries('person-list-retrieve');
//       queryClient.invalidateQueries('team-list-retrieve');
//     },
//   });
// }
