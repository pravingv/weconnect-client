import { Button, Checkbox, FormControl, FormControlLabel, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import webAppConfig from '../../config';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDoFromList } from '../../models/AuthModel';
import makeRequestParams from '../../react-query/makeRequestParams';
import { usePersonSaveMutation } from '../../react-query/mutations';
import { SpanWithLinkStyle } from '../Style/linkStyles';
// import { useGetPersonById, usePersonSave } from '../../models/PersonModel';

const EditPersonForm = ({ classes }) => {
  renderLog('EditPersonForm');
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const { mutate: personSave } = usePersonSaveMutation();
  // const { mutate: personSave } = usePersonSave();

  const [saveButtonActive, setSaveButtonActive] = useState(false);
  const [showEmailPreferred, setShowEmailPreferred] = useState(false);
  const [showFirstNamePreferred, setShowFirstNamePreferred] = useState(false);
  const [initialPerson] = useState(getAppContextValue('personDrawersPerson'));
  // const [initialPerson] = useState(useGetPersonById(getAppContextValue('personDrawersPersonId')));
  const [activePerson, setActivePerson] = useState({ ...initialPerson });
  const [viewerIsOnHrTeam, setViewerIsOnHrTeam] = useState(false);

  const birthdayMonthAndDayInputRef = useRef('');
  const dateEndDateInputRef = useRef('');
  const dateStartDateInputRef = useRef('');
  const emailOfficialInputRef = useRef('');
  const emailPersonalInputRef = useRef('');
  const emailPreferredInputRef = useRef('');
  const firstNameInputRef = useRef('');
  const firstNamePreferredInputRef = useRef('');
  const hoursPerWeekEstimateInputRef = useRef('');
  const jazzHrUrlInputRef = useRef('');
  const jobTitleInputRef = useRef('');
  const lastNameInputRef = useRef('');
  const linkedInUrlInputRef = useRef('');
  const locationInputRef = useRef('');
  const stateCodeInputRef = useRef('');
  const statusOfferLetterSignedInputRef = useRef(false);

  useEffect(() => {
    setViewerIsOnHrTeam(viewerCanSeeOrDoFromList(['canEditPersonAnyone'], viewerAccessRights));
  }, [viewerAccessRights]);

  const getDateDefaultValue = (dateString) => {
    if (!dateString) return null;
    const date = dayjs(dateString);
    return date.isValid() ? date : null;
  };

  const savePerson = () => {
    activePerson.emailPersonal = emailPersonalInputRef.current.value;
    activePerson.emailPreferred = emailPreferredInputRef.current.value;
    activePerson.firstName = firstNameInputRef.current.value;
    activePerson.firstNamePreferred = firstNamePreferredInputRef.current.value;
    activePerson.lastName = lastNameInputRef.current.value;
    activePerson.linkedInUrl = linkedInUrlInputRef.current.value;
    activePerson.location = locationInputRef.current.value;
    activePerson.stateCode = stateCodeInputRef.current.value;
    if (viewerIsOnHrTeam) {
      // The fields that you need to be in HR to update
      activePerson.birthdayMonthAndDay = birthdayMonthAndDayInputRef.current.value;
      activePerson.dateEndDate = dateEndDateInputRef.current.value;
      activePerson.dateStartDate = dateStartDateInputRef.current.value;
      activePerson.emailOfficial = emailOfficialInputRef.current.value;
      activePerson.hoursPerWeekEstimate = hoursPerWeekEstimateInputRef.current.value;
      activePerson.jazzHrUrl = jazzHrUrlInputRef.current.value;
      activePerson.jobTitle = jobTitleInputRef.current.value;
      activePerson.statusOfferLetterSigned = statusOfferLetterSignedInputRef.current.checked;
    }
    // console.log('savePerson data:', JSON.stringify(activePerson));
    // console.log('dateStartDate:', dateStartDate);
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
        <div>
          {!(showFirstNamePreferred) && (
            <SpanWithLinkStyle onClick={() => setShowFirstNamePreferred(true)}>
              Edit preferred name ({activePerson.firstNamePreferred || activePerson.firstName || 'none'})
            </SpanWithLinkStyle>
          )}
        </div>
        <TextField
          defaultValue={activePerson.firstNamePreferred || ''}
          id="firstNamePreferredToBeSaved"
          inputRef={firstNamePreferredInputRef}
          label="First (Preferred) if different from legal"
          margin="dense"
          name="firstNamePreferred"
          onChange={() => setSaveButtonActive(true)}
          placeholder="First Name to use in meetings"
          sx={!showFirstNamePreferred && {
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
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
        <div>
          {!(showEmailPreferred) && (
            <SpanWithLinkStyle onClick={() => setShowEmailPreferred(true)}>
              Edit preferred email ({activePerson.emailPreferred || activePerson.emailOfficial || 'none'})
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
        {viewerIsOnHrTeam && (
          <HRTeamFieldsTitle>
            Profile Fields Only HR Team Can Edit
          </HRTeamFieldsTitle>
        )}
        <CheckboxLabel
          classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.statusOfferLetterSigned || false}
              className={classes.checkboxRoot}
              color="primary"
              id="statusOfferLetterSignedToBeSaved"
              inputRef={statusOfferLetterSignedInputRef}
              name="statusOfferLetterSigned"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  statusOfferLetterSigned: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`${activePerson.firstNamePreferred || activePerson.firstName} has signed ${webAppConfig.ORGANIZATION_NAME} offer letter`}
        />
        <TextField
          classes={viewerIsOnHrTeam ? { root: classes.showThisField } : { root: classes.hideThisField }}
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
          classes={viewerIsOnHrTeam ? { root: classes.showThisField } : { root: classes.hideThisField }}
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
        <TextField
          classes={viewerIsOnHrTeam ? { root: classes.showThisField } : { root: classes.hideThisField }}
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateOptionsWrapper
            style={viewerIsOnHrTeam ? {} : { display: 'none' }}
          >
            <DateWrapper>
              <DatePicker
                defaultValue={getDateDefaultValue(activePerson.dateStartDate)}
                inputRef={dateStartDateInputRef}
                label="Start Date"
                onChange={() => {
                  setSaveButtonActive(true);
                }}
                renderInput={() => (
                  <TextField margin="dense" />
                )}
              />
            </DateWrapper>
            <DateWrapper>
              <DatePicker
                defaultValue={getDateDefaultValue(activePerson.dateEndDate)}
                inputRef={dateEndDateInputRef}
                label="End Date"
                onChange={() => {
                  setSaveButtonActive(true);
                }}
                renderInput={() => (
                  <TextField margin="dense" />
                )}
              />
            </DateWrapper>
          </DateOptionsWrapper>
        </LocalizationProvider>
        <TextField
          classes={viewerIsOnHrTeam ? { root: classes.showThisField } : { root: classes.hideThisField }}
          defaultValue={activePerson.hoursPerWeekEstimate || ''}
          id="hoursPerWeekEstimateToBeSaved"
          inputRef={hoursPerWeekEstimateInputRef}
          label="Hours Per Week Estimate (One number)"
          margin="dense"
          name="hoursPerWeekEstimateToBeSaved"
          onChange={() => setSaveButtonActive(true)}
          placeholder="Please enter single number (not a range)"
          variant="outlined"
        />
        <TextField
          classes={viewerIsOnHrTeam ? { root: classes.showThisField } : { root: classes.hideThisField }}
          defaultValue={activePerson.birthdayMonthAndDay || ''}
          id="birthdayMonthAndDayToBeSaved"
          inputRef={birthdayMonthAndDayInputRef}
          label="Birthday Month and Day, Do not include year"
          margin="dense"
          name="birthdayMonthAndDayToBeSaved"
          onChange={() => setSaveButtonActive(true)}
          placeholder="Month and Day of Birth (Do not include year)"
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
  checkboxLabel: {
    marginTop: 2,
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
  showThisField: {},
  savePersonButton: {
    bottom: 0,
    position: 'sticky',
    width: '330px',
    zIndex: 20,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const CheckboxLabel = styled(FormControlLabel)`
  margin-bottom: 0 !important;
`;

const DateOptionsWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DateWrapper = styled('div')`
  margin-right: 4px;
`;

const EditPersonFormWrapper = styled('div')`
  margin: 0 auto;
  max-width: 600px;
  padding-bottom: 40px;
`;

const HRTeamFieldsTitle = styled('div')`
  margin-top: 24px;
  font-weight: bold;
`;

export default withStyles(styles)(EditPersonForm);
