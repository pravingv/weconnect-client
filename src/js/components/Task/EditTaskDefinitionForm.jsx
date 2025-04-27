import {
  Button, Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import makeRequestParams from '../../react-query/makeRequestParams';
import { useTaskDefinitionSaveMutation } from '../../react-query/mutations';

const EditTaskDefinitionForm = ({ classes }) => {
  renderLog('EditTaskDefinitionForm');  // Set LOG_RENDER_EVENTS to log all renders
  const { getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { mutate: taskDefinitionSave } = useTaskDefinitionSaveMutation();

  const [googleDriveAssetId, setGoogleDriveAssetId] = useState('');
  const [isGoogleDrivePermissionTask, setIsGoogleDrivePermissionTask] = useState(false);
  const [isQuestionnaireTask, setIsQuestionnaireTask] = useState(false);
  const [moveToAnotherTaskGroup, setMoveToAnotherTaskGroup] = useState(false);
  const [questionnaireId, setQuestionnaireId] = useState('');
  const [saveButtonActive, setSaveButtonActive] = useState(false);
  const [statusActive, setStatusActive] = useState(false);
  const [taskGroup] = useState(getAppContextValue('editTaskDefinitionDrawerTaskGroup'));
  const [taskGroupId, setTaskGroupId] = useState(-1);
  const [taskDefinition] = useState(getAppContextValue('editTaskDefinitionDrawerTaskDefinition'));
  const [taskNameCompleted, setTaskNameCompleted] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskWhyWeDoIt, setTaskWhyWeDoIt] = useState('');
  const [taskWhatToDo, setTaskWhatToDo] = useState('');
  const [taskActionUrl, setTaskActionUrl] = useState('');

  const taskNameCompletedInputRef = useRef('');
  const taskNameInputRef = useRef('');
  const taskWhyWeDoItInputRef = useRef('');
  const taskWhatToDoInputRef = useRef('');
  const taskActionUrlInputRef = useRef('');

  useEffect(() => {
    if (taskDefinition) {
      setGoogleDriveAssetId(taskDefinition.googleDriveAssetId);
      setIsGoogleDrivePermissionTask(taskDefinition.isGoogleDrivePermissionTask);
      setIsQuestionnaireTask(taskDefinition.isQuestionnaireTask);
      setQuestionnaireId(taskDefinition.questionnaireId);
      setStatusActive(taskDefinition.statusActive);
      setTaskActionUrl(taskDefinition.taskActionUrl);
      setTaskGroupId(taskDefinition.taskGroupId);
      setTaskName(taskDefinition.taskName);
      setTaskNameCompleted(taskDefinition.taskNameCompleted);
      setTaskWhatToDo(taskDefinition.taskWhatToDo);
      setTaskWhyWeDoIt(taskDefinition.taskWhyWeDoIt);
    } else {
      setGoogleDriveAssetId('');
      setIsGoogleDrivePermissionTask(false);
      setIsQuestionnaireTask(false);
      setQuestionnaireId('');
      setStatusActive(false);
      setTaskActionUrl('');
      setTaskGroupId(-1);
      setTaskName('');
      setTaskNameCompleted('');
      setTaskWhatToDo('');
      setTaskWhyWeDoIt('');
    }
  }, [taskDefinition]);

  const saveTaskDefinition = () => {
    const requestParams = makeRequestParams({
      taskDefinitionId: taskDefinition ? taskDefinition.id : '-1',
      taskGroupId: taskGroup.taskGroupId,
    }, {
      googleDriveAssetId,
      isGoogleDrivePermissionTask,
      isQuestionnaireTask,
      questionnaireId,
      statusActive,
      taskGroupId,
      taskActionUrl: taskActionUrlInputRef.current.value,
      taskName: taskNameInputRef.current.value,
      taskNameCompleted: taskNameCompletedInputRef.current.value,
      taskWhatToDo: taskWhatToDoInputRef.current.value,
      taskWhyWeDoIt: taskWhyWeDoItInputRef.current.value,
    });
    taskDefinitionSave(requestParams);
    setSaveButtonActive(false);
    setAppContextValue('editTaskDefinitionDrawerOpen', false);
    setAppContextValue('editTaskDefinitionDrawerTaskDefinition', undefined);
    setAppContextValue('editTaskDefinitionDrawerTaskGroup', undefined);
    setAppContextValue('editTaskDefinitionDrawerLabel', '');
  };

  const updateSaveButton = () => {
    if (taskNameInputRef.current.value && taskNameInputRef.current.value.length) {
      if (!saveButtonActive) {
        setSaveButtonActive(true);
      }
    }
  };

  return (
    <EditTaskDefinitionFormWrapper>
      <FormControl classes={{ root: classes.formControl }}>
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={statusActive}
              className={classes.checkboxRoot}
              color="primary"
              id="statusActiveToBeSaved"
              name="statusActive"
              onChange={(event) => {
                setStatusActive(event.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="This task is ON"
        />
        <TextField
          autoFocus
          defaultValue={taskName}
          id="taskNameToBeSaved"
          inputRef={taskNameInputRef}
          label="Task Name (Prior to Completion)"
          margin="dense"
          multiline
          name="taskName"
          onChange={updateSaveButton}
          placeholder="Name of one task, before completion"
          rows={2}
          variant="outlined"
        />
        <TextField
          defaultValue={taskNameCompleted}
          id="taskNameCompletedToBeSaved"
          inputRef={taskNameCompletedInputRef}
          label="Task Name (Once Completed)"
          margin="dense"
          multiline
          name="taskNameCompleted"
          onChange={updateSaveButton}
          placeholder="Name of task, after completion"
          rows={2}
          variant="outlined"
        />
        <TextField
          defaultValue={taskWhyWeDoIt}
          id="taskWhyWeDoItToBeSaved"
          inputRef={taskWhyWeDoItInputRef}
          label="Why we do this task"
          margin="dense"
          multiline
          name="taskWhyWeDoIt"
          onChange={updateSaveButton}
          placeholder="Why we do this task"
          rows={4}
          variant="outlined"
        />
        <TextField
          defaultValue={taskWhatToDo}
          id="taskWhatToDoToBeSaved"
          inputRef={taskWhatToDoInputRef}
          label="What to do to complete this task"
          margin="dense"
          multiline
          name="taskWhatToDo"
          onChange={updateSaveButton}
          placeholder="Instructions for how to complete this task"
          rows={4}
          variant="outlined"
        />
        <TextField
          defaultValue={taskActionUrl}
          id="taskActionUrlToBeSaved"
          inputRef={taskActionUrlInputRef}
          label="Task Action URL"
          margin="dense"
          name="taskActionUrl"
          onChange={updateSaveButton}
          placeholder="Web address of the task"
          variant="outlined"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={isQuestionnaireTask || false}
              className={classes.checkboxRoot}
              color="primary"
              id="isQuestionnaireTaskToBeSaved"
              name="isQuestionnaireTask"
              onChange={(event) => {
                setIsQuestionnaireTask(event.target.checked);
                updateSaveButton(true);
              }}
            />
          )}
          label="Include a questionnaire"
        />
        <TextField
          classes={isQuestionnaireTask ? {} : { root: classes.hideThisField }}
          value={questionnaireId}
          id="questionnaireIdToBeSaved"
          label="Questionnaire ID (If needed for this task)"
          margin="dense"
          name="questionnaireId"
          onChange={(event) => {
            setQuestionnaireId(event.target.value);
            updateSaveButton(true);
          }}
          placeholder="Id of the questionnaire to be completed for this task"
          variant="outlined"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={isGoogleDrivePermissionTask || false}
              className={classes.checkboxRoot}
              color="primary"
              id="isGoogleDrivePermissionTaskToBeSaved"
              name="isGoogleDrivePermissionTask"
              onChange={(event) => {
                setIsGoogleDrivePermissionTask(event.target.checked);
                updateSaveButton(true);
              }}
            />
          )}
          label="Include Google Drive file id"
        />
        <TextField
          classes={isGoogleDrivePermissionTask ? {} : { root: classes.hideThisField }}
          id="googleDriveAssetIdToBeSaved"
          label="Google Drive ID"
          margin="dense"
          name="googleDriveAssetId"
          onChange={(event) => {
            setGoogleDriveAssetId(event.target.value);
            updateSaveButton(true);
          }}
          placeholder="Id of the Google Drive folder or file"
          value={googleDriveAssetId}
          variant="outlined"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={moveToAnotherTaskGroup}
              className={classes.checkboxRoot}
              color="primary"
              id="moveToAnotherTaskGroup-DoNotSave"
              name="moveToAnotherTaskGroup"
              onChange={(event) => {
                setMoveToAnotherTaskGroup(event.target.checked);
                updateSaveButton(true);
              }}
            />
          )}
          label="Move to another task group"
        />
        <TextField
          classes={moveToAnotherTaskGroup ? {} : { root: classes.hideThisField }}
          value={taskGroupId}
          id="taskGroupIdToBeSaved"
          label="Id of TaskGroup parent"
          margin="dense"
          name="taskGroupId"
          onChange={(event) => {
            setTaskGroupId(event.target.value);
            updateSaveButton(true);
          }}
          placeholder="Id of the taskGroup this task is part of"
          variant="outlined"
        />
        <Button
          classes={{ root: classes.saveTaskDefinitionButton }}
          color="primary"
          disabled={!saveButtonActive}
          onClick={saveTaskDefinition}
          variant="contained"
        >
          Save Task
        </Button>
      </FormControl>
    </EditTaskDefinitionFormWrapper>
  );
};
EditTaskDefinitionForm.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  checkboxLabel: {
    marginTop: 2,
  },
  checkboxRoot: {
    paddingTop: 0,
    paddingLeft: '9px',
    paddingBottom: 0,
  },
  formControl: {
    width: '100%',
  },
  hideThisField: {
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  },
  saveTaskDefinitionButton: {
    width: 300,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const CheckboxLabel = styled(FormControlLabel)`
  margin-bottom: 0 !important;
`;

const EditTaskDefinitionFormWrapper = styled('div')`
`;

export default withStyles(styles)(EditTaskDefinitionForm);
