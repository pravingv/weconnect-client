import { Lock } from '@mui/icons-material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import TaskListForPerson from './TaskListForPerson';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { useGetPersonById } from '../../models/PersonModel';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { captureTaskDefinitionListRetrieveData } from '../../models/TaskModel';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import makeRequestParams from '../../react-query/makeRequestParams';
import { useSaveTaskMutation } from '../../react-query/mutations';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';


const TaskListForPersonManager = ({ personId }) => {
  renderLog('TaskListForPersonManager');
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const { allPeopleCache, allTaskDefinitionsCache, allTasksCache, viewerAccessRights } = apiDataCache;
  const dispatch = useConnectDispatch();
  const person = useGetPersonById(personId);
  const { mutate: saveTask } = useSaveTaskMutation();

  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [taskDefinitionList, setTaskDefinitionList] = useState([]);
  const [taskListByPersonId, setTaskListByPersonId] = useState({});
  const [tasksRemainToComplete, setTasksRemainToComplete] = useState(false);

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

  useEffect(() => {
    const taskListForThisPerson = taskListByPersonId[personId];
    if (taskListForThisPerson && taskListForThisPerson.length > 0) {
      setTasksRemainToComplete(taskListForThisPerson.some((task) => !task.statusDone));
    }
  }, [personId, taskListByPersonId]);

  return (
    <TaskListForPersonManagerWrapper>
      <EditPersonTasksWrapper>
        {(person && person.personId && taskListByPersonId) && (
          <TaskListForPerson
            showCompletedTasks={showCompletedTasks}
            taskDefinitionList={taskDefinitionList}
            taskListForPersonId={taskListByPersonId[person.personId] || []}
          />
        )}
      </EditPersonTasksWrapper>
      <ActionLinks>
        <ShowCompletedTasksWrapper>
          {showCompletedTasks ? (
            <SpanWithLinkStyle onClick={() => setShowCompletedTasks(false)}>Hide completed tasks</SpanWithLinkStyle>
          ) : (
            <SpanWithLinkStyle onClick={() => setShowCompletedTasks(true)}>Show completed tasks</SpanWithLinkStyle>
          )}
        </ShowCompletedTasksWrapper>
        {viewerCanSeeOrDo(['canMarkOnboardingTasksInBulk'], viewerAccessRights) && tasksRemainToComplete && !showCompletedTasks && (
          <AdminMarkAsCompleted>
            <LockStyled />
            <SpanWithLinkStyle onClick={() => markAsDoneAllOnboardingTasksForThisPerson()}>Mark all completed: Admin only</SpanWithLinkStyle>
          </AdminMarkAsCompleted>
        )}
      </ActionLinks>
    </TaskListForPersonManagerWrapper>
  );
};
TaskListForPersonManager.propTypes = {
  personId: PropTypes.number.isRequired,
};

const ActionLinks = styled('div')`
  display: flex;
  font-size: .8em;
  justify-content: flex-start;
`;

const AdminMarkAsCompleted = styled('div')`
`;

const EditPersonTasksWrapper = styled('div')`
`;

const LockStyled = styled(Lock)`
  color: ${DesignTokenColors.neutral300};
  height: 16px;
  margin-right: 2px;
  margin-bottom: -2px;
  width: 16px;
`;

const ShowCompletedTasksWrapper = styled('div')`
  margin-left: 32px;
  margin-right: 25px;
`;

const TaskListForPersonManagerWrapper = styled('div')`
`;

export default TaskListForPersonManager;
