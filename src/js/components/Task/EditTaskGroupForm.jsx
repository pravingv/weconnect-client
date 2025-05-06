import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel, InputLabel, Select,
  TextField,
} from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import convertToInteger from '../../common/utils/convertToInteger';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import makeRequestParams from '../../react-query/makeRequestParams';
import { useTaskGroupTeamLinkDeleteMutation, useTaskGroupTeamLinkSaveMutation, useTaskGroupSaveMutation } from '../../react-query/mutations';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import { captureTeamListRetrieveData } from '../../models/TeamModel';

const EditTaskGroupForm = ({ classes }) => {
  renderLog('EditTaskGroupForm');
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { allTeamsCache, allTaskGroupTeamLinksCache } = apiDataCache;
  const dispatch = useConnectDispatch();
  const { mutate: taskGroupTeamLinkDelete } = useTaskGroupTeamLinkDeleteMutation();
  const { mutate: taskGroupTeamLinkSave } = useTaskGroupTeamLinkSaveMutation();
  const { mutate: taskGroupSave } = useTaskGroupSaveMutation();

  const [assignIfEmailCreated, setAssignIfEmailCreated] = useState(false);
  const [assignIfOfferApproved, setAssignIfOfferApproved] = useState(false);
  const [assignIfOfferDecisionNeeded, setAssignIfOfferDecisionNeeded] = useState(false);
  const [assignIfOfferLetterCreated, setAssignIfOfferLetterCreated] = useState(false);
  const [assignIfOfferLetterSigned, setAssignIfOfferLetterSigned] = useState(false);
  const [assignIfOfferQuestionnaireAnswered, setAssignIfOfferQuestionnaireAnswered] = useState(false);
  const [assignIfOfferQuestionnaireSent, setAssignIfOfferQuestionnaireSent] = useState(false);
  const [assignIfOfferWillNotBeMade, setAssignIfOfferWillNotBeMade] = useState(false);
  const [assignIfQuestionnaireAnswered, setAssignIfQuestionnaireAnswered] = useState(false);
  const [linkedTeamIdList, setLinkedTeamIdList] = useState([]);
  const [questionnaireId, setQuestionnaireId] = useState('');
  const [statusActive, setStatusActive] = useState(false);
  const [saveButtonActive, setSaveButtonActive] = useState(false);
  const [taskGroup] = useState(getAppContextValue('editTaskGroupDrawerTaskGroup'));
  const [taskGroupDescription, setTaskGroupDescription] = useState('');
  const [taskGroupIsForTeam, setTaskGroupIsForTeam] = useState(false);
  const [taskGroupName, setTaskGroupName] = useState('');
  const [taskGroupTeamId, setTaskGroupTeamId] = useState(-1);
  const [teamDictByTeamId, setTeamDictByTeamId] = useState({});
  const [teamList, setTeamList] = useState([]);

  const taskGroupNameInputRef = useRef('');
  const taskGroupDescriptionInputRef = useRef('');

  const teamListRetrieveResults = useFetchData(['team-list-retrieve'], {}, METHOD.GET);
  // ////////////////////////////////////////////
  // Dale's approach to use organize incoming data and then use that data from apiDataCache
  // Allows us to organize incoming data independent of the specific API, potentially from multiple API or sources
  useEffect(() => {
    if (teamListRetrieveResults) {
      captureTeamListRetrieveData(teamListRetrieveResults, apiDataCache, dispatch);
    }
  }, [teamListRetrieveResults, apiDataCache, dispatch]);

  useEffect(() => {
    if (taskGroup) {
      setAssignIfEmailCreated(taskGroup.assignIfEmailCreated);
      setAssignIfOfferApproved(taskGroup.assignIfOfferApproved);
      setAssignIfOfferDecisionNeeded(taskGroup.assignIfOfferDecisionNeeded);
      setAssignIfOfferLetterCreated(taskGroup.assignIfOfferLetterCreated);
      setAssignIfOfferLetterSigned(taskGroup.assignIfOfferLetterSigned);
      setAssignIfOfferQuestionnaireAnswered(taskGroup.assignIfOfferQuestionnaireAnswered);
      setAssignIfOfferQuestionnaireSent(taskGroup.assignIfOfferQuestionnaireSent);
      setAssignIfOfferWillNotBeMade(taskGroup.assignIfOfferWillNotBeMade);
      setAssignIfQuestionnaireAnswered(taskGroup.assignIfQuestionnaireAnswered);
      setQuestionnaireId(taskGroup.questionnaireId);
      setStatusActive(taskGroup.statusActive);
      setTaskGroupDescription(taskGroup.taskGroupDescription);
      setTaskGroupIsForTeam(taskGroup.taskGroupIsForTeam);
      setTaskGroupName(taskGroup.taskGroupName);
    } else {
      setAssignIfEmailCreated(false);
      setAssignIfOfferApproved(false);
      setAssignIfOfferDecisionNeeded(false);
      setAssignIfOfferLetterCreated(false);
      setAssignIfOfferLetterSigned(false);
      setAssignIfOfferQuestionnaireAnswered(false);
      setAssignIfOfferQuestionnaireSent(false);
      setAssignIfOfferWillNotBeMade(false);
      setAssignIfQuestionnaireAnswered(false);
      setQuestionnaireId('');
      setStatusActive(false);
      setTaskGroupDescription('');
      setTaskGroupIsForTeam(false);
      setTaskGroupName('');
      setTaskGroupTeamId(-1);
    }
  }, [taskGroup]);

  useEffect(() => {
    if (allTeamsCache) {
      const teamListSimple = Object.values(allTeamsCache);
      const activeTeams = teamListSimple
        .filter((team) => team.statusActive === true)
        .sort((a, b) => a.teamName.localeCompare(b.teamName));
      setTeamList(activeTeams);
      // Create a dictionary with team.id as key and team object as value
      const teamDict = activeTeams.reduce((acc, team) => {
        acc[team.id] = team;
        return acc;
      }, {});
      setTeamDictByTeamId(teamDict);
    }
  }, [allTeamsCache]);

  useEffect(() => {
    if (allTaskGroupTeamLinksCache) {
      const taskGroupTeamLinksForThisTaskGroup = allTaskGroupTeamLinksCache[taskGroup ? taskGroup.id : '-1'] || [];
      const linkedTeamIds = taskGroupTeamLinksForThisTaskGroup.map((TaskGroupTeamLinkTemp) => TaskGroupTeamLinkTemp.teamId);
      setLinkedTeamIdList(linkedTeamIds);
    }
  }, [allTaskGroupTeamLinksCache, taskGroup]);

  const deleteTaskGroupTeamLink = (teamIdTemp) => {
    const requestParams = makeRequestParams({
      taskGroupId: taskGroup ? taskGroup.id : '-1',
      teamId: teamIdTemp,
    }, {});
    taskGroupTeamLinkDelete(requestParams);
  };

  const saveTaskGroup = () => {
    const requestParams = makeRequestParams({
      taskGroupId: taskGroup ? taskGroup.id : '-1',
    }, {
      assignIfEmailCreated,
      assignIfOfferApproved,
      assignIfOfferDecisionNeeded,
      assignIfOfferLetterCreated,
      assignIfOfferLetterSigned,
      assignIfOfferQuestionnaireAnswered,
      assignIfOfferQuestionnaireSent,
      assignIfOfferWillNotBeMade,
      assignIfQuestionnaireAnswered,
      questionnaireId,
      statusActive,
      taskGroupDescription: taskGroupDescriptionInputRef.current.value,
      taskGroupIsForTeam,
      taskGroupName: taskGroupNameInputRef.current.value,
    });
    taskGroupSave(requestParams);
  };

  const saveTaskGroupTeamLink = () => {
    const requestParams = makeRequestParams({
      taskGroupId: taskGroup ? taskGroup.id : '-1',
      teamId: taskGroupTeamId,
    }, {});
    taskGroupTeamLinkSave(requestParams);
  };

  const saveTaskGroupForm = () => {
    saveTaskGroup();
    saveTaskGroupTeamLink();
    setSaveButtonActive(false);
    setAppContextValue('editTaskGroupDrawerOpen', false);
    setAppContextValue('editTaskGroupDrawerTaskGroup', undefined);
    setAppContextValue('editTaskGroupDrawerLabel', '');
  };

  const updateSaveButton = () => {
    if (taskGroupNameInputRef.current.value && taskGroupNameInputRef.current.value.length) {
      if (!saveButtonActive) {
        setSaveButtonActive(true);
      }
    }
  };

  return (
    <EditTaskGroupFormWrapper>
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
          label="This group of tasks is ON"
        />
        <TextField
          autoFocus
          defaultValue={taskGroupName}
          id="taskGroupNameToBeSaved"
          inputRef={taskGroupNameInputRef}
          label="Task Grouping Name"
          margin="dense"
          name="taskGroupName"
          onChange={() => updateSaveButton()}
          placeholder="Name of sequence of tasks"
          variant="outlined"
        />
        <TextField
          defaultValue={taskGroupDescription}
          id="taskGroupDescriptionToBeSaved"
          inputRef={taskGroupDescriptionInputRef}
          label="Description of this task grouping"
          margin="dense"
          multiline
          name="taskGroupDescription"
          onChange={() => updateSaveButton()}
          placeholder="Task grouping description"
          rows={6}
          variant="outlined"
        />
        <AssignTasksToPersonHeader>
          Assign tasks in this grouping when:
        </AssignTasksToPersonHeader>
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={assignIfOfferDecisionNeeded}
              className={classes.checkboxRoot}
              color="primary"
              id="assignIfOfferDecisionNeededToBeSaved"
              name="assignIfOfferDecisionNeeded"
              onChange={(event) => {
                setAssignIfOfferDecisionNeeded(event.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Hiring decision needed"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={assignIfOfferApproved}
              className={classes.checkboxRoot}
              color="primary"
              id="assignIfOfferApprovedToBeSaved"
              name="assignIfOfferApproved"
              onChange={(event) => {
                setAssignIfOfferApproved(event.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Hiring manager wants to hire"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={assignIfOfferWillNotBeMade}
              className={classes.checkboxRoot}
              color="primary"
              id="assignIfOfferWillNotBeMadeToBeSaved"
              name="assignIfOfferWillNotBeMade"
              onChange={(event) => {
                setAssignIfOfferWillNotBeMade(event.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Offer will not be made"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={assignIfOfferQuestionnaireSent}
              className={classes.checkboxRoot}
              color="primary"
              id="assignIfOfferQuestionnaireSentToBeSaved"
              name="assignIfOfferQuestionnaireSent"
              onChange={(event) => {
                setAssignIfOfferQuestionnaireSent(event.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Offer questionnaire has been sent"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={assignIfOfferQuestionnaireAnswered}
              className={classes.checkboxRoot}
              color="primary"
              id="assignIfOfferQuestionnaireAnsweredToBeSaved"
              name="assignIfOfferQuestionnaireAnswered"
              onChange={(event) => {
                setAssignIfOfferQuestionnaireAnswered(event.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Offer questionnaire has been answered"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={assignIfQuestionnaireAnswered}
              className={classes.checkboxRoot}
              color="primary"
              id="assignIfQuestionnaireAnsweredToBeSaved"
              name="assignIfQuestionnaireAnswered"
              onChange={(event) => {
                setAssignIfQuestionnaireAnswered(event.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Questionnaire has been answered"
        />
        <TextField
          classes={assignIfQuestionnaireAnswered ? {} : { root: classes.hideThisField }}
          value={questionnaireId}
          id="questionnaireIdToBeSaved"
          label="Questionnaire ID (If needed)"
          margin="dense"
          name="questionnaireId"
          onChange={(event) => {
            setQuestionnaireId(event.target.value);
            updateSaveButton();
          }}
          placeholder="Id of the questionnaire to be completed"
          variant="outlined"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={assignIfEmailCreated}
              className={classes.checkboxRoot}
              color="primary"
              id="assignIfEmailCreatedToBeSaved"
              name="assignIfEmailCreated"
              onChange={(event) => {
                setAssignIfEmailCreated(event.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Email has been created"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={assignIfOfferLetterCreated}
              className={classes.checkboxRoot}
              color="primary"
              id="assignIfOfferLetterCreatedToBeSaved"
              name="assignIfOfferLetterCreated"
              onChange={(event) => {
                setAssignIfOfferLetterCreated(event.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Offer letter has been created"
        />
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={assignIfOfferLetterSigned}
              className={classes.checkboxRoot}
              color="primary"
              id="assignIfOfferLetterSignedToBeSaved"
              name="assignIfOfferLetterSigned"
              onChange={(event) => {
                setAssignIfOfferLetterSigned(event.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Offer letter has been signed"
        />
        <AssignTasksToPersonHeader>
          Further restrict to team members:
        </AssignTasksToPersonHeader>
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={taskGroupIsForTeam}
              className={classes.checkboxRoot}
              color="primary"
              id="taskGroupIsForTeamToBeSaved"
              name="taskGroupIsForTeam"
              onChange={(event) => {
                setTaskGroupIsForTeam(event.target.checked);
                updateSaveButton();
              }}
            />
          )}
          label="Only assign to members of these teams"
        />
        {linkedTeamIdList && linkedTeamIdList.length > 0 && (
          <div>
            {linkedTeamIdList.map((teamId) => {
              const team = teamDictByTeamId[teamId];
              return team ? (
                <TeamLinkRow>
                  <div key={teamId}>
                    {team.teamName}
                  </div>
                  <div>
                    &nbsp;
                    (
                    <SpanWithLinkStyle onClick={() => deleteTaskGroupTeamLink(teamId)}>
                      delete
                    </SpanWithLinkStyle>
                    )
                  </div>
                </TeamLinkRow>
              ) : null;
            })}
          </div>
        )}
        <FormControl
          variant="outlined"
          classes={taskGroupIsForTeam ? {} : { root: classes.hideThisField }}
          className={`${classes.formControl} ${classes.answerDropdown}`}
        >
          <InputLabel htmlFor="answer-type-dropdown">Team to add</InputLabel>
          <Select
            native
            variant="outlined"
            value={taskGroupTeamId}
            onChange={(event) => {
              setTaskGroupTeamId(event.target.value ? parseInt(event.target.value, 10) : -1);
              updateSaveButton();
            }}
            label="Team to add"
            inputProps={{
              name: 'taskGroupTeamId',
              id: 'taskGroupTeamIdToBeSaved',
            }}
          >
            <option value={-1}>-- Choose team --</option>
            {teamList.map((team) => (
              <option key={team.id} value={convertToInteger(team.id)}>
                {team.teamName}
              </option>
            ))}
          </Select>
        </FormControl>
        <Button
          classes={{ root: classes.saveTaskGroupButton }}
          color="primary"
          disabled={!saveButtonActive}
          variant="contained"
          onClick={saveTaskGroupForm}
        >
          Save Task Grouping
        </Button>
      </FormControl>
    </EditTaskGroupFormWrapper>
  );
};
EditTaskGroupForm.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  answerDropdown: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
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
  saveTaskGroupButton: {
    width: 300,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const AssignTasksToPersonHeader = styled('div')`
  margin-top: 24px;
  font-weight: bold;
`;

const CheckboxLabel = styled(FormControlLabel)`
  margin-bottom: 0 !important;
`;

const EditTaskGroupFormWrapper = styled('div')`
`;

const TeamLinkRow = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 12px;
`;

export default withStyles(styles)(EditTaskGroupForm);
