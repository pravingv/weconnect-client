import { Button, Checkbox, FormControl, FormControlLabel, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';


const AddTeamForm = ({ classes }) => {
  renderLog('AddTeamForm');
  try {
    const { getAppContextValue, setAppContextValue } = useConnectAppContext();

    const teamNameInputRef = useRef('');
    const queryClient = useQueryClient();
    const team = getAppContextValue('teamForAddTeamDrawer');
    const [teamNameCached, setTeamNameCached] = useState('');
    const [isC3Nonprofit, setIsC3Nonprofit] = useState(false);
    const [isC4Nonprofit, setIsC4Nonprofit] = useState(false);
    const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (team && team.teamName) {
      setTeamNameCached(team.teamName);
      setIsC3Nonprofit(team.isC3Nonprofit || false);
      setIsC4Nonprofit(team.isC4Nonprofit || false);
    } else {
      setTeamNameCached('');
      setIsC3Nonprofit(false);
      setIsC4Nonprofit(false);
    }
  }, [team?.id]);

  const saveTeamMutation = useMutation({
    mutationFn: () => weConnectQueryFn('team-save', {
      teamName: teamNameCached,
      teamNameChanged: true,
      isC3NonprofitChanged: true,
      isC4NonprofitChanged: true,
      isC3Nonprofit,
      isC4Nonprofit,
      teamId: team && team.id ? team.id : '-1',
    }, METHOD.GET),
    onSuccess: () => {
      // console.log('--------- saveTeamMutation addTeamForm mutated ---------');
      queryClient.invalidateQueries({ queryKey: ['team-list-retrieve'] }).then(() => {});
    },
  });

  const saveNewTeam = () => {
    if (teamNameCached.length === 0) {
      setErrorText('Enter a valid team name');
      return;
    }
    setErrorText('');
    // console.log('saveNewTeam data:', teamNameCached);
    saveTeamMutation.mutate();
    setAppContextValue('addTeamDrawerOpen', false);
    setAppContextValue('addTeamDrawerLabel', '');
  };

  return (
    <AddTeamFormWrapper>
      <ErrorTeamLine>{errorText}</ErrorTeamLine>
      <FormControl classes={{ root: classes.formControl }}>
        <TextField
          autoFocus
          value={teamNameCached}
          onChange={(e) => setTeamNameCached(e.target.value)}
          id="teamNameToBeSaved"
          inputRef={teamNameInputRef}
          label="Team Name"
          name="teamNameToBeSaved"
          margin="dense"
          placeholder="Team Name"
          variant="outlined"
        />
        <CheckboxesWrapper>
          <FormControlLabel
            control={
              <Checkbox
                checked={isC3Nonprofit}
                onChange={(e) => setIsC3Nonprofit(e.target.checked)}
                name="isC3Nonprofit"
              />
            }
            label="C3 Nonprofit"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isC4Nonprofit}
                onChange={(e) => setIsC4Nonprofit(e.target.checked)}
                name="isC4Nonprofit"
              />
            }
            label="C4 Nonprofit"
          />
        </CheckboxesWrapper>
        <Button
          classes={{ root: classes.saveNewTeamButton }}
          color="primary"
          onClick={saveNewTeam}
          variant="contained"
        >
          {team ? 'Save Team' : 'Save New Team'}
        </Button>
      </FormControl>
    </AddTeamFormWrapper>
  );
  } catch (error) {
    console.error('Error in AddTeamForm:', error);
    return (
      <AddTeamFormWrapper>
        <ErrorTeamLine>Error loading form: {error.message}</ErrorTeamLine>
      </AddTeamFormWrapper>
    );
  }
};
AddTeamForm.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  formControl: {
    width: '100%',
  },
  saveNewTeamButton: {
    width: 300,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const ErrorTeamLine = styled('div')`
  fontWeight: 800;
  paddingBottom: '10px';
  color: coral;
`;

const CheckboxesWrapper = styled('div')`
  display: flex;
  gap: 20px;
  margin: 15px 0;
  flex-wrap: wrap;
`;

const AddTeamFormWrapper = styled('div')`
`;

export default withStyles(styles)(AddTeamForm);
