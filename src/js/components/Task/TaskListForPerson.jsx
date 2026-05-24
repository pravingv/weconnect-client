import PropTypes from 'prop-types';
import React from 'react';
import { IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import TaskSummaryRow from './TaskSummaryRow';
import { showTask } from '../../utils/showTask';
import convertToInteger from '../../common/utils/convertToInteger';
import { TASK_TYPES } from '../../constants/TaskTypeConstants';


const TaskListForPerson = ({ searchText, selectedTaskType, showCompletedTasks, taskDefinitionList, taskListForPersonId, onTaskMenuOpen, tasksPage }) => {
  renderLog('TaskListForPerson');  // Set LOG_RENDER_EVENTS to log all renders
  // console.log('=== TaskListForPerson searchText:', searchText);
  // isSearchTextFoundInTask(searchText, task, taskDefinitionList)

  return (
    <TaskListWrapper>
      {taskListForPersonId.map((task) => {
        const taskDefinition = taskDefinitionList.find((taskDef) => taskDef.taskDefinitionId === task.taskDefinitionId) || {};
        const taskTypeMatches = selectedTaskType === TASK_TYPES.ALL_TASKS || (taskDefinition && taskDefinition.taskType === selectedTaskType);
        // console.log('selectedTaskType:', selectedTaskType, 'taskTypeMatches:', taskTypeMatches, ', showTaskDefinition:', showTaskDefinition(searchText, taskDefinition));
        const showTaskTemp = taskTypeMatches && showTask(task, searchText, taskDefinitionList);
        // console.log('*** showTaskTemp:', showTaskTemp);
        return showTaskTemp ? (
          <div
            key={`task-wrapper-${task.personId}-${task.taskDefinitionId}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <TaskSummaryRow
              hideIfCompleted={!showCompletedTasks}
              personId={convertToInteger(task.personId)}
              taskDefinition={taskDefinition}
              task={task}
            />
            {/* Conditional triple dot */}
            {tasksPage && (showCompletedTasks || !task.statusDone) && (
              <IconButton
                onClick={(e) => onTaskMenuOpen(e, task, taskDefinition)}
              >
                <MoreVertIcon />
              </IconButton>
            )}
          </div>
        ) : null;
      })}
    </TaskListWrapper>
  );
};
TaskListForPerson.propTypes = {
  searchText: PropTypes.string,
  selectedTaskType: PropTypes.string,
  showCompletedTasks: PropTypes.bool,
  taskDefinitionList: PropTypes.array,
  taskListForPersonId: PropTypes.array,
  onTaskMenuOpen: PropTypes.func,
  tasksPage: PropTypes.bool,
};

const TaskListWrapper = styled('div')`
  margin-bottom: 8px;
`;

export default TaskListForPerson;
