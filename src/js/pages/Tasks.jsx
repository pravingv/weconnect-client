import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import SearchBar2024 from '../common/components/Search/SearchBar2024';
import { renderLog } from '../common/utils/logging';
import PersonSummaryHeader from '../components/Person/PersonSummaryHeader';
import PersonSummaryRow from '../components/Person/PersonSummaryRow';
import { ActionBarItem, ActionBarSection, SearchBarWrapper } from '../components/Style/actionBarStyles';
import { SpanWithLinkStyle } from '../components/Style/linkStyles';
import { PageContentContainer } from '../components/Style/pageLayoutStyles';
import TaskListForPerson from '../components/Task/TaskListForPerson';
import webAppConfig from '../config';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import { isSearchTextFoundInPerson } from '../controllers/PersonController';
import { isSearchTextFoundInTask } from '../controllers/TaskController';
import { viewerCanSeeOrDo } from '../models/AuthModel';
import capturePersonListRetrieveData from '../models/capturePersonListRetrieveData';
import {
  captureTaskDefinitionListRetrieveData, captureTaskGroupListRetrieveData, captureTaskStatusListRetrieveData,
} from '../models/TaskModel';
import { captureTeamListRetrieveData } from '../models/TeamModel';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';
import { alphabetizePeoplesObject } from '../utils/utilities';


// eslint-disable-next-line no-unused-vars
const Tasks = ({ classes, match }) => {
  renderLog('Tasks');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, setAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTaskDefinitionsCache, allTasksCache, viewerAccessRights } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [personIdsList, setPersonIdsList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedPersonList, setSelectedPersonList] = useState([]);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [taskListByPersonId, setTaskListByPersonId] = useState({});
  const [taskDefinitionList, setTaskDefinitionList] = useState([]);

  const clearFunction = () => {
    setSearchText('');
  };

  const searchFunction = (incomingSearchText) => {
    // console.log('AddTeamDrawerMainContent searchFunction incomingSearchText: ', incomingSearchText);
    setSearchText(incomingSearchText);
  };

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

  const addTeamMemberClick = () => {
    setAppContextValue('addPersonDrawerOpen', true);
    setAppContextValue('AddPersonDrawerLabel', 'Add Person');
  };

  const showPerson = (person) => {
    if (!person || !person.personId < 0) return false; // Invalid person or personId
    if (searchText) {
      const taskList = taskListByPersonId[person.personId] || [];
      const modifiedTaskList = [];
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
        searchTextMinusWordsFoundInPersonList,
      };
    } else {
      // Show all people since no search text provided
      return {
        allSearchWordsWereFound: true,
        searchTextMinusWordsFoundInPersonList: searchText,
      };
    }
  };

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
        <h1>Tasks</h1>
        <TasksActionBarWrapper>
          <SearchBarWrapper>
            <SearchBar2024
              clearFunction={clearFunction}
              placeholder="Search existing tasks"
              searchFunction={searchFunction}
              searchUpdateDelayTime={0}
            />
          </SearchBarWrapper>
          <ActionBarSection>
            <ActionBarItem>
              {showCompletedTasks ? (
                <SpanWithLinkStyle onClick={() => setShowCompletedTasks(false)}>
                  Hide completed tasks
                </SpanWithLinkStyle>
              ) : (
                <SpanWithLinkStyle onClick={() => setShowCompletedTasks(true)}>
                  Show completed tasks
                </SpanWithLinkStyle>
              )}
            </ActionBarItem>
          </ActionBarSection>
          <ActionBarSection>
            {viewerCanSeeOrDo('canAddTeamMemberAnyTeam', viewerAccessRights) && (
              <ActionBarItem>
                <SpanWithLinkStyle onClick={() => addTeamMemberClick()}>
                  Add team member
                </SpanWithLinkStyle>
              </ActionBarItem>
            )}
          </ActionBarSection>
        </TasksActionBarWrapper>
        <PersonSummaryHeader />
        {taskListByPersonId && selectedPersonList.map((person) => {
          const showPersonResults = showPerson(person);
          if (showPersonResults.allSearchWordsWereFound) {
            return (
              <OnePersonWrapper key={`team-${person.personId}`}>
                <PersonSummaryRow person={person} teamId={teamId} />
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
Tasks.propTypes = {
  classes: PropTypes.object.isRequired,
  // match: PropTypes.object.isRequired,
  match: PropTypes.object,
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

const OnePersonWrapper = styled('div')`
`;

const TasksActionBarWrapper = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-top: 40px;  // Temporary hack
`;

export default withStyles(styles)(Tasks);
