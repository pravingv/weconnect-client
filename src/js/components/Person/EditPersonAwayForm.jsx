import { Button, FormControl, FormLabel, Select, MenuItem, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { getPersonAwayParamsToSave, getPersonAwayLabel, getPersonAwayReason } from '../../controllers/PersonController';
import { PERSON_AWAY_REASONS, PERSON_AWAY_REASONS_WITH_HR } from '../../models/PersonModel';
import { makeRequestParamsDictionary } from '../../react-query/makeRequestParams';
import { usePersonAwaySaveMutation } from '../../react-query/mutations';
import { SpanWithLinkStyle } from '../Style/linkStyles';


const EditPersonAwayForm = ({ classes, personId }) => {
  renderLog('EditPersonAwayForm');
  const { mutate: personAwaySave } = usePersonAwaySaveMutation();

  const [awayDescriptionForTeamLeadsValue, setAwayDescriptionForTeamLeadsValue] = useState('');
  const [awayDescriptionValue, setAwayDescriptionValue] = useState('');
  const [awayReasonRadioValue, setAwayReasonRadioValue] = useState('isVacation');
  const [personAway] = useState({});
  const [dateEndDate, setDateEndDate] = useState(dayjs().add(1, 'week'));
  const [dateEndDateEstimated, setDateEndDateEstimated] = useState(dayjs().add(1, 'week'));
  const [saveButtonActive, setSaveButtonActive] = useState(true);
  const [showAwayDescriptionForTeamLeads, setShowAwayDescriptionForTeamLeads] = useState(false);
  const [dateStartDate, setDateStartDate] = useState(dayjs());

  const awayReasonInputRef = useRef('');
  const awayDescriptionForTeamLeadsInputRef = useRef('');
  const awayDescriptionInputRef = useRef('');
  const dateEndDateEstimatedInputRef = useRef('');
  const dateEndDateInputRef = useRef('');
  const dateStartDateInputRef = useRef('');

  useEffect(() => {
    if (personAway) {
      setAwayDescriptionForTeamLeadsValue(personAway.awayDescriptionForTeamLeads);
      setAwayDescriptionValue(personAway.awayDescription);
      setAwayReasonRadioValue(getPersonAwayReason(personAway));
    } else {
      setAwayDescriptionForTeamLeadsValue('');
      setAwayDescriptionValue('');
      setAwayReasonRadioValue('isVacation');
    }
  }, [personAway]);

  const savePersonAway = () => {
    const plainParams = {
      personAwayId: (personAway && personAway.id >= 0) ? personAway.id : -1,
      personId,
    };
    // Need to break up awayReasonRadioValue into "isX" fields and send them as separate params
    const updatedPersonAwayIsValues = getPersonAwayParamsToSave(awayReasonRadioValue);
    const params = {
      ...updatedPersonAwayIsValues,
      awayDescription: awayDescriptionInputRef.current.value,
      awayDescriptionForTeamLeads: awayDescriptionForTeamLeadsInputRef.current.value,
      dateEndDate: dateEndDate.format('YYYY-MM-DD'),
      dateEndDateEstimated: dateEndDateEstimated.format('YYYY-MM-DD'),
      dateStartDate: dateStartDate.format('YYYY-MM-DD'),
    };
    console.log('savePersonAway params:', params);
    const requestParams = makeRequestParamsDictionary(plainParams, params);
    personAwaySave(requestParams);
    // console.log('saveQuestionnaire requestParams:', requestParams);
    setSaveButtonActive(false);
  };

  const updateSaveButton = () => {
    if (awayDescriptionInputRef.current.value && awayDescriptionInputRef.current.value.length) {
      if (!saveButtonActive) {
        setSaveButtonActive(true);
      }
    }
  };

  const handleRadioChange = (event) => {
    setAwayReasonRadioValue(event.target.value);
    if (!saveButtonActive) {
      setSaveButtonActive(true);
    }
  };

  return (
    <EditPersonAwayFormWrapper>
      <FormControl fullWidth sx={{ marginBottom: '20px' }}>
        <FormLabel id="personAwayReasonId">Why I&#39;m Away</FormLabel>
        <Select
          id="personAwayReasonSelect"
          inputRef={awayReasonInputRef}
          value={awayReasonRadioValue}
          onChange={handleRadioChange}
        >
          {PERSON_AWAY_REASONS_WITH_HR.map((reason) => (
            <MenuItem key={reason} value={reason}>
              {getPersonAwayLabel(reason)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl classes={{ root: classes.formControl }}>
        <TextField
          autoFocus
          defaultValue={awayDescriptionValue}
          id="awayDescriptionToBeSaved"
          inputRef={awayDescriptionInputRef}
          label="Why you are away, shown to team"
          margin="dense"
          multiline
          name="awayDescription"
          onChange={() => updateSaveButton()}
          placeholder="Hi team, I'm going to be away..."
          rows={4}
          variant="outlined"
        />
        <div>
          {showAwayDescriptionForTeamLeads ? (
            <SpanWithLinkStyle onClick={() => setShowAwayDescriptionForTeamLeads(false)}>Hide explanation for team lead(s)</SpanWithLinkStyle>
          ) : (
            <SpanWithLinkStyle onClick={() => setShowAwayDescriptionForTeamLeads(true)}>Add explanation for team lead(s) only</SpanWithLinkStyle>
          )}
        </div>
        <TextField
          defaultValue={awayDescriptionForTeamLeadsValue}
          id="awayDescriptionForTeamLeadsToBeSaved"
          inputRef={awayDescriptionForTeamLeadsInputRef}
          label="Why you are away, shown to team leads"
          margin="dense"
          multiline
          name="awayDescriptionForTeamLeads"
          onChange={() => updateSaveButton()}
          placeholder="I'm going to be away for 2 weeks, starting next week..."
          rows={3}
          sx={!showAwayDescriptionForTeamLeads && {
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
          variant="outlined"
        />
      </FormControl>
      <FormControl classes={{ root: classes.dateFormControl }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateOptionsWrapper>
            <DateWrapper>
              <DatePicker
                defaultValue={dateStartDate}
                label="Start Date"
                onChange={(newValue) => {
                  setDateStartDate(newValue);
                  updateSaveButton();
                }}
                renderInput={() => (
                  <TextField
                    defaultValue={dateStartDate}
                    inputRef={dateStartDateInputRef}
                    margin="dense"
                  />
                )}
              />
            </DateWrapper>
            <DateWrapper>
              <DatePicker
                defaultValue={dateEndDateEstimated}
                label="End Date (Estimated)"
                onChange={(newValue) => {
                  setDateEndDateEstimated(newValue);
                  updateSaveButton();
                }}
                renderInput={() => (
                  <TextField
                    defaultValue={dateEndDate} // More Up-to-date use of DatePicker is in EditPersonForm
                    inputRef={dateEndDateEstimatedInputRef}
                    margin="dense"
                  />
                )}
              />
            </DateWrapper>
            <DateWrapper>
              <DatePicker
                defaultValue={dateEndDate}
                label="End Date (Actual)"
                onChange={(newValue) => {
                  setDateEndDate(newValue);
                  updateSaveButton();
                }}
                renderInput={() => (
                  <TextField
                    defaultValue={dateEndDate}
                    inputRef={dateEndDateInputRef}
                    margin="dense"
                  />
                )}
              />
            </DateWrapper>
          </DateOptionsWrapper>
        </LocalizationProvider>
      </FormControl>
      <FormControl classes={{ root: classes.formControl }}>
        <Button
          classes={{ root: classes.savePersonAwayButton }}
          color="primary"
          disabled={!saveButtonActive}
          onClick={savePersonAway}
          variant="contained"
        >
          Save My Availability
        </Button>
      </FormControl>
    </EditPersonAwayFormWrapper>
  );
};
EditPersonAwayForm.propTypes = {
  classes: PropTypes.object.isRequired,
  personId: PropTypes.number.isRequired,
};

const styles = (theme) => ({
  checkboxRoot: {
    paddingTop: 0,
    paddingLeft: '9px',
    paddingBottom: 0,
  },
  checkboxLabel: {
    marginTop: 2,
  },
  dateFormControl: {
    marginTop: 20,
  },
  formControl: {
    width: '100%',
  },
  savePersonAwayButton: {
    marginTop: 20,
    width: 300,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const DateOptionsWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DateWrapper = styled('div')`
  margin-right: 4px;
`;

const EditPersonAwayFormWrapper = styled('div')`
`;

export default withStyles(styles)(EditPersonAwayForm);
