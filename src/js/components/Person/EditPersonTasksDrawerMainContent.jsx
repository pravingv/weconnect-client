import { Lock } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import TaskListForPerson from '../Task/TaskListForPerson';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { useGetPersonById } from '../../models/PersonModel';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { captureTaskDefinitionListRetrieveData } from '../../models/TaskModel';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import makeRequestParams from '../../react-query/makeRequestParams';
import { useSaveTaskMutation } from '../../react-query/mutations';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';


const EditPersonTasksDrawerMainContent = () => {
  renderLog('EditPersonTasksDrawerMainContent');
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTaskDefinitionsCache, allTasksCache, viewerAccessRights } = apiDataCache;
  const dispatch = useConnectDispatch();
  const personId = getAppContextValue('profileDrawerPersonId');
  const person = useGetPersonById(personId);
  const { mutate: saveTask } = useSaveTaskMutation();

  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [taskDefinitionList, setTaskDefinitionList] = useState([]);
  const [taskListByPersonId, setTaskListByPersonId] = useState({});

  const authenticatedPerson = getAppContextValue('authenticatedPerson');

  const taskDefinitionListRetrieveResults = useFetchData(['task-definition-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (taskDefinitionListRetrieveResults) {
      captureTaskDefinitionListRetrieveData(taskDefinitionListRetrieveResults, apiDataCache, dispatch);
    }
  }, [apiDataCache, dispatch, taskDefinitionListRetrieveResults]);

  /**
   * Marks all undone onboarding tasks for the current person as completed.
   * This function iterates through all tasks for the person, creates a save request for each undone task,
   * and then executes all these requests in parallel.
   * NOTE FROM DALE: We could write a more efficient dedicated API to do this work
   * on the server side, but I don't think it's worth the effort since this is
   * an admin-only task.
   *
   * @async
   * @function
   * @throws {Error} If there's an issue saving any of the tasks
   * @returns {Promise<void>} A promise that resolves when all tasks have been processed
   */
  const markAsDoneAllOnboardingTasksForThisPerson = async () => {
    const taskListForThisPerson = taskListByPersonId[person.personId];
    const savePromises = [];

    taskListForThisPerson.forEach((task) => {
      if (!task.statusDone) {  // Only mark undone tasks as done
        const requestParams = makeRequestParams({
          personId,
          taskDefinitionId: task.taskDefinitionId,
        }, {
          doneByPersonId: authenticatedPerson.id,
          statusDone: true,
        });
        savePromises.push(saveTask(requestParams));
      }
    });
    try {
      await Promise.all(savePromises);
      console.log('All tasks marked as done successfully');
      // You could update state or show a success message here
    } catch (error) {
      console.error('Error marking tasks as done:', error);
      // You could show an error message to the user here
    }
  };

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
      {viewerCanSeeOrDo(['canMarkOnboardingTasksInBulk'], viewerAccessRights) && (
        <AdminMarkAsCompleted>
          <LockStyled />
          <SpanWithLinkStyle onClick={() => markAsDoneAllOnboardingTasksForThisPerson()}>Admin only: Mark all as completed</SpanWithLinkStyle>
        </AdminMarkAsCompleted>
      )}
    </EditPersonTasksDrawerMainContentWrapper>
  );
};

const AdminMarkAsCompleted = styled('div')`
  margin-top: 60px;
`;

const EditPersonTasksDrawerMainContentWrapper = styled('div')`
`;

const EditPersonTasksWrapper = styled('div')`
  margin-top: 32px;
`;

const LockStyled = styled(Lock)`
  color: ${DesignTokenColors.neutral300};
  height: 16px;
  margin-right: 2px;
  margin-bottom: -2px;
  width: 16px;
`;

export default EditPersonTasksDrawerMainContent;
