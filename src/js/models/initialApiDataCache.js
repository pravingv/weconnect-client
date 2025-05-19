// Moved to a separate file that does not include ConnectAppContext.jsx to avoid a "Dependency cycle"
const initialApiDataCache = () => {
  // These are the "AppContextValues" (i.e., global state variables) used in the PersonModel
  // console.log('initialApiDataCache called');  // This is worth logging, to see if we are reinitializing the apiDataCache unintentionally
  const initialGlobalPersonVariables = {
    viewerAccessRights: {}, // This is a dictionary with what this person visiting the site can do
    allPeopleCache: {}, // This is a dictionary key: personId, value: person dict
    mostRecentPersonIdSaved: -1,
    mostRecentPersonSaved: {
      firstName: '',
      lastName: '',
      personId: '',
    },
    searchResults: [],
    teamViewerAccessRights: {}, // This is a dictionary key: personId, value/2nd key: teamId, value: dict with what this person can do on that team
  };

  // These are the "AppContextValues" (i.e., global state variables) used in the PersonModel
  const initialGlobalTaskVariables = {
    allTaskGroupsCache: {}, // This is a dictionary key: taskGroupId, value: TaskGroup dict
    allTaskDefinitionsCache: {}, // This is a dictionary key: taskDefinitionId, value: TaskDefinition dict
    allTaskDependenciesCache: {}, // This is a dictionary key: taskDependencyId, value: TaskDependency dict
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

  // These are the "AppContextValues" (i.e., global state variables) used in the TeamModel
  const initialGlobalTeamVariables = {
    allTeamsCache: {}, // This is a dictionary key: teamId, value: team dict
    allTeamMembersCache: {}, // This is a dictionary key: teamId, value: list of TeamMember table dictionaries
    mostRecentTeamIdSaved: -1,
    mostRecentTeamMemberIdSaved: -1,
    mostRecentTeamSaved: {
      teamName: '',
      teamId: '',
    },
  };

  return {
    ...initialGlobalPersonVariables,
    ...initialGlobalTaskVariables,
    ...initialGlobalTeamVariables,
  };
};

export default initialApiDataCache;
