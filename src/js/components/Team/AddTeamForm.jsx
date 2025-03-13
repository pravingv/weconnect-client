import { Button, FormControl, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';


const AddTeamForm = ({ classes }) => {
  renderLog('AddTeamForm');
  const { getAppContextValue, setAppContextValue } = useConnectAppContext();

  const teamNameInputRef = useRef('');
  const queryClient = useQueryClient();
  const [team] = useState(getAppContextValue('teamForAddTeamDrawer'));
  const [teamNameCached, setTeamNameCached] = useState(team && team.teamName);
  const [errorText, setErrorText] = useState('');

  const saveTeamMutation = useMutation({
    mutationFn: () => weConnectQueryFn(['team-save'], {
      teamName: teamNameCached,
      teamNameChanged: true,
      teamId: team ? team.id : '-1',
    }, METHOD.GET),
    onSuccess: () => {
      console.log('--------- saveTeamMutation addTeamForm mutated ---------');
      queryClient.invalidateQueries(['team-list-retrieve']).then(() => {});
    },
  });

  const saveNewTeam = () => {
    const teamName = teamNameInputRef.current.value;
    if (teamName.length === 0) {
      setErrorText('Enter a valid team name');
      return;
    }
    setErrorText('');
    setTeamNameCached(teamName);
    console.log('saveNewTeam data:', teamName);
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
          defaultValue={teamNameCached}
          id="teamNameToBeSaved"
          inputRef={teamNameInputRef}
          label="Team Name"
          name="teamNameToBeSaved"
          margin="dense"
          placeholder="Team Name"
          variant="outlined"
        />
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

const AddTeamFormWrapper = styled('div')`
`;

export default withStyles(styles)(AddTeamForm);
