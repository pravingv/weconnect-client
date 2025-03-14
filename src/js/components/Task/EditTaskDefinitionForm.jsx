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
//   'taskWhyWeDoIt',
//   'taskWhatToDo',
// ];

const EditTaskDefinitionForm = ({ classes }) => {
  renderLog('EditTaskDefinitionForm');  // Set LOG_RENDER_EVENTS to log all renders
  const { getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { mutate: taskDefinitionSave } = useTaskDefinitionSaveMutation();

  const [questionnaireIdValue, setQuestionnaireIdValue] = useState('');
  const [taskGroup] = useState(getAppContextValue('editTaskDefinitionDrawerTaskGroup'));
  const [taskDefinition] = useState(getAppContextValue('editTaskDefinitionDrawerTaskDefinition'));
  const [taskNameCompletedValue, setTaskNameCompletedValue] = useState('');
  const [taskNameValue, setTaskNameValue] = useState('');
  const [taskWhyWeDoItValue, setTaskWhyWeDoItValue] = useState('');
  const [taskWhatToDoValue, setTaskWhatToDoValue] = useState('');
  const [taskUrlValue, setTaskUrlValue] = useState('');
  const [saveButtonActive, setSaveButtonActive] = useState(false);

  const questionnaireIdInputRef = useRef('');
  const taskNameCompletedInputRef = useRef('');
  const taskNameInputRef = useRef('');
  const taskWhyWeDoItInputRef = useRef('');
  const taskWhatToDoInputRef = useRef('');
  const taskUrlInputRef = useRef('');

  useEffect(() => {
    if (taskDefinition) {
      setQuestionnaireIdValue(taskDefinition.questionnaireId);
      setTaskNameCompletedValue(taskDefinition.taskNameCompleted);
      setTaskNameValue(taskDefinition.taskName);
      setTaskWhyWeDoItValue(taskDefinition.taskWhyWeDoIt);
      setTaskWhatToDoValue(taskDefinition.taskWhatToDo);
      setTaskUrlValue(taskDefinition.taskActionUrl);
    } else {
      setQuestionnaireIdValue('');
      setTaskNameCompletedValue('');
      setTaskNameValue('');
      setTaskWhyWeDoItValue('');
      setTaskWhatToDoValue('');
      setTaskUrlValue('');
    }
  }, [taskDefinition]);

  const saveTaskDefinition = () => {
    const requestParams = makeRequestParams({
      taskDefinitionId: taskDefinition ? taskDefinition.id : '-1',
      taskGroupId: taskGroup.taskGroupId,
    }, {
      questionnaireId: questionnaireIdInputRef.current.value,
      taskName: taskNameInputRef.current.value,
      taskNameCompleted: taskNameCompletedInputRef.current.value,
      taskWhatToDo: taskWhatToDoInputRef.current.value,
      taskWhyWeDoIt: taskWhyWeDoItInputRef.current.value,
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
          defaultValue={taskNameCompletedValue}
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
          defaultValue={taskWhyWeDoItValue}
          id="taskWhyWeDoItToBeSaved"
          inputRef={taskWhyWeDoItInputRef}
          label="Why we do this task"
          margin="dense"
          multiline
          name="taskWhyWeDoIt"
          onChange={updateSaveButton}
          placeholder="Why we do this task"
          rows={6}
          variant="outlined"
        />
        <TextField
          defaultValue={taskWhatToDoValue}
          id="taskWhatToDoToBeSaved"
          inputRef={taskWhatToDoInputRef}
          label="What to do to complete this task"
          margin="dense"
          multiline
          name="taskWhatToDo"
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
        <TextField
          defaultValue={questionnaireIdValue}
          id="questionnaireIdToBeSaved"
          inputRef={questionnaireIdInputRef}
          label="Questionnaire ID (If needed for this task)"
          margin="dense"
          name="questionnaireId"
          onChange={updateSaveButton}
          placeholder="Id of the questionnaire to be completed for this task"
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
