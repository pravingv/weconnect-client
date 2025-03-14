import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import TaskSummaryRow from './TaskSummaryRow';


const TaskListForPerson = ({ personId, showCompletedTasks, taskDefinitionList, taskListForPersonId }) => {
  renderLog('TaskListForPerson');  // Set LOG_RENDER_EVENTS to log all renders
  let taskDefinition = {};
  return (
    <TaskListWrapper>
      {taskListForPersonId.map((task) => {
        taskDefinition = taskDefinitionList.find((taskDef) => taskDef.taskDefinitionId === task.taskDefinitionId) || {};
        return (
          <TaskSummaryRow
            hideIfCompleted={!showCompletedTasks}
            key={`taskSummaryRow-${task.personId}-${task.taskDefinitionId}`}
            personId={personId}
            taskDefinition={taskDefinition}
            task={task}
          />
        );
      })}
    </TaskListWrapper>
  );
};
TaskListForPerson.propTypes = {
  personId: PropTypes.number.isRequired,
  showCompletedTasks: PropTypes.bool,
  taskDefinitionList: PropTypes.array,
  taskListForPersonId: PropTypes.array,
};

const TaskListWrapper = styled('div')`
  margin-bottom: 8px;
`;

export default TaskListForPerson;
