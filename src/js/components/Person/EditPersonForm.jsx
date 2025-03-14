import { Button, FormControl, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import webAppConfig from '../../config';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import makeRequestParams from '../../react-query/makeRequestParams';
import { usePersonSaveMutation } from '../../react-query/mutations';
import { SpanWithLinkStyle } from '../Style/linkStyles';
// import { useGetPersonById, usePersonSave } from '../../models/PersonModel';

const EditPersonForm = ({ classes }) => {
  renderLog('EditPersonForm');
  const { getAppContextValue } = useConnectAppContext();
  const { mutate: personSave } = usePersonSaveMutation();
  // const { mutate: personSave } = usePersonSave();

  const [saveButtonActive, setSaveButtonActive] = useState(false);
  const [showEmailPreferred, setShowEmailPreferred] = useState(false);
  const [initialPerson] = useState(getAppContextValue('personDrawersPerson'));
  // const [initialPerson] = useState(useGetPersonById(getAppContextValue('personDrawersPersonId')));
  const [activePerson, setActivePerson] = useState({ ...initialPerson });

  const emailOfficialInputRef = useRef('');
  const emailPersonalInputRef = useRef('');
  const emailPreferredInputRef = useRef('');
  const firstNameInputRef = useRef('');
  const firstNamePreferredInputRef = useRef('');
  const jazzHrUrlInputRef = useRef('');
  const jobTitleInputRef = useRef('');
  const lastNameInputRef = useRef('');
  const linkedInUrlInputRef = useRef('');
  const locationInputRef = useRef('');
  const stateCodeInputRef = useRef('');

  const savePerson = () => {
    activePerson.emailOfficial = emailOfficialInputRef.current.value;
    activePerson.emailPersonal = emailPersonalInputRef.current.value;
    activePerson.emailPreferred = emailPreferredInputRef.current.value;
    activePerson.firstName = firstNameInputRef.current.value;
    activePerson.firstNamePreferred = firstNamePreferredInputRef.current.value;
    activePerson.jazzHrUrl = jazzHrUrlInputRef.current.value;
    activePerson.jobTitle = jobTitleInputRef.current.value;
    activePerson.lastName = lastNameInputRef.current.value;
    activePerson.linkedInUrl = linkedInUrlInputRef.current.value;
    activePerson.location = locationInputRef.current.value;
    activePerson.stateCode = stateCodeInputRef.current.value;
    setActivePerson(activePerson);

    // console.log('savePerson data:', JSON.stringify(activePerson));
    const data = {};
    Object.keys(activePerson).forEach((key) => {
      const initialValue = initialPerson[key] || '';
      const activeValue = activePerson[key] || '';
      if (initialValue !== activeValue) {
        data[key] = activeValue;
      }
    });
    const plainParams = {
      personId: activePerson.id,
    };

    personSave(makeRequestParams(plainParams, data));
    setSaveButtonActive(false);
  };

  return (
    <EditPersonFormWrapper>
      <FormControl classes={{ root: classes.formControl }}>
        <TextField
          autoFocus
          defaultValue={activePerson.firstName || ''}
          id="firstNameToBeSaved"
          inputRef={firstNameInputRef}
          label="First (Legal) Name"
          margin="dense"
          name="firstName"
          onChange={() => setSaveButtonActive(true)}
          placeholder="First Name (legal name)"
          variant="outlined"
        />
        <TextField
          defaultValue={activePerson.firstNamePreferred || ''}
          id="firstNamePreferredToBeSaved"
          inputRef={firstNamePreferredInputRef}
          label="First (Preferred) if different from legal"
          margin="dense"
          name="firstNamePreferred"
          onChange={() => setSaveButtonActive(true)}
          placeholder="First Name to use in meetings"
          variant="outlined"
        />
        <TextField
          defaultValue={activePerson.lastName || ''}
          id="lastNameToBeSaved"
          inputRef={lastNameInputRef}
          label="Last Name"
          margin="dense"
          name="lastName"
          onChange={() => setSaveButtonActive(true)}
          placeholder="Last Name"
          variant="outlined"
        />
        <TextField
          defaultValue={activePerson.emailPersonal || ''}
          id="emailPersonalToBeSaved"
          inputRef={emailPersonalInputRef}
          label="Email Address, Personal"
          margin="dense"
          name="emailPersonal"
          onChange={() => setSaveButtonActive(true)}
          placeholder="Email Address, Personal"
          variant="outlined"
        />
        <TextField
          defaultValue={activePerson.emailOfficial || ''}
          id="emailOfficialToBeSaved"
          inputRef={emailOfficialInputRef}
          label={`Email Address, ${webAppConfig.ORGANIZATION_NAME} Official`}
          margin="dense"
          name="emailOfficial"
          onChange={() => setSaveButtonActive(true)}
          placeholder={`${webAppConfig.ORGANIZATION_NAME} email address`}
          variant="outlined"
        />
        <div>
          {!(showEmailPreferred) && (
            <SpanWithLinkStyle onClick={() => setShowEmailPreferred(true)}>
              Edit preferred: {activePerson.emailPreferred || activePerson.emailOfficial}
            </SpanWithLinkStyle>
          )}
        </div>
        <TextField
          defaultValue={activePerson.emailPreferred || ''}
          id="emailPreferredToBeSaved"
          inputRef={emailPreferredInputRef}
          label="Email Address, Preferred"
          margin="dense"
          name="emailPreferred"
          onChange={() => setSaveButtonActive(true)}
          placeholder="Preferred Email Address"
          sx={!showEmailPreferred && {
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
          variant="outlined"
        />
        <TextField
          defaultValue={activePerson.jazzHrUrl || ''}
          id="jazzHrUrlToBeSaved"
          inputRef={jazzHrUrlInputRef}
          label="JazzHR Profile URL"
          margin="dense"
          name="jazzHrUrlToBeSaved"
          onChange={() => setSaveButtonActive(true)}
          placeholder="Profile URL on JazzHR"
          variant="outlined"
        />
        <TextField
          defaultValue={activePerson.location || ''}
          id="locationToBeSaved"
          inputRef={locationInputRef}
          label="Location"
          margin="dense"
          name="location"
          onChange={() => setSaveButtonActive(true)}
          placeholder="City, State"
          variant="outlined"
        />
        <TextField
          defaultValue={activePerson.stateCode || ''}
          id="stateCodeToBeSaved"
          inputRef={stateCodeInputRef}
          label="State Code"
          margin="dense"
          name="stateCode"
          onChange={() => setSaveButtonActive(true)}
          placeholder="State Code (2 characters)"
          variant="outlined"
        />
        <TextField
          defaultValue={activePerson.jobTitle || ''}
          id="jobTitleToBeSaved"
          inputRef={jobTitleInputRef}
          label={`Job Title (at ${webAppConfig.ORGANIZATION_NAME})`}
          margin="dense"
          name="jobTitle"
          onChange={() => setSaveButtonActive(true)}
          placeholder={`Job Title here at ${webAppConfig.ORGANIZATION_NAME}`}
          variant="outlined"
        />
        <TextField
          defaultValue={activePerson.linkedInUrl || ''}
          id="linkedInUrlToBeSaved"
          inputRef={linkedInUrlInputRef}
          label="LinkedIn URL"
          margin="dense"
          name="linkedInUrlToBeSaved"
          onChange={() => setSaveButtonActive(true)}
          placeholder="LinkedIn URL"
          variant="outlined"
        />
        <Button
          classes={{ root: classes.savePersonButton }}
          color="primary"
          disabled={!saveButtonActive}
          onClick={savePerson}
          variant="contained"
        >
          Save Person
        </Button>
      </FormControl>
    </EditPersonFormWrapper>
  );
};
EditPersonForm.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  formControl: {
    width: '100%',
  },
  savePersonButton: {
    width: 300,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const EditPersonFormWrapper = styled('div')`
`;

export default withStyles(styles)(EditPersonForm);
