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


const Tasks = () => {
  renderLog('Tasks');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTaskDefinitionsCache, allTasksByDefinitionIdCache, allTasksCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [personIdsList, setPersonIdsList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPersonList, setSelectedPersonList] = useState([]);
  const [hideAllTasks, setHideAllTasks] = useState(getAppContextValue('tasksActionBarHideAllTasks'));
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
    if (taskGroupListRetrieveResults) {
      captureTaskGroupListRetrieveData(taskGroupListRetrieveResults, apiDataCache, dispatch);
    }
  }, [apiDataCache, dispatch, taskGroupListRetrieveResults]);

  const taskStatusListRetrieveResults = useFetchData(['task-status-list-retrieve'], { personIdList: personIdsList }, METHOD.GET);
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
                const showTaskTemp =  showTaskDefinition(searchText, taskDefinition);
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
                const showPersonResults = showPersonInTaskList(person, searchText, showCompletedTasks, taskDefinitionList, taskListByPersonId);
                // console.log('=== person:', person, ', showPersonResults:', showPersonResults);
                if ((showPersonResults.allSearchWordsWereFound || showPersonResults.tasksExistToShow) && !showPersonResults.hideBecauseInactive) {
                  return (
                    <OnePersonWrapper key={`team-${person.personId}`}>
                      <PersonSummaryRow hideTasks person={person} teamId={teamId} />
                      {!hideAllTasks && (
                        <TaskListForPerson
                          searchText={showPersonResults.searchTextMinusWordsFoundInPersonList}
                          showCompletedTasks={showCompletedTasks}
                          taskDefinitionList={taskDefinitionList}
                          taskListForPersonId={taskListByPersonId[person.personId] || []}
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
  margin-top: 60px;
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
