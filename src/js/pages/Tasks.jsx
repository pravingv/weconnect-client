import { withStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { renderLog } from '../common/utils/logging';
import PersonSummaryHeader from '../components/Person/PersonSummaryHeader';
import PersonSummaryRow from '../components/Person/PersonSummaryRow';
import { PageContentContainer } from '../components/Style/pageLayoutStyles';
import TaskListForPerson from '../components/Task/TaskListForPerson';
import webAppConfig from '../config';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import capturePersonListRetrieveData from '../models/capturePersonListRetrieveData';
import {
  captureTaskDefinitionListRetrieveData, captureTaskGroupListRetrieveData, captureTaskStatusListRetrieveData,
} from '../models/TaskModel';
import { captureTeamListRetrieveData } from '../models/TeamModel';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';
import { showPersonInTaskList } from '../utils/showPerson';
import { alphabetizePeoplesObject } from '../utils/utilities';
import { showTaskDefinition } from '../utils/showTask';
import TaskSummaryRow from '../components/Task/TaskSummaryRow';
import convertToInteger from '../common/utils/convertToInteger';
import { TASK_TYPE_LIST, TASK_TYPES } from '../constants/TaskTypeConstants';
import useRedirectToLoginIfLoggedOut from '../utils/useRedirectToLoginIfLoggedOut';
import useMenu from '../utils/useMenu';


const Tasks = () => {
  renderLog('Tasks');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTaskDefinitionsCache, allTasksByDefinitionIdCache, allTasksCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [hideAllTasks, setHideAllTasks] = useState(getAppContextValue('tasksActionBarHideAllTasks'));
  const { handleMenuOpen, renderMenu } = useMenu();
  const [personIdsList, setPersonIdsList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPersonList, setSelectedPersonList] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState(TASK_TYPES.HR_ONBOARDING);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showTasksByTask, setShowTasksByTask] = useState(false);
  const [taskListByPersonId, setTaskListByPersonId] = useState({});
  const [taskDefinitionList, setTaskDefinitionList] = useState([]);


  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);

  useEffect(() => {
    if (personListRetrieveResults) {
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personListRetrieveResults, allPeopleCache, dispatch]);

  const taskDefinitionListRetrieveResults = useFetchData(['task-definition-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (taskDefinitionListRetrieveResults) {
      captureTaskDefinitionListRetrieveData(taskDefinitionListRetrieveResults, apiDataCache, dispatch);
    }
  }, [apiDataCache, dispatch, taskDefinitionListRetrieveResults]);

  const taskGroupListRetrieveResults = useFetchData(['task-group-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    // console.log('Tasks taskGroupListRetrieveResults');
    if (taskGroupListRetrieveResults) {
      captureTaskGroupListRetrieveData(taskGroupListRetrieveResults, apiDataCache, dispatch);
    }
  }, [apiDataCache, dispatch, taskGroupListRetrieveResults]);

  const taskStatusListRetrieveResults = useFetchData(['task-status-list-retrieve'], { personIdList: personIdsList }, METHOD.POST);
  useEffect(() => {
    if (taskStatusListRetrieveResults) {
      captureTaskStatusListRetrieveData(taskStatusListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personIdsList, taskStatusListRetrieveResults]);

  const teamListRetrieveResults = useFetchData(['team-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (teamListRetrieveResults) {
      captureTeamListRetrieveData(teamListRetrieveResults, apiDataCache, dispatch);
    }
  }, [teamListRetrieveResults]);

  const API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD = 50; // WV-4619: lowered from 200 now that only genuine 403 auth errors are counted
  useRedirectToLoginIfLoggedOut(teamListRetrieveResults, API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD);

  useEffect(() => {
    // console.log('Tasks useEffect allPeopleCache:', allPeopleCache);
    if (allPeopleCache) {
      const allCachedPeopleList = Object.values(allPeopleCache);
      setPersonIdsList(allCachedPeopleList.map((person) => person.personId));
      const sorted = alphabetizePeoplesObject(allCachedPeopleList);
      setSelectedPersonList(sorted);
    }
  }, [allPeopleCache]);

  useEffect(() => {
    // console.log('Tasks useEffect allTaskDefinitionsCache:', allTaskDefinitionsCache);
    if (allTaskDefinitionsCache) {
      setTaskDefinitionList(Object.values(allTaskDefinitionsCache));
    }
  }, [allTaskDefinitionsCache]);

  useEffect(() => {
    const taskListByPersonIdTemp = {};
    // Convert to list
    if (allTasksCache) {
      Object.entries(allTasksCache).forEach(([personIdTemp, taskDictByDefinitionId]) => {
        taskListByPersonIdTemp[personIdTemp] = Object.values(taskDictByDefinitionId);
      });
    }
    setTaskListByPersonId(taskListByPersonIdTemp);
    // console.log('=== taskListByPersonIdTemp:', taskListByPersonIdTemp);
  }, [allPeopleCache, allTasksCache]);

  useEffect(() => {
    if (getAppContextValue('tasksActionBarSearchText') !== searchText) {
      setSearchText(getAppContextValue('tasksActionBarSearchText'));
    }
    if (getAppContextValue('tasksActionBarShowCompletedTasks') !== showCompletedTasks) {
      setShowCompletedTasks(getAppContextValue('tasksActionBarShowCompletedTasks'));
    }
    if (getAppContextValue('tasksActionBarShowTasksByTask') !== showTasksByTask) {
      setShowTasksByTask(getAppContextValue('tasksActionBarShowTasksByTask'));
    }
    if (getAppContextValue('tasksActionBarHideAllTasks') !== hideAllTasks) {
      setAppContextValue('tasksActionBarHideAllTasks', !hideAllTasks);
      setHideAllTasks(!hideAllTasks);
    }
  }, [getAppContextValue]);




  const teamId = 0;  // hack 1/15/25
  // console.log('allTasksByDefinitionIdCache:', allTasksByDefinitionIdCache);
  return (
    <div>
      <Helmet>
        <title>
          Tasks -
          {' '}
          {webAppConfig.NAME_FOR_BROWSER_TAB_TITLE}
        </title>
        {/* Executing a link to a full url restarts the session, <Link rel="canonical" href={`${webAppConfig.WECONNECT_URL_FOR_SEO}/tasks`} /> */}
        {/* Latest Helmet wont take a link or Link, <Link to="/team-home">Home</Link> */}
        {/* browser.js:38 Uncaught Invariant Violation: Only elements types base, body, head, html, link, meta, noscript, script, style, title, Symbol(react.fragment) are allowed. Helmet does not support rendering <[object Object]> elements. Refer to our API for more information. */}
      </Helmet>
      <TaskTypeFilterHeader>
        {TASK_TYPE_LIST.map((taskType) => (
          <TaskTypeFilterButton
            key={taskType}
            $active={selectedTaskType === taskType}
            onClick={() => setSelectedTaskType(taskType)}
          >
            {taskType}
          </TaskTypeFilterButton>
        ))}
      </TaskTypeFilterHeader>
      <PageContentContainer>
        <ActionBarWrapperSpacer />
        <div>
          {showTasksByTask ? (
            <TasksByTaskWrapper>
              <TasksByTaskHeader>Tasks Organized by Task - WORK IN PROGRESS - THIS PAGE IS STILL BEING TESTED</TasksByTaskHeader>
              {allTasksByDefinitionIdCache && Object.entries(allTasksByDefinitionIdCache).map(([taskDefinitionId, tasks]) => {
                // console.log('=== taskDefinitionId:', taskDefinitionId);
                // const showTaskDefinition = tasks.length > 0; // Also set to false if all tasks are marked as completed
                const taskDefinition = taskDefinitionList[taskDefinitionId];
                const taskName = taskDefinition ? taskDefinition.taskName ||  'taskName Missing' : 'Task Name Missing';
                const taskTypeMatches = selectedTaskType === TASK_TYPES.ALL_TASKS || (taskDefinition && taskDefinition.taskType === selectedTaskType);
                // console.log('selectedTaskType:', selectedTaskType, 'taskTypeMatches:', taskTypeMatches, ', showTaskDefinition:', showTaskDefinition(searchText, taskDefinition));
                const showTaskTemp = taskTypeMatches && showTaskDefinition(searchText, taskDefinition);
                // console.log('*** showTaskTemp:', showTaskTemp);
                if (showTaskTemp) {
                  return (
                    <OneTaskDefinitionWrapper key={`task-definition-${taskDefinitionId}`}>
                      <TaskDefinitionHeader>
                        {taskName} ({taskDefinitionId})
                      </TaskDefinitionHeader>
                      {tasks.map((task) => {
                        // console.log('===== taskDefinitionId: ', taskDefinitionId, ', task.taskDefinitionId:', task.taskDefinitionId);
                        const showThisTask = task.statusDone !== true || showCompletedTasks;
                        if (showThisTask) {
                          return (
                            <OneTaskWrapper
                              key={`task-${task.taskDefinitionId}-${task.personId}`}
                            >
                              {/* Complete for: {allPeopleCache[task.personId]?.firstName} {allPeopleCache[task.personId]?.lastName} ({task.taskDefinitionId}) */}
                              <TaskSummaryRow
                                hideIfCompleted={!showCompletedTasks}
                                key={`taskSummaryRow-${task.personId}-${task.taskDefinitionId}`}
                                personId={convertToInteger(task.personId)}
                                showMarkCompletedLinkOnTitleLine
                                showPersonName
                                taskDefinition={taskDefinition}
                                task={task}
                              />
                            </OneTaskWrapper>
                          );
                        } else {
                          return null;
                        }
                      })}
                    </OneTaskDefinitionWrapper>
                  );
                } else {
                  // console.log('No tasks found for taskDefinitionId:', taskDefinitionId);
                  return null;
                }
              })}
            </TasksByTaskWrapper>
          ) : (
            <TasksByPersonWrapper>
              <PersonSummaryHeaderWrapper>
                <PersonSummaryHeader />
              </PersonSummaryHeaderWrapper>
              {taskListByPersonId && selectedPersonList.map((person) => {
                const showPersonResults = showPersonInTaskList(person, searchText, selectedTaskType, showCompletedTasks, taskDefinitionList, taskListByPersonId);
                // if (person.id === 583) {
                //   console.log('***** showPersonResults:', showPersonResults);
                // }
                let showPerson = true;
                if (searchText) {
                  // showPersonResults.allSearchWordsWereFound ||
                  showPerson = (showPersonResults.tasksExistToShow) && !showPersonResults.hideBecauseInactive;
                } else {
                  showPerson = showPersonResults.tasksExistToShow && !showPersonResults.hideBecauseInactive;
                }
                if (showPerson) {
                  return (
                    <OnePersonWrapper key={`team-${person.personId}`}>
                      <PersonSummaryRow hideTasks person={person} teamId={teamId} />
                      {!hideAllTasks && (
                        <TaskListForPerson
                          searchText={showPersonResults.searchTextMinusWordsFoundInPersonList}
                          selectedTaskType={selectedTaskType}
                          showCompletedTasks={showCompletedTasks}
                          taskDefinitionList={taskDefinitionList}
                          taskListForPersonId={taskListByPersonId[person.personId] || []}
                          onTaskMenuOpen={handleMenuOpen}
                          tasksPage
                        />
                      )}
                    </OnePersonWrapper>
                  );
                } else {
                  return null;
                }
              })}
            </TasksByPersonWrapper>
          )}
        </div>
      </PageContentContainer>
      {renderMenu()}
    </div>
  );
};

