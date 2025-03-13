import { Button, FormControl, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import makeRequestParams from '../../react-query/makeRequestParams';
import { useTaskDefinitionSaveMutation } from '../../react-query/mutations';

// const TASK_DEFINITION_FIELDS_IN_FORM = [
//   'googleDriveFolderId',
//   'isGoogleDrivePermissionStep',
//   'order',
//   'taskGroupId',
//   'taskActionUrl',
//   'taskName',
//   'taskDescription',
//   'taskInstructions',
// ];

const EditTaskDefinitionForm = ({ classes }) => {
  renderLog('EditTaskDefinitionForm');  // Set LOG_RENDER_EVENTS to log all renders
  const { getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { mutate: taskDefinitionSave } = useTaskDefinitionSaveMutation();

  const [taskGroup] = useState(getAppContextValue('editTaskDefinitionDrawerTaskGroup'));
  const [taskDefinition] = useState(getAppContextValue('editTaskDefinitionDrawerTaskDefinition'));
  const [taskNameValue, setTaskNameValue] = useState('');
  const [taskDescValue, setTaskDescValue] = useState('');
  const [taskInstValue, setTaskInstValue] = useState('');
  const [taskUrlValue, setTaskUrlValue] = useState('');
  const [saveButtonActive, setSaveButtonActive] = useState(false);

  const taskNameInputRef = useRef('');
  const taskDescInputRef = useRef('');
  const taskInstInputRef = useRef('');
  const taskUrlInputRef = useRef('');

  useEffect(() => {
    if (taskDefinition) {
      setTaskNameValue(taskDefinition.taskName);
      setTaskDescValue(taskDefinition.taskDescription);
      setTaskInstValue(taskDefinition.taskInstructions);
      setTaskUrlValue(taskDefinition.taskActionUrl);
    } else {
      setTaskNameValue('');
      setTaskDescValue('');
      setTaskInstValue('');
      setTaskUrlValue('');
    }
  }, [taskDefinition]);

  const saveTaskDefinition = () => {
    const requestParams = makeRequestParams({
      taskDefinitionId: taskDefinition ? taskDefinition.id : '-1',
      taskGroupId: taskGroup.taskGroupId,
    }, {
      taskName: taskNameInputRef.current.value,
      taskDescription: taskDescInputRef.current.value,
      taskInstructions: taskInstInputRef.current.value,
      taskActionUrl: taskUrlInputRef.current.value,
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
        <TextField
          autoFocus
          defaultValue={taskNameValue}
          id="taskNameToBeSaved"
          inputRef={taskNameInputRef}
          label="Task Name"
          margin="dense"
          name="taskName"
          onChange={updateSaveButton}
          placeholder="Name of one task"
          variant="outlined"
        />
        <TextField
          defaultValue={taskDescValue}
          id="taskDescriptionToBeSaved"
          inputRef={taskDescInputRef}
          label="Description of this task"
          margin="dense"
          multiline
          name="taskDescription"
          onChange={updateSaveButton}
          placeholder="Task description"
          rows={6}
          variant="outlined"
        />
        <TextField
          defaultValue={taskInstValue}
          id="taskInstructionsToBeSaved"
          inputRef={taskInstInputRef}
          label="Instructions for completing this task"
          margin="dense"
          multiline
          name="taskInstructions"
          onChange={updateSaveButton}
          placeholder="Instructions for how to complete this task"
          rows={6}
          variant="outlined"
        />
        <TextField
          defaultValue={taskUrlValue}
          id="taskActionUrlToBeSaved"
          inputRef={taskUrlInputRef}
          label="Task Action URL"
          margin="dense"
          name="taskActionUrl"
          onChange={updateSaveButton}
          placeholder="Web address of the task"
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
  formControl: {
    width: '100%',
  },
  saveTaskDefinitionButton: {
    width: 300,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const EditTaskDefinitionFormWrapper = styled('div')`
`;

export default withStyles(styles)(EditTaskDefinitionForm);
