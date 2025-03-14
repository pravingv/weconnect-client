import { Button, FormControl, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import makeRequestParams from '../../react-query/makeRequestParams';
import { usePersonSaveMutation } from '../../react-query/mutations';

const AddPersonForm = ({ classes }) => {  //  classes, teamId
  renderLog('AddPersonForm');
  const { getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { mutate: personSave } = usePersonSaveMutation();

  const [teamId, setTeamId] = useState(-1);
  const [teamName, setTeamName] = useState('');
  const [saveButtonActive, setSaveButtonActive] = React.useState(false);

  const emailInputRef = useRef('');
  const firstNameInputRef = useRef('');
  const jazzHrUrlInputRef = useRef('');
  const lastNameInputRef = useRef('');

  useEffect(() => {  // Replaces onAppObservableStoreChange and will be called whenever the context value changes
    // console.log('AddPersonForm: Context value changed:', true);
    if (getAppContextValue('addPersonDrawerTeam')) {
      setTeamId(getAppContextValue('addPersonDrawerTeam').id);
      setTeamName(getAppContextValue('addPersonDrawerTeam').teamName);
    }
  }, [getAppContextValue]);


  const saveNewPerson = () => {
    const data = {
      firstName: firstNameInputRef.current.value,
      jazzHrUrl: jazzHrUrlInputRef.current.value,
      lastName: lastNameInputRef.current.value,
      emailPersonal: emailInputRef.current.value,
    };
    const plainParams = {
      personId: -1,
      teamId,
      teamName,
    };
    personSave(makeRequestParams(plainParams, data));
    setAppContextValue('addPersonDrawerOpen', false);
    setAppContextValue('addPersonDrawerLabel', '');
    setAppContextValue('addPersonDrawerTeam', undefined);
  };

  const updateSaveButton = () => {
    if (firstNameInputRef.current.value && firstNameInputRef.current.value.length &&
      lastNameInputRef.current.value && lastNameInputRef.current.value.length &&
      emailInputRef.current.value && emailInputRef.current.value.length) {
      if (!saveButtonActive) {
        setSaveButtonActive(true);
      }
    }
  };

  return (
    <AddPersonFormWrapper>
      <FormControl classes={{ root: classes.formControl }}>
        <TextField
          // classes={{ root: classes.textField }} // Not working yet
          autoFocus
          id="firstNameToBeSaved"
          inputRef={firstNameInputRef}
          label="First Name"
          margin="dense"
          name="firstNameToBeSaved"
          onChange={() => updateSaveButton()}
          placeholder="First Name"
          variant="outlined"
        />
        <TextField
          // classes={{ root: classes.textField }} // Not working yet
          id="lastNameToBeSaved"
          inputRef={lastNameInputRef}
          label="Last Name"
          margin="dense"
          name="lastNameToBeSaved"
          onChange={() => updateSaveButton()}
          placeholder="Last Name"
          variant="outlined"
        />
        <TextField
          // classes={{ root: classes.textField }} // Not working yet
          id="emailPersonalToBeSaved"
          inputRef={emailInputRef}
          label="Email Address, Personal"
          margin="dense"
          name="emailPersonalToBeSaved"
          onChange={() => updateSaveButton()}
          placeholder="Email Address, Personal"
          variant="outlined"
        />
        <TextField
          id="jazzHrUrlToBeSaved"
          inputRef={jazzHrUrlInputRef}
          label="JazzHR Profile URL"
          margin="dense"
          name="jazzHrUrlToBeSaved"
          onChange={() => updateSaveButton()}
          placeholder="Profile URL on JazzHR"
          variant="outlined"
        />
        <Button
          classes={{ root: classes.saveNewPersonButton }}
          color="primary"
          disabled={!saveButtonActive}
          variant="contained"
          onClick={saveNewPerson}
        >
          Save New Person
        </Button>
      </FormControl>
    </AddPersonFormWrapper>
  );
};
AddPersonForm.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  formControl: {
    width: '100%',
  },
  saveNewPersonButton: {
    width: 300,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const AddPersonFormWrapper = styled('div')`
`;

export default withStyles(styles)(AddPersonForm);
