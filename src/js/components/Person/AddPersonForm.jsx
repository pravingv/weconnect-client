import { Button, Checkbox, FormControl, FormControlLabel, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import makeRequestParams from '../../react-query/makeRequestParams';
import { usePersonSaveMutation } from '../../react-query/mutations';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import webAppConfig from '../../config';
import { isValidUSStateCode } from '../../utils/stateUtils';

const AddPersonForm = ({ classes }) => {  //  classes, teamId
  renderLog('AddPersonForm');
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const { mutate: personSave } = usePersonSaveMutation();

  const [teamId, setTeamId] = useState(-1);
  const [teamName, setTeamName] = useState('');
  const [saveButtonActive, setSaveButtonActive] = React.useState(false);
  const [viewerIsOnHrTeam, setViewerIsOnHrTeam] = useState(false);

  const emailInputRef = useRef('');
  const firstNameInputRef = useRef('');
  const jazzHrUrlInputRef = useRef('');
  const jobTitleInputRef = useRef('');
  const lastNameInputRef = useRef('');
  const locationInputRef = useRef('');
  const phoneNumberInputRef = useRef('');
  const statusOfferApprovedInputRef = useRef(false);
  const statusOfferDecisionNeededSetFalseInputRef = useRef(false);
  const statusOfferLetterSignedInputRef = useRef(false);

  useEffect(() => {  // Replaces onAppObservableStoreChange and will be called whenever the context value changes
    // console.log('AddPersonForm: Context value changed:', true);
    if (getAppContextValue('addPersonDrawerTeam')) {
      setTeamId(getAppContextValue('addPersonDrawerTeam').id);
      setTeamName(getAppContextValue('addPersonDrawerTeam').teamName);
    }
  }, [getAppContextValue]);

  useEffect(() => {
    setViewerIsOnHrTeam(viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights));
  }, [viewerAccessRights]);

  const saveNewPerson = () => {
    const data = {
      emailPersonal: emailInputRef.current.value,
      firstName: firstNameInputRef.current.value,
      jazzHrUrl: jazzHrUrlInputRef.current.value,
      jobTitle: jobTitleInputRef.current.value,
      lastName: lastNameInputRef.current.value,
      location: locationInputRef.current.value,
      phoneNumber: phoneNumberInputRef.current.value,
      statusActive: true,
      statusOfferApproved: statusOfferApprovedInputRef.current.checked,
      statusOfferDecisionNeeded: !statusOfferDecisionNeededSetFalseInputRef.current.checked, // statusOfferDecisionNeeded reversed on purpose
      statusOfferLetterSigned: statusOfferLetterSignedInputRef.current.checked,
    };
    if (locationInputRef.current.value && locationInputRef.current.value.length) {
      const stateCode = locationInputRef.current.value.split(', ')[1];
      if (stateCode && stateCode.length === 2 && isValidUSStateCode(stateCode)) {
        data.stateCode = stateCode.toUpperCase();
      }
    }
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
        <TextField
          id="phoneNumberToBeSaved"
          inputRef={phoneNumberInputRef}
          label="Phone number"
          margin="dense"
          name="phoneNumberToBeSaved"
          onChange={() => updateSaveButton()}
          placeholder="Phone number"
          variant="outlined"
        />
        <TextField
          id="jobTitleToBeSaved"
          inputRef={jobTitleInputRef}
          label={`Job Title (at ${webAppConfig.ORGANIZATION_NAME})`}
          margin="dense"
          name="jobTitle"
          onChange={() => updateSaveButton()}
          placeholder={`Job Title here at ${webAppConfig.ORGANIZATION_NAME}`}
          variant="outlined"
        />
        <TextField
          id="locationToBeSaved"
          inputRef={locationInputRef}
          label="Location"
          margin="dense"
          name="location"
          onChange={() => updateSaveButton()}
          placeholder="City, State"
          variant="outlined"
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              className={classes.checkboxRoot}
              color="primary"
              id="statusOfferDecisionNeededSetFalseToBeSaved"
              inputRef={statusOfferDecisionNeededSetFalseInputRef}
              name="statusOfferDecisionNeededSetFalse"
              onChange={() => updateSaveButton()}
            />
          )}
          label="Invitation to speak with hiring manager sent"
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              className={classes.checkboxRoot}
              color="primary"
              id="statusOfferApprovedToBeSaved"
              inputRef={statusOfferApprovedInputRef}
              name="statusOfferApproved"
              onChange={() => updateSaveButton()}
            />
          )}
          label="Hiring manager wants to make offer"
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              className={classes.checkboxRoot}
              color="primary"
              id="statusOfferLetterSignedToBeSaved"
              inputRef={statusOfferLetterSignedInputRef}
              name="statusOfferLetterSigned"
              onChange={() => updateSaveButton()}
            />
          )}
          label="Has signed offer letter"
        />
        <ButtonWrapper>
          <Button
            classes={{ root: classes.saveNewPersonButton }}
            color="primary"
            disabled={!saveButtonActive}
            variant="contained"
            onClick={saveNewPerson}
          >
            Save New Person
          </Button>
        </ButtonWrapper>
      </FormControl>
    </AddPersonFormWrapper>
  );
};
AddPersonForm.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  checkboxRoot: {
    paddingTop: 0,
    paddingLeft: '9px',
    paddingBottom: 0,
  },
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

const ButtonWrapper = styled('div')`
  background-color: #fff;
  bottom: 0;
  padding: 8px 0;
  position: sticky;
  width: 100%;
  margin-bottom: 24px;
  z-index: 1;
`;

const CheckboxLabel = styled(FormControlLabel)`
  margin-bottom: 0 !important;
`;

export default withStyles(styles)(AddPersonForm);
