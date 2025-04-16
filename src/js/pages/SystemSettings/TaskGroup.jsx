import { Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useParams } from 'react-router';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { renderLog } from '../../common/utils/logging';
import { EditStyled } from '../../components/Style/iconStyles';
import { SpanWithLinkStyle } from '../../components/Style/linkStyles';
import { PageContentContainer } from '../../components/Style/pageLayoutStyles';
import webAppConfig from '../../config';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import capturePersonListRetrieveData from '../../models/capturePersonListRetrieveData';
import {
  captureTaskDefinitionListRetrieveData, captureTaskGroupListRetrieveData, captureTaskStatusListRetrieveData,
} from '../../models/TaskModel';


const TaskGroup = ({ classes }) => {
  renderLog('TaskGroup');
  const { apiDataCache } = useConnectAppContext();
  const { allPeopleCache, allTaskDefinitionsCache, allTaskGroupsCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const { setAppContextValue } = useConnectAppContext();

  const location = useLocation();
  let taskGroupNameIncoming = '';
  if (location && location.state && location.state.taskGroupName) {
    taskGroupNameIncoming = parseInt(location.state.taskGroupName);
  }
  const [personIdsList, setPersonIdsList] = useState([]);
  const [taskGroupId] = useState(parseInt(useParams().taskGroupId));
  const [taskGroupName, setTaskGroupName] = useState(taskGroupNameIncoming);
  const [taskGroup, setTaskGroup] = useState(undefined);
  const [taskDefinitionList, setTaskDefinitionList] = useState(undefined);

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

  useEffect(() => {
    if (allPeopleCache) {
      const allCachedPeopleList = Object.values(allPeopleCache);
      setPersonIdsList(allCachedPeopleList.map((person) => person.personId));
    }
  }, [allPeopleCache]);

  useEffect(() => {
    if (allTaskGroupsCache && allTaskGroupsCache[taskGroupId]) {
      setTaskGroupName(allTaskGroupsCache[taskGroupId].taskGroupName);
    }
  }, [allTaskGroupsCache, taskGroupId]);

  useEffect(() => {
    if (allTaskDefinitionsCache) {
      setTaskDefinitionList(Object.values(allTaskDefinitionsCache));
    }
  }, [allTaskDefinitionsCache]);

  useEffect(() => {
    if (allTaskGroupsCache && allTaskGroupsCache[taskGroupId]) {
      setTaskGroup(allTaskGroupsCache[taskGroupId]);
    }
  }, [allTaskGroupsCache]);

  const addTaskDefinitionClick = () => {
    setAppContextValue('editTaskDefinitionDrawerOpen', true);
    setAppContextValue('editTaskDefinitionDrawerTaskDefinition', undefined);
    setAppContextValue('editTaskDefinitionDrawerTaskGroup', taskGroup);
    setAppContextValue('editTaskDefinitionDrawerLabel', 'Add Task');
  };

  const editTaskDefinitionClick = (taskDefinition) => {
    setAppContextValue('editTaskDefinitionDrawerOpen', true);
    setAppContextValue('editTaskDefinitionDrawerTaskDefinition', taskDefinition);
    setAppContextValue('editTaskDefinitionDrawerTaskGroup', taskGroup);
    setAppContextValue('editTaskDefinitionDrawerLabel', 'Edit Task');
  };

  const editTaskGroupClick = () => {
    setAppContextValue('editTaskGroupDrawerOpen', true);
    setAppContextValue('editTaskGroupDrawerTaskGroup', taskGroup);
    setAppContextValue('editTaskGroupDrawerLabel', 'Edit Task Group');
  };

  const taskDefinitionListForThisTaskGroup = taskDefinitionList ? taskDefinitionList.filter((taskDefinition) => taskDefinition.taskGroupId === taskGroupId) : [];
  return (
    <>
      <Helmet>
        <title>
          TaskGroup Details -
          {' '}
          {webAppConfig.NAME_FOR_BROWSER_TAB_TITLE}
        </title>
        <link rel="canonical" href={`${webAppConfig.WECONNECT_URL_FOR_SEO}/task-group/${taskGroupId}`} />
      </Helmet>
      <PageContentContainer>
        <TaskGroupBreadcrumbWrapper>
          <Link to="/system-settings">Task Groups</Link>
          {' '}
          &gt;
          {' '}
          {taskGroupName}
          <SpanWithLinkStyle onClick={editTaskGroupClick}>
            <EditStyled />
          </SpanWithLinkStyle>
        </TaskGroupBreadcrumbWrapper>
        {taskGroup && taskGroup.taskGroupDescription && (
          <InstructionsWrapper>
            {taskGroup.taskGroupDescription}
          </InstructionsWrapper>
        )}
        <TaskDefinitionListWrapper>
          {taskDefinitionListForThisTaskGroup.map((taskDefinition) => (
            <OneTaskGroupWrapper key={`taskDefinition-${taskDefinition.id}`}>
              {taskDefinition.taskName}
              {' '}
              <SpanWithLinkStyle onClick={() => editTaskDefinitionClick(taskDefinition)}>
                <EditStyled />
              </SpanWithLinkStyle>
            </OneTaskGroupWrapper>
          ))}
        </TaskDefinitionListWrapper>
        <AddButtonWrapper>
          <Button
            classes={{ root: classes.addTaskGroupButtonRoot }}
            color="primary"
            variant="outlined"
            onClick={addTaskDefinitionClick}
          >
            Add Task
          </Button>
        </AddButtonWrapper>
      </PageContentContainer>
    </>
  );
};
TaskGroup.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  ballotButtonIconRoot: {
    marginRight: 8,
  },
  addTaskGroupButtonRoot: {
    width: 185,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const TaskGroupBreadcrumbWrapper = styled('div')`
  height: 100px;
  align-content: center;
`;

const AddButtonWrapper = styled('div')`
  margin-top: 24px;
`;

const InstructionsWrapper = styled('div')`
  color: ${DesignTokenColors.neutralUI300};
  font-size: 1.2em;
`;

const OneTaskGroupWrapper = styled('div')`
  margin-bottom: 20px;
`;

const TaskDefinitionListWrapper = styled('div')`
  margin-top: 24px;
  padding-bottom: 24px;
`;

export default withStyles(styles)(TaskGroup);
