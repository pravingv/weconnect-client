import { Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { EditStyled } from '../../components/Style/iconStyles';
import { PageContentContainer } from '../../components/Style/pageLayoutStyles';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import capturePersonListRetrieveData from '../../models/capturePersonListRetrieveData';
import { captureTaskDefinitionListRetrieveData, captureTaskGroupListRetrieveData, captureTaskStatusListRetrieveData } from '../../models/TaskModel';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { generateActivatedByDescription, generateTaskDefinitionListString } from '../../utils/taskDescriptions';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';


const TaskGroupListIndex = ({ classes, showTaskGroupList }) => {
  renderLog('TaskGroupListIndex');
  const { apiDataCache, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights, allPeopleCache, allTaskDefinitionsCache, allTaskGroupsCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [personIdsList, setPersonIdsList] = useState([]);
  const [taskDefinitionList, setTaskDefinitionList] = useState([]);
  const [taskGroupList, setTaskGroupList] = useState([]);

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (personListRetrieveResults) {
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personListRetrieveResults, allPeopleCache, apiDataCache, dispatch]);

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
  }, [apiDataCache, dispatch, personIdsList, taskStatusListRetrieveResults]);

  useEffect(() => {
    if (allPeopleCache) {
      const allCachedPeopleList = Object.values(allPeopleCache);
      setPersonIdsList(allCachedPeopleList.map((person) => person.personId));
    }
  }, [allPeopleCache]);

  useEffect(() => {
    if (allTaskDefinitionsCache) {
      setTaskDefinitionList(Object.values(allTaskDefinitionsCache));
    }
  }, [allTaskDefinitionsCache]);

  useEffect(() => {
    if (allTaskGroupsCache) {
      setTaskGroupList(Object.values(allTaskGroupsCache));
    }
  }, [allTaskGroupsCache]);

  const addTaskGroupClick = () => {
    setAppContextValue('editTaskGroupDrawerOpen', true);
    setAppContextValue('editTaskGroupDrawerTaskGroup', undefined);
    setAppContextValue('editTaskGroupDrawerLabel', 'Add Task Grouping');
  };

  const editTaskGroupClick = (taskGroup) => {
    setAppContextValue('editTaskGroupDrawerOpen', true);
    setAppContextValue('editTaskGroupDrawerTaskGroup', taskGroup);
    setAppContextValue('editTaskGroupDrawerLabel', 'Edit Task Grouping');
  };

  if (!viewerCanSeeOrDo(['canViewSystemSettings'], viewerAccessRights)) {
    return (
      <PageContentContainer>
        <h1>You do not have permission to access this page.</h1>
      </PageContentContainer>
    );
  }

  // Alphabetically sort task groups
  taskGroupList.sort((a, b) => a.taskGroupName.localeCompare(b.taskGroupName));
  return (
    <TaskGroupListIndexWrapper>
      {/* ****  **** */}
      {showTaskGroupList && (
        <DisplayArea>
          {taskGroupList.map((taskGroup) => {
            const activatedByDescription = generateActivatedByDescription(taskGroup);
            const taskDefinitionListString = generateTaskDefinitionListString(taskGroup.id, taskDefinitionList);
            return (
              <OneQuestionnaireWrapper key={`taskGroup-${taskGroup.id}`}>
                <ListItemFlexInnerWrapper>
                  <Link to={`/task-group/${taskGroup.id}`} state={taskGroup}>
                    <ActiveOrNotSpan
                      $turnedOff={!taskGroup.statusActive}
                    >
                      {taskGroup.taskGroupName}
                    </ActiveOrNotSpan>
                    {' '}
                    ({taskGroup.id})
                  </Link>
                  <EditTaskGroup onClick={() => editTaskGroupClick(taskGroup)}>
                    <EditStyled />
                  </EditTaskGroup>
                </ListItemFlexInnerWrapper>
                {(activatedByDescription) && (
                  <ListItemFlexInnerWrapper>
                    <TriggeredBy>Activated by:&nbsp;</TriggeredBy>
                    <TriggeredByDescription>{activatedByDescription}</TriggeredByDescription>
                  </ListItemFlexInnerWrapper>
                )}
                {(taskGroup.taskGroupDescription) && (
                  <ListItemFlexInnerWrapper>
                    <TaskGroupDescription>{taskGroup.taskGroupDescription}</TaskGroupDescription>
                  </ListItemFlexInnerWrapper>
                )}
                {(taskDefinitionListString) && (
                  <ListItemFlexInnerWrapper>
                    <TriggeredBy>Tasks:&nbsp;</TriggeredBy>
                    <TriggeredByDescription>{taskDefinitionListString}</TriggeredByDescription>
                  </ListItemFlexInnerWrapper>
                )}
              </OneQuestionnaireWrapper>
            );
          })}
          <AddButtonWrapper>
            <Button
              classes={{ root: classes.addQuestionnaireButtonRoot }}
              color="primary"
              variant="outlined"
              onClick={addTaskGroupClick}
            >
              Add Task Grouping
            </Button>
          </AddButtonWrapper>
        </DisplayArea>
      )}
    </TaskGroupListIndexWrapper>
  );
};
TaskGroupListIndex.propTypes = {
  classes: PropTypes.object.isRequired,
  showTaskGroupList: PropTypes.bool,
};

const styles = (theme) => ({
  ballotButtonIconRoot: {
    marginRight: 8,
  },
  addQuestionnaireButtonRoot: {
    width: 185,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const ActiveOrNotSpan = styled('span')`
  ${(props) => (props.$turnedOff ? 'text-decoration: line-through;' : '')}
`;

const AddButtonWrapper = styled('div')`
  margin-top: 24px;
`;

const DisplayArea = styled('div')`
`;

const EditTaskGroup = styled('div')`
  cursor: pointer;
  margin-left: 25px;
`;

const OneQuestionnaireWrapper = styled('div')`
`;

const ListItemFlexInnerWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 6px;
`;

const TaskGroupListIndexWrapper = styled('div')`
`;

const TaskGroupDescription = styled('div')`
  color: ${DesignTokenColors.neutralUI600};
  font-size: .9em;
  margin-left: 10px;
`;

const TriggeredBy = styled('div')`
  color: ${DesignTokenColors.neutralUI600};
  font-size: .9em;
  font-weight: 500;
  margin-left: 10px;
`;

const TriggeredByDescription = styled('div')`
  color: ${DesignTokenColors.neutralUI600};
  font-size: .9em;
`;

export default withStyles(styles)(TaskGroupListIndex);
