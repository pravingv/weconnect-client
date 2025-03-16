import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import TaskSummaryRow from './TaskSummaryRow';
import { isSearchTextFoundInTask } from '../../controllers/TaskController';


const TaskListForPerson = ({ personId, searchText, showCompletedTasks, taskDefinitionList, taskListForPersonId }) => {
  renderLog('TaskListForPerson');  // Set LOG_RENDER_EVENTS to log all renders
  // console.log('=== TaskListForPerson searchText:', searchText);
  // isSearchTextFoundInTask(searchText, task, taskDefinitionList)

  const showTask = (task) => {
    // console.log('=== *** showTask:', task, ', searchText:', searchText, ', taskDefinitionList:', taskDefinitionList);
    // if (!task || task.taskDefinitionId < 1) return false; // Invalid task or task.id
    if (searchText) {
      const results = isSearchTextFoundInTask(searchText, task, taskDefinitionList);
      return results.allSearchWordsWereFound;
    } else {
      return true; // Show the task if no searchText is provided
    }
  };

  return (
    <TaskListWrapper>
      {taskListForPersonId.map((task) => {
        const taskDefinition = taskDefinitionList.find((taskDef) => taskDef.taskDefinitionId === task.taskDefinitionId) || {};
        const showTaskTemp =  showTask(task, searchText, taskDefinitionList);
        // console.log('*** showTaskTemp:', showTaskTemp);
        return showTaskTemp ? (
          <TaskSummaryRow
            hideIfCompleted={!showCompletedTasks}
            key={`taskSummaryRow-${task.personId}-${task.taskDefinitionId}`}
            personId={personId}
            taskDefinition={taskDefinition}
            task={task}
          />
        ) : null;
      })}
    </TaskListWrapper>
  );
};
TaskListForPerson.propTypes = {
  personId: PropTypes.number.isRequired,
  searchText: PropTypes.string,
  showCompletedTasks: PropTypes.bool,
  taskDefinitionList: PropTypes.array,
  taskListForPersonId: PropTypes.array,
};

const TaskListWrapper = styled('div')`
  margin-bottom: 8px;
`;

export default TaskListForPerson;
