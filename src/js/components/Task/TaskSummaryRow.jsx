import { CheckCircleOutline, ExpandLess, ExpandMore, InfoOutlined } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { formatDateToMonthDay, formatDateToMonthDayYear } from '../../common/utils/dateFormat';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { useGetFirstNamePreferred, useGetFullNamePreferred } from '../../models/PersonModel';
import { makeRequestParamsDictionary } from '../../react-query/makeRequestParams';
import { useSaveTaskMutation } from '../../react-query/mutations';
import DisplayWhatToDoTextAsActiveJSX from '../../utils/DisplayWhatToDoTextAsActiveJSX';
import GoogleDriveShareManager from '../Person/GoogleDriveShareManager';


const TaskSummaryRow = ({ actionButton, hideIfCompleted, personId, showPersonName, taskDefinition, task }) => {
  renderLog('TaskSummaryRow');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { allPeopleCache, viewerAccessRights } = apiDataCache;
  const { mutate: saveTask } = useSaveTaskMutation();

  const [authenticatedPersonId, setAuthenticatedPersonId] = useState(-1);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);

  const authenticatedPerson = getAppContextValue('authenticatedPerson');
  const doneByPersonFirstName = useGetFirstNamePreferred(task.doneByPersonId);
  const doneByPersonFullName = useGetFullNamePreferred(task.doneByPersonId);
  const personFullName = useGetFullNamePreferred(task.personId);

  const viewPersonClick = (hasEditRights = false) => {
    setAppContextValue('headerProfileDrawerOpen', true);
    setAppContextValue('profileDrawerPerson', allPeopleCache[task.personId]);
    setAppContextValue('profileDrawerPersonId', task.personId);
    if (hasEditRights) {
      setAppContextValue('headerProfileSection', 'nameAndPhoto');
    } else {
      setAppContextValue('headerProfileSection', 'visibleProfile');
    }
  };

  useEffect(() => {
    if (authenticatedPerson) {
      setAuthenticatedPersonId(authenticatedPerson.id);
    }
  }, [authenticatedPerson, getAppContextValue]);

  if (!task) {
    return null;
  }
  if (hideIfCompleted && task && task.statusDone) {
    return null;
  }

  // console.log('TaskSummaryRow taskDefinition:', taskDefinition);
  let isGoogleDrivePermissionTask = false;
  let taskName;
  let taskNameCompleted;
  let taskWhyWeDoIt;
  const taskStatusDone = task ? task.statusDone : false;
  if (taskDefinition) {
    isGoogleDrivePermissionTask = taskDefinition.isGoogleDrivePermissionTask || false;
    taskName = taskDefinition.taskName || 'task name missing';
    taskNameCompleted = taskDefinition.taskNameCompleted;
    taskWhyWeDoIt = taskDefinition.taskWhyWeDoIt;
  }
  const taskNameToDisplay = taskStatusDone ? taskNameCompleted || taskName : taskName;
  return (
    <OneTaskWrapper key={`teamMemberRow-${personId}-${task.taskDefinitionId}`}>
      <OneTaskTitle key={`teamMemberTitle-${personId}-${task.taskDefinitionId}`}>
        <TaskCell id={`taskDone-${personId}-${task.taskDefinitionId}`} width={25}>
          {taskStatusDone && (
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
        {showPersonName && (
          <TaskCell
            id={`person-${personId}-${task.taskDefinitionId}`}
            onClick={() => viewPersonClick(true)}
            width={180}
          >
            {personFullName || 'Person name missing'}
          </TaskCell>
        )}
        <TaskCell id={`taskName-${personId}-${task.taskDefinitionId}`} width={800}>
          <span onClick={() => setTaskDetailsOpen(!taskDetailsOpen)}>{taskNameToDisplay}</span>
          {(taskWhyWeDoIt) && (
            <Tooltip
              arrow
              enterTouchDelay={0} // show with click in mobile
              id={`taskWhyWeDoIt-tooltip-${task.taskDefinitionId}`}
              leaveTouchDelay={3000}
              title={taskWhyWeDoIt}
            >
              <InfoOutlinedStyled />
            </Tooltip>
          )}
          {taskStatusDone && doneByPersonFirstName && (
            <CompletedBy>
              {' '}
              by
              {' '}
              {doneByPersonFirstName}
              {task.dateLastUpdated && (
                <>
                  {' '}
                  (
                  {formatDateToMonthDay(task.dateLastUpdated)}
                  )
                </>
              )}
            </CompletedBy>
          )}
        </TaskCell>
        {actionButton && (
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            {actionButton}
          </div>
        )}
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
            {(isGoogleDrivePermissionTask && viewerCanSeeOrDo(['canMarkOnboardingTaskCompleted'], viewerAccessRights)) && (
              <GoogleDriveShareManager
                task={task}
                taskDefinition={taskDefinition}
              />
            )}
            <div>
              {taskStatusDone && (
                <CheckboxDone>
                  Completed
                  {doneByPersonFullName && (
                    <>
                      {' '}
                      by
                      {' '}
                      {doneByPersonFullName}
                    </>
                  )}
                  {task.dateLastUpdated && (
                    <>
                      {' '}
                      (
                      {formatDateToMonthDayYear(task.dateLastUpdated)}
                      )
                    </>
                  )}
                </CheckboxDone>
              )}
            </div>
          </TaskCellOpen>
        </OneTaskDetails>
      )}
    </OneTaskWrapper>
  );
};
TaskSummaryRow.propTypes = {
  actionButton: PropTypes.node,
  hideIfCompleted: PropTypes.bool.isRequired,
  personId: PropTypes.number.isRequired,
  showPersonName: PropTypes.bool,
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

const CompletedBy = styled('span')`
  color: ${DesignTokenColors.neutral300};
`;

const InfoOutlinedStyled = styled(InfoOutlined)`
  color: ${DesignTokenColors.neutral300};
  height: 20px;
  margin-left: 2px;
  width: 20px;
`;

const MarkCompletedOnTitleLine = styled('span')`
  margin-left: 10px;
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
  width: 100%;
  flex-grow: 1;
`;

const OneTaskWrapper = styled('div')`
`;

const TaskCell = styled('div', {
  shouldForwardProp: (prop) => !['smallFont', 'smallestFont', 'width'].includes(prop),
})(({ smallFont, smallestFont, width }) => (`
  align-content: center;
  ${(smallFont && !smallestFont) ? 'font-size: .9em;' : ''};
  ${(smallestFont && !smallFont) ? 'font-size: .8em;' : ''};
  ${width ? `max-width: ${width}px;` : ''};
  ${(width && width !== 800) ? `min-width: ${width}px;` : 'min-width: 0;'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${(width && width !== 800) ? `width: ${width}px;` : 'flex-grow: 1; width: 100%;'};
`));

const TaskCellOpen = styled('div')`
  align-content: center;
`;

export default withStyles(styles)(TaskSummaryRow);
