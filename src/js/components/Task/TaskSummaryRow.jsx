import { CheckCircleOutline, ExpandLess, ExpandMore, InfoOutlined } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import { renderLog } from '../../common/utils/logging';
import makeRequestParams from '../../react-query/makeRequestParams';
import { useSaveTaskMutation } from '../../react-query/mutations';
import DisplayWhatToDoTextAsActiveJSX from '../../utils/DisplayWhatToDoTextAsActiveJSX';


const TaskSummaryRow = ({ hideIfCompleted, personId, taskDefinition, task }) => {
  renderLog('TaskSummaryRow');  // Set LOG_RENDER_EVENTS to log all renders
  const { mutate: saveTask } = useSaveTaskMutation();

  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);

  const updateTaskFieldInstant = (isDone) => {
    // console.log('updateTaskFieldInstant isDone:', isDone);

    const requestParams = makeRequestParams({
      personId,
      taskDefinitionId: task.taskDefinitionId,
    }, {
      statusDone: isDone,
    });
    saveTask(requestParams);
  };

  if (hideIfCompleted && task.statusDone) {
    return null;
  }

  // console.log('TaskSummaryRow taskDefinition:', taskDefinition);
  const taskNameToDisplay = task.statusDone ? taskDefinition.taskNameCompleted || taskDefinition.taskName : taskDefinition.taskName;
  return (
    <OneTaskWrapper key={`teamMemberRow-${personId}-${task.taskDefinitionId}`}>
      <OneTaskTitle key={`teamMemberTitle-${personId}-${task.taskDefinitionId}`}>
        <TaskCell id={`taskDone-${personId}-${task.taskDefinitionId}`} width={25}>
          {task.statusDone && (
            <CheckCircleOutline />
          )}
        </TaskCell>
        <TaskCell id={`index-${personId}-${task.taskDefinitionId}`} width={25}>
          {taskDetailsOpen ? (
            <ExpandLess onClick={() => setTaskDetailsOpen(false)} />
          ) : (
            <ExpandMore onClick={() => setTaskDetailsOpen(true)} />
          )}
        </TaskCell>
        <TaskCell id={`taskName-${personId}-${task.taskDefinitionId}`} width={400}>
          <span onClick={() => setTaskDetailsOpen(!taskDetailsOpen)}>{taskNameToDisplay}</span>
          {(taskDefinition.taskWhyWeDoIt) && (
            <Tooltip
              arrow
              enterTouchDelay={0} // show with click in mobile
              id={`taskWhyWeDoIt-tooltip-${task.taskDefinitionId}`}
              leaveTouchDelay={3000}
              title={taskDefinition.taskWhyWeDoIt}
            >
              <InfoOutlinedStyled />
            </Tooltip>
          )}
        </TaskCell>
      </OneTaskTitle>
      {taskDetailsOpen && (
        <OneTaskDetails>
          <TaskCell id={`taskDone-${personId}-${task.taskDefinitionId}`} width={50}>
            &nbsp;
          </TaskCell>
          <TaskCellOpen id={`statusDoneCell-${task.taskDefinitionId}`}>
            <div>
              <DisplayWhatToDoTextAsActiveJSX
                // task={task}
                taskDefinition={taskDefinition}
                personId={personId}
              />
            </div>
            <div>
              {task.statusDone ? (
                <CheckboxDone>
                  Completed by Jane Dough (Apr 17, 2025)
                </CheckboxDone>
              ) : (
                <SpanWithLinkStyle onClick={() => updateTaskFieldInstant(true)}>
                  Mark completed
                </SpanWithLinkStyle>
              )}
            </div>
          </TaskCellOpen>
        </OneTaskDetails>
      )}
    </OneTaskWrapper>
  );
};
TaskSummaryRow.propTypes = {
  hideIfCompleted: PropTypes.bool.isRequired,
  personId: PropTypes.number.isRequired,
  taskDefinition: PropTypes.object.isRequired,
  task: PropTypes.object.isRequired,
};

const styles = () => ({
  checkboxDoneRoot: {
    marginLeft: '-10px',
    paddingTop: 0,
    paddingBottom: 0,
  },
  checkboxRoot: {
    paddingTop: 0,
    paddingLeft: '9px',
    paddingBottom: 0,
  },
  checkboxLabel: {
    marginLeft: '-6px',
    marginTop: 2,
  },
});

const CheckboxDone = styled('div')`
  color: ${DesignTokenColors.neutral300};
`;

const InfoOutlinedStyled = styled(InfoOutlined)`
  color: ${DesignTokenColors.neutral300};
  height: 20px;
  margin-left: 2px;
  width: 20px;
`;

const OneTaskDetails = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 10px;
`;

const OneTaskTitle = styled('div')`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const OneTaskWrapper = styled('div')`
`;

const TaskCell = styled('div', {
  shouldForwardProp: (prop) => !['smallFont', 'smallestFont', 'width'].includes(prop),
})(({ smallFont, smallestFont, width }) => (`
  align-content: center;
  // border-bottom: 1px solid #ccc;
  ${(smallFont && !smallestFont) ? 'font-size: .9em;' : ''};
  ${(smallestFont && !smallFont) ? 'font-size: .8em;' : ''};
  ${width ? `max-width: ${width}px;` : ''};
  ${width ? `min-width: ${width}px;` : ''};
  overflow: hidden;
  white-space: nowrap;
  ${width ? `width: ${width}px;` : ''};
`));

const TaskCellOpen = styled('div')`
  align-content: center;
`;

export default withStyles(styles)(TaskSummaryRow);
