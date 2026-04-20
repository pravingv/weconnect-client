import { ErrorOutline, Launch } from '@mui/icons-material';
import { Alert, Button, Checkbox, FormControl, FormControlLabel, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import PropTypes from 'prop-types';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { renderLog } from '../../common/utils/logging';
import webAppConfig from '../../config';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { makeRequestParamsDictionary } from '../../react-query/makeRequestParams';
import { usePersonSaveMutation } from '../../react-query/mutations';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import EmailOfficialManager from './EmailOfficialManager';
import PersonAvatar from './PersonAvatar';


dayjs.extend(utc);

const OpenExternalWebSite = React.lazy(() => import(/* webpackChunkName: 'OpenExternalWebSite' */ '../../common/components/Widgets/OpenExternalWebSite'));

const EditPersonForm = ({ classes }) => {
  renderLog('EditPersonForm');
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const { mutate: personSave } = usePersonSaveMutation(); // Alternate: usePersonSave();

  const [allOnboardingCheckboxesChecked, setAllOnboardingCheckboxesChecked] = useState(false);
  const [emailOfficialEdited, setEmailOfficialEdited] = useState(false);
  const [isEmailOfficialEditModeOn, setIsEmailOfficialEditModeOn] = useState(false);
  const [saveButtonActive, setSaveButtonActive] = useState(false);
  const [showEmailPreferred, setShowEmailPreferred] = useState(false);
  const [showFirstNamePreferred, setShowFirstNamePreferred] = useState(false);
  const [showCompletedOnboardingCheckboxes, setShowCompletedOnboardingCheckboxes] = useState(false);
  const [initialPerson] = useState(getAppContextValue('profileDrawerPerson'));
  // const [initialPerson] = useState(useGetPersonById(getAppContextValue('profileDrawerPersonId')));
  const [activePerson, setActivePerson] = useState({ ...initialPerson });
  const initialPersonTemp = getAppContextValue('profileDrawerPerson');
  const emailOfficialInitial = (initialPersonTemp) ? initialPersonTemp.emailOfficial || '' : '';
  const emailOfficialVerifiedInitial = (initialPersonTemp) ? initialPersonTemp.emailOfficialVerified || false : false;
  const [emailOfficialLocal, setEmailOfficialLocal] = useState(emailOfficialInitial);
  const [emailOfficialVerified, setEmailOfficialVerified] = useState(emailOfficialVerifiedInitial);
  const [viewerIsOnHrTeam, setViewerIsOnHrTeam] = useState(false);
  const [showAddSlackPhoto, setShowAddSlackPhoto] = useState(true);
  const [slackError, setSlackError] = useState('');
  const [dateStartError, setDateStartError] = useState('');
  const [dateEndError, setDateEndError] = useState('');

  const getDateDefaultValue = (dateString) => {
    if (!dateString) return null;
    // Parse as UTC date to avoid timezone shifts
    const date = dayjs.utc(dateString);
    return date.isValid() ? date : null;
  };
  const [dateStartDate, setDateStartDate] = useState(getDateDefaultValue(initialPerson.dateStartDate));
  const [dateEndDate, setDateEndDate] = useState(getDateDefaultValue(initialPerson.dateEndDate));

  const birthdayMonthAndDayInputRef = useRef('');
  const emailPersonalInputRef = useRef('');
  const emailPreferredInputRef = useRef('');
  const firstNameInputRef = useRef('');
  const firstNamePreferredInputRef = useRef('');
  const hoursPerWeekEstimateInputRef = useRef('');
  const isHiringManagerInputRef = useRef(false);
  const isInternInputRef = useRef(false);
  const isMonthlyDonorInputRef = useRef(false);
  const isTeamLeadInputRef = useRef(false);
  const phoneNumberInputRef = useRef('');
  const jazzHrUrlInputRef = useRef('');
  const jobTitleInputRef = useRef('');
  const lastNameInputRef = useRef('');
  const linkedInUrlInputRef = useRef('');
  const locationInputRef = useRef('');
  // const [slackImageLink, setSlackImageLink] = useState();
  const stateCodeInputRef = useRef('');
  const statusActiveInputRef = useRef(false);
  const statusAvailableForSpecialProjectsInputRef = useRef(false);
  const statusOfferApprovedInputRef = useRef(false);
  const statusOfferDecisionNeededSetFalseInputRef = useRef(false);
  const statusOfferLetterCreatedInputRef = useRef(false);
  const statusOfferLetterSignedInputRef = useRef(false);
  const statusOfferQuestionnaireAnsweredInputRef = useRef(false);
  const statusOfferQuestionnaireSentInputRef = useRef(false);
  const statusOfferWillNotBeMadeInputRef = useRef(false);
  const statusOnLeaveInputRef = useRef(false);
  const statusResignedInputRef = useRef(false);

  useEffect(() => {
    // statusOfferDecisionNeeded reversed on purpose
    setAllOnboardingCheckboxesChecked(!(activePerson.statusActive || !activePerson.statusOfferDecisionNeeded || activePerson.statusOfferApproved || activePerson.statusOfferQuestionnaireSent || activePerson.statusOfferQuestionnaireAnswered || activePerson.statusOfferLetterSigned || activePerson.statusOfferWillNotBeMade));
    setShowAddSlackPhoto(!(activePerson.slackHandle && activePerson.slackHandle.length > 0));
  }, [activePerson]);

  useEffect(() => {
    setViewerIsOnHrTeam(viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights));
  }, [viewerAccessRights]);

  // Date validation function
  const isValidDateFormat = (date) => {
    if (!date) return true; // Empty dates are valid
    // Check if date is a valid dayjs object
    return date && date.isValid();
  };

  const validateStartDate = (startDate) => {
    let startDateError = '';

    // Validate start date format
    if (startDate && !isValidDateFormat(startDate)) {
      startDateError = 'Invalid start date format. Use MM-DD-YYYY.';
      console.error('Start Date Validation Error:', startDateError);
    }

    setDateStartError(startDateError);
    return !startDateError;
  };

  const validateEndDate = (endDate, startDate) => {
    let endDateError = '';

    // Validate end date format
    if (endDate && !isValidDateFormat(endDate)) {
      endDateError = 'Invalid end date format. Use MM-DD-YYYY.';
      console.error('End Date Validation Error:', endDateError);
    }

    // Validate date order: end date should not be less than start date
    if (endDate && startDate && isValidDateFormat(endDate) && isValidDateFormat(startDate)) {
      if (endDate.isBefore(startDate)) {
        endDateError = 'End date cannot be before start date.';
        console.error('End Date Validation Error:', endDateError);
      }
    }

    setDateEndError(endDateError);
    return !endDateError;
  };

  // Validate end date when start date changes (for date order check)
  useEffect(() => {
    if (dateEndDate) {
      validateEndDate(dateEndDate, dateStartDate);
    }
  }, [dateStartDate]);

  const savePerson = (emailVerifiedOverride = null) => {
    // console.log('Saving person:', activePerson, ', emailVerifiedOverride: ', emailVerifiedOverride);
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
      // console.log('Saving dates:', {
      //   dateStartDate: dateStartDate ? dateStartDate.format('YYYY-MM-DD') : null,
      //   dateEndDate: dateEndDate ? dateEndDate.format('YYYY-MM-DD') : null,
      // });
      activePerson.dateEndDate = dateEndDate ? dateEndDate.utc().format('YYYY-MM-DD') : '';
      activePerson.dateStartDate = dateStartDate ? dateStartDate.utc().format('YYYY-MM-DD') : '';
      // console.log('dateStartDate:', dateStartDateInputRef.current.value, ', dateEndDate:', dateEndDateInputRef.current.value);
      activePerson.emailOfficial = emailOfficialLocal;
      activePerson.hoursPerWeekEstimate = hoursPerWeekEstimateInputRef.current.value;
      activePerson.emailOfficialVerified = emailVerifiedOverride !== null ? emailVerifiedOverride : emailOfficialVerified;
      if (emailOfficialVerified === true || emailVerifiedOverride === true) {
        activePerson.statusEmailCreated = true;
      }
      activePerson.isHiringManager = isHiringManagerInputRef.current.checked;
      activePerson.isIntern = isInternInputRef.current.checked;
      activePerson.isMonthlyDonor = isMonthlyDonorInputRef.current.checked;
      activePerson.isTeamLead = isTeamLeadInputRef.current.checked;
      activePerson.phoneNumber = phoneNumberInputRef.current.value;
      activePerson.jazzHrUrl = jazzHrUrlInputRef.current.value;
      activePerson.jobTitle = jobTitleInputRef.current.value;
      activePerson.statusOfferApproved = statusOfferApprovedInputRef.current.checked;
      activePerson.statusOfferDecisionNeeded = !statusOfferDecisionNeededSetFalseInputRef.current.checked; // statusOfferDecisionNeeded reversed on purpose
      activePerson.statusOfferLetterCreated = statusOfferLetterCreatedInputRef.current.checked;
      activePerson.statusOfferLetterSigned = statusOfferLetterSignedInputRef.current.checked;
      activePerson.statusOfferQuestionnaireAnswered = statusOfferQuestionnaireAnsweredInputRef.current.checked;
      activePerson.statusOfferQuestionnaireSent = statusOfferQuestionnaireSentInputRef.current.checked;
      activePerson.statusOfferWillNotBeMade = statusOfferWillNotBeMadeInputRef.current.checked;
    }
    // console.log('savePerson data:', JSON.stringify(activePerson));
    // console.log('dateStartDate:', dateStartDate);
    setActivePerson(activePerson);

    // console.log('savePerson data:', JSON.stringify(activePerson));
    const data = {};
    Object.keys(activePerson).forEach((key) => {
      const initialValue = (initialPerson[key] === false) ? false : initialPerson[key] || '';
      const activeValue = (activePerson[key] === false) ? false : activePerson[key] || '';
      if (initialValue !== activeValue) {
        data[key] = activeValue;
      }
    });
    const plainParams = {
      personId: activePerson.id,
    };
    // console.log('personSave plainParams:', plainParams);
    personSave(makeRequestParamsDictionary(plainParams, data));
    setAppContextValue('profileDrawerPerson', activePerson);
    if (emailVerifiedOverride === null || emailVerifiedOverride === undefined) {
      setSaveButtonActive(false);
      setAppContextValue('headerProfileDrawerOpen', false);
      setAppContextValue('profileDrawerPerson', undefined);
      setAppContextValue('profileDrawerPersonId', -1);
    }
  };

  const setEmailOfficialFromChild = (emailOfficial) => {
    setEmailOfficialLocal(emailOfficial);
    setIsEmailOfficialEditModeOn(false);
  };

  const addPhotoFromSlack = async () => {
    const { id } = activePerson;
    const data = await weConnectQueryFn('slack-add-person-images', { personId: id }, METHOD.POST);
    // console.log('SlackAddPersonImages', data);
    const slackImage48 = data?.singlePersonUpdated[0]?.slackImage48;
    setShowAddSlackPhoto(false);
    if (slackImage48) {
      activePerson.slackImage48 = slackImage48;
      setAppContextValue('temporarySlackImage', slackImage48);
      setSlackError('');
    } else {
      setSlackError('Slack did not return a member who matches this staff member\'s personal or offical email address.');
      console.log('SlackAddPersonImages error');
      setTimeout(() => {
        setSlackError('');
      }, 5000);
    }
  };

  const setEmailOfficialVerifiedFromChild = (emailOfficialVerifiedIncoming) => {
    // console.log('setEmailOfficialVerifiedFromChild emailOfficialVerifiedIncoming:', emailOfficialVerifiedIncoming);
    setEmailOfficialVerified(emailOfficialVerifiedIncoming);
    setSaveButtonActive(true);
  };

  const setEmailOfficialEditedFromChild = (isEmailOfficialEdited) => {
    setIsEmailOfficialEditModeOn(isEmailOfficialEdited);
    setEmailOfficialEdited(isEmailOfficialEdited);
  };

  const emailOfficialCanBeEdited = !(emailOfficialInitial) || isEmailOfficialEditModeOn;
  // console.log('activePerson:', activePerson);

  return (
    <EditPersonFormWrapper>
      {activePerson.slackImage48 && (
        <PersonAvatar
          id="personProfileImage"
          isAuthenticated
          slackImage={activePerson.slackImage48}
          styles={{ height: '96px', marginBottom: '10px', marginTop: '-16px', maxWidth: '96px', maxHeight: '96px', width: '96px' }}
        />
      )}
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
        <TextUnderInputField>
          {!(showFirstNamePreferred) && (
            <SpanWithLinkStyle onClick={() => setShowFirstNamePreferred(true)}>
              Edit preferred name ({activePerson.firstNamePreferred || activePerson.firstName || 'none'})
            </SpanWithLinkStyle>
          )}
        </TextUnderInputField>
        <TextField
          classes={showFirstNamePreferred ? { root: classes.showThisField } : { root: classes.hideThisField }}
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
        <TextUnderInputField>
          {!(showEmailPreferred) && (
            <SpanWithLinkStyle onClick={() => setShowEmailPreferred(true)}>
              Edit preferred email ({activePerson.emailPreferred || emailOfficialLocal || 'none'})
            </SpanWithLinkStyle>
          )}
        </TextUnderInputField>
        <TextUnderInputField>
          <SpanWithLinkStyle style={showAddSlackPhoto ? { opacity: '1' } : { opacity: '0.5' }} onClick={showAddSlackPhoto ? addPhotoFromSlack : () => {}}>
            Add Photo From Slack
          </SpanWithLinkStyle>
        </TextUnderInputField>
        {slackError.length > 0 && (
          <Alert icon={<ErrorOutline fontSize="inherit" />} severity="error">
            {slackError}
          </Alert>
        )}
        <TextField
          classes={showEmailPreferred ? { root: classes.showThisField } : { root: classes.hideThisField }}
          defaultValue={activePerson.emailPreferred || ''}
          id="emailPreferredToBeSaved"
          inputRef={emailPreferredInputRef}
          label="Email Address, Preferred"
          margin="dense"
          name="emailPreferred"
          onChange={() => setSaveButtonActive(true)}
          placeholder="Preferred Email Address"
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
        {activePerson.linkedInUrl && (
          <QuickLinkList>
            <QuickLink>
              <Suspense fallback={<></>}>
                <OpenExternalWebSite
                  linkIdAttribute="linkedInUrlId"
                  url={activePerson.linkedInUrl}
                  target="_blank"
                  body={(
                    <span>
                      LinkedIn profile
                      <LaunchStyled />
                    </span>
                  )}
                />
              </Suspense>
            </QuickLink>
          </QuickLinkList>
        )}
        {viewerIsOnHrTeam && (
          <HRTeamFieldsTitle>
            Profile Fields Only HR Team Can Edit
          </HRTeamFieldsTitle>
        )}
        {!allOnboardingCheckboxesChecked && (
          <div>
            {(showCompletedOnboardingCheckboxes) ? (
              <SpanWithLinkStyle onClick={() => setShowCompletedOnboardingCheckboxes(false)}>
                Hide completed onboarding checkboxes
              </SpanWithLinkStyle>
            ) : (
              <SpanWithLinkStyle onClick={() => setShowCompletedOnboardingCheckboxes(true)}>
                Show completed onboarding checkboxes
              </SpanWithLinkStyle>
            )}
          </div>
        )}
        <CheckboxLabel
          classes={viewerIsOnHrTeam && (!activePerson.statusActive || showCompletedOnboardingCheckboxes) ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.statusActive || false}
              className={classes.checkboxRoot}
              color="primary"
              id="statusActiveToBeSaved"
              inputRef={statusActiveInputRef}
              name="statusActive"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  statusActive: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`${activePerson.firstNamePreferred || activePerson.firstName} is active`}
        />
        <CheckboxLabel
          // The way we treat statusOfferDecisionNeeded is reversed on purpose
          classes={viewerIsOnHrTeam && (activePerson.statusOfferDecisionNeeded || showCompletedOnboardingCheckboxes) ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={!activePerson.statusOfferDecisionNeeded}
              className={classes.checkboxRoot}
              color="primary"
              id="statusOfferDecisionNeededSetFalseToBeSaved"
              inputRef={statusOfferDecisionNeededSetFalseInputRef}
              name="statusOfferDecisionNeededSetFalse"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  statusOfferDecisionNeeded: !event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`Invitation to speak with hiring manager sent to ${activePerson.firstNamePreferred || activePerson.firstName}`}
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam && (!activePerson.statusOfferApproved || showCompletedOnboardingCheckboxes) ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.statusOfferApproved || false}
              className={classes.checkboxRoot}
              color="primary"
              id="statusOfferApprovedToBeSaved"
              inputRef={statusOfferApprovedInputRef}
              name="statusOfferApproved"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  statusOfferApproved: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`Hiring manager wants to make offer to ${activePerson.firstNamePreferred || activePerson.firstName}`}
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam && ((!activePerson.statusOfferWillNotBeMade && !activePerson.statusOfferApproved) || showCompletedOnboardingCheckboxes) ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.statusOfferWillNotBeMade || false}
              className={classes.checkboxRoot}
              color="primary"
              id="statusOfferWillNotBeMadeToBeSaved"
              inputRef={statusOfferWillNotBeMadeInputRef}
              name="statusOfferWillNotBeMade"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  statusOfferWillNotBeMade: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`Offer will not be made to ${activePerson.firstNamePreferred || activePerson.firstName}`}
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam && (!activePerson.statusOfferQuestionnaireSent || showCompletedOnboardingCheckboxes) ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.statusOfferQuestionnaireSent || false}
              className={classes.checkboxRoot}
              color="primary"
              id="statusOfferQuestionnaireSentToBeSaved"
              inputRef={statusOfferQuestionnaireSentInputRef}
              name="statusOfferQuestionnaireSent"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  statusOfferQuestionnaireSent: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`Offer questionnaire sent to ${activePerson.firstNamePreferred || activePerson.firstName}`}
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam && (!activePerson.statusOfferQuestionnaireAnswered || showCompletedOnboardingCheckboxes) ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.statusOfferQuestionnaireAnswered || false}
              className={classes.checkboxRoot}
              color="primary"
              id="statusOfferQuestionnaireAnsweredToBeSaved"
              inputRef={statusOfferQuestionnaireAnsweredInputRef}
              name="statusOfferQuestionnaireAnswered"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  statusOfferQuestionnaireAnswered: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label="Offer questionnaire answered"
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam && (!activePerson.statusOfferLetterCreated || showCompletedOnboardingCheckboxes) ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.statusOfferLetterCreated || false}
              className={classes.checkboxRoot}
              color="primary"
              id="statusOfferLetterCreatedToBeSaved"
              inputRef={statusOfferLetterCreatedInputRef}
              name="statusOfferLetterCreated"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  statusOfferLetterCreated: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label="Offer letter created"
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam && (!activePerson.statusOfferLetterSigned || showCompletedOnboardingCheckboxes) ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
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
          disabled={!emailOfficialCanBeEdited}
          id="emailOfficialToBeSaved"
          label={<span style={{ paddingRight: '8px' }}>Email Address, {webAppConfig.ORGANIZATION_NAME} Official ({webAppConfig.ORGANIZATION_NAME === 'WeVote' ? '@wevoteeducation.org' : ''})</span>}
          margin="dense"
          name="emailOfficial"
          onChange={(event) => {
            setEmailOfficialEdited(true);
            setEmailOfficialLocal(event.target.value);
            setEmailOfficialVerified(false);
            setSaveButtonActive(true);
          }}
          placeholder={`${webAppConfig.ORGANIZATION_NAME} email address`}
          value={emailOfficialLocal}
          variant="outlined"
        />
        <TextUnderInputField>
          <EmailOfficialManager
            emailOfficialEdited={emailOfficialEdited}
            savedEmailOfficial={emailOfficialInitial || ''}
            setIsEmailOfficialEditModeInParent={setEmailOfficialEditedFromChild}
            setEmailOfficialInParent={setEmailOfficialFromChild}
            setEmailOfficialVerifiedInParent={setEmailOfficialVerifiedFromChild}
            savePerson={savePerson}
          />
        </TextUnderInputField>
        <TextField
          classes={viewerIsOnHrTeam ? { root: classes.showThisField } : { root: classes.hideThisField }}
          defaultValue={activePerson.phoneNumber || ''}
          id="phoneNumberToBeSaved"
          inputRef={phoneNumberInputRef}
          label="Phone number"
          margin="dense"
          name="phoneNumberToBeSaved"
          onChange={() => setSaveButtonActive(true)}
          placeholder="Phone number"
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
        {activePerson.jazzHrUrl && (
          <QuickLinkList>
            <QuickLink>
              <Suspense fallback={<></>}>
                <OpenExternalWebSite
                  linkIdAttribute="jazzHrUrlId"
                  url={activePerson.jazzHrUrl}
                  target="_blank"
                  body={(
                    <span>
                      JazzHR profile
                      <LaunchStyled />
                    </span>
                  )}
                />
              </Suspense>
            </QuickLink>
            {activePerson.jazzHrUrl.endsWith('/profile') && (
              <QuickLink>
                <Suspense fallback={<></>}>
                  <OpenExternalWebSite
                    linkIdAttribute="jazzHrEmailsUrlId"
                    url={activePerson.jazzHrUrl.replace(/\/profile$/, '/message')}
                    target="_blank"
                    body={(
                      <span>
                        JazzHR emails
                        <LaunchStyled />
                      </span>
                    )}
                  />
                </Suspense>
              </QuickLink>
            )}
          </QuickLinkList>
        )}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateOptionsWrapper
            style={viewerIsOnHrTeam ? {} : { display: 'none' }}
          >
            <DateWrapper>
              <DatePicker
                value={dateStartDate}
                label="Start Date"
                onChange={(newValue) => {
                  setDateStartDate(newValue);
                  setSaveButtonActive(true);
                }}
                slotProps={{
                  textField: {
                    margin: 'dense',
                    error: !!dateStartError,
                    helperText: dateStartError || ' ',
                    onBlur: () => validateStartDate(dateStartDate),
                    FormHelperTextProps: {
                      style: {
                        minHeight: '20px',
                        margin: '4px 14px 0',
                      },
                    },
                  },
                }}
              />
            </DateWrapper>
            <DateWrapper>
              <DatePicker
                value={dateEndDate}
                label="End Date"
                onChange={(newValue) => {
                  setDateEndDate(newValue);
                  setSaveButtonActive(true);
                }}
                slotProps={{
                  textField: {
                    margin: 'dense',
                    error: !!dateEndError,
                    helperText: dateEndError || ' ',
                    onBlur: () => validateEndDate(dateEndDate, dateStartDate),
                    FormHelperTextProps: {
                      style: {
                        minHeight: '20px',
                        margin: '4px 14px 0',
                      },
                    },
                  },
                }}
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
        <CheckboxLabel
          classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.isTeamLead || false}
              className={classes.checkboxRoot}
              color="primary"
              id="isTeamLeadToBeSaved"
              inputRef={isTeamLeadInputRef}
              name="isTeamLead"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  isTeamLead: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`${activePerson.firstNamePreferred || activePerson.firstName} is a team lead`}
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.isHiringManager || false}
              className={classes.checkboxRoot}
              color="primary"
              id="isHiringManagerToBeSaved"
              inputRef={isHiringManagerInputRef}
              name="isHiringManager"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  isHiringManager: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`${activePerson.firstNamePreferred || activePerson.firstName} is a hiring manager`}
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.isIntern || false}
              className={classes.checkboxRoot}
              color="primary"
              id="isInternToBeSaved"
              inputRef={isInternInputRef}
              name="isIntern"
              onChange={(event) => {
                // console.log('isIntern event.target.checked', event.target.checked, ', event.target.value:', event.target.value);
                setActivePerson((prev) => ({
                  ...prev,
                  isIntern: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`${activePerson.firstNamePreferred || activePerson.firstName} is an intern`}
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.statusOnLeave || false}
              className={classes.checkboxRoot}
              color="primary"
              id="statusOnLeaveToBeSaved"
              inputRef={statusOnLeaveInputRef}
              name="statusOnLeave"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  statusOnLeave: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`${activePerson.firstNamePreferred || activePerson.firstName} is on leave`}
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.statusResigned || false}
              className={classes.checkboxRoot}
              color="primary"
              id="statusResignedToBeSaved"
              inputRef={statusResignedInputRef}
              name="statusResigned"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  statusResigned: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`${activePerson.firstNamePreferred || activePerson.firstName} has resigned`}
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.statusAvailableForSpecialProjects || false}
              className={classes.checkboxRoot}
              color="primary"
              id="statusAvailableForSpecialProjectsToBeSaved"
              inputRef={statusAvailableForSpecialProjectsInputRef}
              name="statusAvailableForSpecialProjects"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  statusAvailableForSpecialProjects: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`${activePerson.firstNamePreferred || activePerson.firstName} is available for special projects`}
        />
        <CheckboxLabel
          classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
          control={(
            <Checkbox
              checked={activePerson.isMonthlyDonor || false}
              className={classes.checkboxRoot}
              color="primary"
              id="isMonthlyDonor"
              inputRef={isMonthlyDonorInputRef}
              name="isMonthlyDonor"
              onChange={(event) => {
                setActivePerson((prev) => ({
                  ...prev,
                  isMonthlyDonor: event.target.checked,
                }));
                setSaveButtonActive(true);
              }}
            />
          )}
          label={`${activePerson.firstNamePreferred || activePerson.firstName} is a monthly donor`}
        />
        <ButtonWrapper>
          <Button
            classes={{ root: classes.savePersonButton }}
            color="primary"
            disabled={!saveButtonActive || !!dateStartError || !!dateEndError}
            onClick={() => savePerson()}
            variant="contained"
          >
            Save Person
          </Button>
        </ButtonWrapper>
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
  showThisField: {},
  savePersonButton: {
    width: '330px',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
    '&.Mui-disabled': {
      backgroundColor: '#e0e0e0 !important',
      color: '#424242 !important',
    },
  },
});

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

const DateOptionsWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DateWrapper = styled('div')`
  margin-right: 4px;
`;

const EditPersonFormWrapper = styled('div')`
  //margin-bottom: 60px;
  margin: 0 auto; // WV-1032
  max-width: 600px; // WV-1032
  padding-bottom: 40px; // WV-1032
`;

const HRTeamFieldsTitle = styled('div')`
  margin-top: 24px;
  font-weight: bold;
`;

const LaunchStyled = styled(Launch)`
  color: ${DesignTokenColors.primary500};
  cursor: pointer;
  margin-left: 2px;
  margin-top: -3px;
  width: 14px;
  height: 14px;
`;

const QuickLink = styled('div')`
  margin-right: 12px;
`;

const QuickLinkList = styled('div')`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;
  margin-left: 15px;
`;

const TextUnderInputField = styled('div')`
  margin-left: 15px;
  padding: 4px 0;
`;

export default withStyles(styles)(EditPersonForm);
