import { Button, Checkbox, FormControl, FormControlLabel, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { DEPARTMENT_LIST } from '../../constants/DepartmentConstants';

const normalizeDepartments = (departments) => {
  if (Array.isArray(departments)) {
    return departments;
  }

  if (typeof departments === 'string') {
    return departments
      .split(',')
      .map((department) => department.trim())
      .filter(Boolean);
  }

  return [];
};

const getTeamId = (team) => {
  if (!team) return -1;
  return team.teamId || team.id || -1;
};


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
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (team && team.teamName) {
      setTeamNameCached(team.teamName);
      setIsC3Nonprofit(team.isC3Nonprofit || false);
      setIsC4Nonprofit(team.isC4Nonprofit || false);
      setSelectedDepartments(normalizeDepartments(team.departments));
    } else {
      setTeamNameCached('');
      setIsC3Nonprofit(false);
      setIsC4Nonprofit(false);
      setSelectedDepartments([]);
    }
  }, [team?.teamId, team?.id]);

  const saveTeamMutation = useMutation({
    mutationFn: () => weConnectQueryFn('team-save', {
      teamName: teamNameCached,
      teamNameChanged: true,
      isC3NonprofitChanged: true,
      isC4NonprofitChanged: true,
      isC3Nonprofit,
      isC4Nonprofit,
      departments: normalizeDepartments(selectedDepartments),
      departmentsChanged: true,
      teamId: getTeamId(team),
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
            control={(
              <Checkbox
                checked={isC3Nonprofit}
                onChange={(e) => setIsC3Nonprofit(e.target.checked)}
                name="isC3Nonprofit"
              />
            )}
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
        <DepartmentSection>
          <DepartmentLabel>Departments</DepartmentLabel>
          <CheckboxesWrapper>
            {DEPARTMENT_LIST.filter(dept => dept !== 'All teams').map((dept) => (
              <FormControlLabel
                key={dept}
                control={
                  <Checkbox
                    checked={selectedDepartments.includes(dept)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDepartments([...selectedDepartments, dept]);
                      } else {
                        setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                      }
                    }}
                    name={dept}
                  />
                }
                label={dept}
              />
            ))}
          </CheckboxesWrapper>
        </DepartmentSection>
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

const DepartmentSection = styled('div')`
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
`;

const DepartmentLabel = styled('div')`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1e6fb9;
`;

const AddTeamFormWrapper = styled('div')`
`;

export default withStyles(styles)(AddTeamForm);
