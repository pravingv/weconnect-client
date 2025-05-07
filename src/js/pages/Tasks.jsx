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
import { isSearchTextFoundInPerson } from '../controllers/PersonController';
import { isSearchTextFoundInTask } from '../controllers/TaskController';
import capturePersonListRetrieveData from '../models/capturePersonListRetrieveData';
import {
  captureTaskDefinitionListRetrieveData, captureTaskGroupListRetrieveData, captureTaskStatusListRetrieveData,
} from '../models/TaskModel';
import { captureTeamListRetrieveData } from '../models/TeamModel';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';
import { alphabetizePeoplesObject } from '../utils/utilities';


const Tasks = () => {
  renderLog('Tasks');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTaskDefinitionsCache, allTasksCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [personIdsList, setPersonIdsList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPersonList, setSelectedPersonList] = useState([]);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
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
    if (allTasksCache) {
      Object.entries(allTasksCache).forEach(([personIdTemp, taskDictByDefinitionId]) => {
        taskListByPersonIdTemp[personIdTemp] = Object.values(taskDictByDefinitionId);
      });
    }
    setTaskListByPersonId(taskListByPersonIdTemp);
    // console.log('=== taskListByPersonIdTemp:', taskListByPersonIdTemp);
  }, [allPeopleCache, allTasksCache]);

  const showPerson = (person) => {
    if (!person || !person.personId < 0) return false; // Invalid person or personId
    const taskList = taskListByPersonId[person.personId] || [];
    let modifiedTaskList = [];
    if (searchText) {
      const personResults = isSearchTextFoundInPerson(searchText, person);
      const allSearchWordsWereFoundInPerson = personResults.allSearchWordsWereFound;
      const searchWordsFoundInPersonList = personResults.searchWordsFoundList;
      // console.log('=== searchWordsFoundInPersonList:', searchWordsFoundInPersonList);

      const allIncomingSearchWords = searchText.toLowerCase().split(/\s+/);
      // Filter out words found in person
      const searchWordsListMinusFoundInPersonList = allIncomingSearchWords.filter((word) => !searchWordsFoundInPersonList.includes(word.toLowerCase()));
      // Join the remaining words back into a string
      const searchTextMinusWordsFoundInPersonList = searchWordsListMinusFoundInPersonList.join(' ');
      // console.log('=== searchText: ', searchText, ', allIncomingSearchWords:', allIncomingSearchWords, ', searchWordsFoundInPersonList:', searchWordsFoundInPersonList, ', searchWordsListMinusFoundInPersonList:', searchWordsListMinusFoundInPersonList, ', searchTextMinusWordsFoundInPersonList:', searchTextMinusWordsFoundInPersonList);
      // console.log('=== searchTextMinusWordsFoundInPersonList:', searchTextMinusWordsFoundInPersonList);
      let taskResults = {};
      taskList.forEach((task) => {
        if (searchWordsListMinusFoundInPersonList && searchWordsListMinusFoundInPersonList.length > 0) {
          taskResults = isSearchTextFoundInTask(searchTextMinusWordsFoundInPersonList, task, taskDefinitionList);
          if (taskResults.allSearchWordsWereFound) {
            modifiedTaskList.push(task);
          }
        } else {
          modifiedTaskList.push(task);
        }
      });
      return {
        allSearchWordsWereFound: allSearchWordsWereFoundInPerson || modifiedTaskList.length > 0,
        hideBecauseInactive: false,
        searchTextMinusWordsFoundInPersonList,
        tasksExistToShow: modifiedTaskList && modifiedTaskList.length > 0,
      };
    } else {
      // Show all people since no search text provided
      modifiedTaskList = (showCompletedTasks) ? taskList : taskList.filter((task) => !task.statusDone);
      return {
        allSearchWordsWereFound: false,
        hideBecauseInactive: !person.statusActive,
        searchTextMinusWordsFoundInPersonList: searchText,
        tasksExistToShow: modifiedTaskList && modifiedTaskList.length > 0,
      };
    }
  };

  useEffect(() => {
    if (getAppContextValue('tasksActionBarSearchText') !== searchText) {
      setSearchText(getAppContextValue('tasksActionBarSearchText'));
    }
    if (getAppContextValue('tasksActionBarShowCompletedTasks') !== showCompletedTasks) {
      setShowCompletedTasks(getAppContextValue('tasksActionBarShowCompletedTasks'));
    }
  }, [getAppContextValue]);

  const teamId = 0;  // hack 1/15/25
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
        <PersonSummaryHeader />
        {taskListByPersonId && selectedPersonList.map((person) => {
          const showPersonResults = showPerson(person);
          // console.log('=== person:', person, ', showPersonResults:', showPersonResults);
          if ((showPersonResults.allSearchWordsWereFound || showPersonResults.tasksExistToShow) && !showPersonResults.hideBecauseInactive) {
            return (
              <OnePersonWrapper key={`team-${person.personId}`}>
                <PersonSummaryRow hideTasks person={person} teamId={teamId} />
                <TaskListForPerson
                  personId={person.personId}
                  searchText={showPersonResults.searchTextMinusWordsFoundInPersonList}
                  showCompletedTasks={showCompletedTasks}
                  taskDefinitionList={taskDefinitionList}
                  taskListForPersonId={taskListByPersonId[person.personId] || []}
                />
              </OnePersonWrapper>
            );
          } else {
            return null;
          }
        })}
      </PageContentContainer>
    </div>
  );
};

const styles = (theme) => ({
  ballotButtonIconRoot: {
    marginRight: 8,
  },
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

export default withStyles(styles)(Tasks);
