import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import TaskListForPerson from '../Task/TaskListForPerson';
import { useGetPersonById } from '../../models/PersonModel';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { captureTaskDefinitionListRetrieveData } from '../../models/TaskModel';
import { SpanWithLinkStyle } from '../Style/linkStyles';


const EditPersonTasksDrawerMainContent = () => {
  renderLog('EditPersonTasksDrawerMainContent');
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTaskDefinitionsCache, allTasksCache } = apiDataCache;
  const dispatch = useConnectDispatch();
  const personId = getAppContextValue('editPersonTasksPersonId');
  const person = useGetPersonById(personId);

  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [taskDefinitionList, setTaskDefinitionList] = useState([]);
  const [taskListByPersonId, setTaskListByPersonId] = useState({});

  const taskDefinitionListRetrieveResults = useFetchData(['task-definition-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (taskDefinitionListRetrieveResults) {
      captureTaskDefinitionListRetrieveData(taskDefinitionListRetrieveResults, apiDataCache, dispatch);
    }
  }, [apiDataCache, dispatch, taskDefinitionListRetrieveResults]);

  useEffect(() => {
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

  return (
    <EditPersonTasksDrawerMainContentWrapper>
      <div>
        {showCompletedTasks ? (
          <SpanWithLinkStyle onClick={() => setShowCompletedTasks(false)}>Hide completed tasks</SpanWithLinkStyle>
        ) : (
          <SpanWithLinkStyle onClick={() => setShowCompletedTasks(true)}>Show completed tasks</SpanWithLinkStyle>
        )}
      </div>
      <EditPersonTasksWrapper>
        {(person && person.personId && taskListByPersonId) && (
          <TaskListForPerson
            personId={person.personId}
            showCompletedTasks={showCompletedTasks}
            taskDefinitionList={taskDefinitionList}
            taskListForPersonId={taskListByPersonId[person.personId] || []}
          />
        )}
      </EditPersonTasksWrapper>
    </EditPersonTasksDrawerMainContentWrapper>
  );
};

const EditPersonTasksDrawerMainContentWrapper = styled('div')`
`;

const EditPersonTasksWrapper = styled('div')`
  margin-top: 32px;
`;

export default EditPersonTasksDrawerMainContent;