const styles = (theme) => ({
  addTeamButtonRoot: {
    width: 120,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const ActionBarWrapperSpacer = styled('div')`
  margin-top: 110px;
`;

const TaskTypeFilterHeader = styled('div')`
  position: fixed;
  top: 110px;
  left: 0;
  right: 0;
  z-index: 100;
  background: white;
  border-bottom: 2px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 6px;
  flex-wrap: wrap;
`;

const TaskTypeFilterButton = styled('button')`
  border: 1px solid ${(props) => (props.$active ? '#1e6fb9' : '#d0d0d0')};
  background: ${(props) => (props.$active ? '#1e6fb9' : 'white')};
  color: ${(props) => (props.$active ? 'white' : '#333')};
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? '600' : '500')};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: ${(props) => (props.$active ? '#1a5a94' : '#f5f5f5')};
    border-color: ${(props) => (props.$active ? '#1a5a94' : '#b0b0b0')};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const OnePersonWrapper = styled('div')`
`;

const OneTaskWrapper = styled('div')`
`;

const OneTaskDefinitionWrapper = styled('div')`
  margin-bottom: 20px;
`;

const PersonSummaryHeaderWrapper = styled('div')`
  margin-left: 45px;
`;

const TaskDefinitionHeader = styled('h3')`
  margin-bottom: 10px;
`;

const TasksByPersonWrapper = styled('div')`
`;

const TasksByTaskHeader = styled('div')`
  font-size: 36px;
  font-weight: bold;
`;

const TasksByTaskWrapper = styled('div')`
`;

export default withStyles(styles)(Tasks);
