import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import TaskSummaryRow from './TaskSummaryRow';
import { showTask } from '../../utils/showTask';
import convertToInteger from '../../common/utils/convertToInteger';


const TaskListForPerson = ({ searchText, showCompletedTasks, taskDefinitionList, taskListForPersonId }) => {
  renderLog('TaskListForPerson');  // Set LOG_RENDER_EVENTS to log all renders
  // console.log('=== TaskListForPerson searchText:', searchText);
  // isSearchTextFoundInTask(searchText, task, taskDefinitionList)

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
            personId={convertToInteger(task.personId)}
            taskDefinition={taskDefinition}
            task={task}
          />
        ) : null;
      })}
    </TaskListWrapper>
  );
};
TaskListForPerson.propTypes = {
  searchText: PropTypes.string,
  showCompletedTasks: PropTypes.bool,
  taskDefinitionList: PropTypes.array,
  taskListForPersonId: PropTypes.array,
};

const TaskListWrapper = styled('div')`
  margin-bottom: 8px;
`;

export default TaskListForPerson;
