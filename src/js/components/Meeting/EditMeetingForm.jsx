import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { withStyles } from '@mui/styles';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import makeRequestParams from '../../react-query/makeRequestParams';
import { useMeetingSaveMutation } from '../../react-query/mutations';


const EditMeetingForm = ({ classes }) => {
  renderLog('EditMeetingForm');
  const { getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { mutate: mutateMeetingSave } = useMeetingSaveMutation();

  const [isRecurringMeeting, setIsRecurringMeeting] = useState(false);
  const [meeting]  = useState(getAppContextValue('selectedRecurringMeeting'));
  const [meetingDate, setMeetingDate] = useState(dayjs());
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingName, setMeetingName] = useState('');
  const [meetingSequenceEndDate, setMeetingSequenceEndDate] = useState(dayjs().add(1, 'week'));
  const [meetingEndTime, setMeetingEndTime] = useState(dayjs().set('hour', 10).set('minute', 0));
  const [meetingStartTime, setMeetingStartTime] = useState(dayjs().set('hour', 9).set('minute', 0));
  const [saveButtonActive, setSaveButtonActive] = useState(false);
  const [teamId] = useState(getAppContextValue('editMeetingDrawerTeamId'));

  const isRecurringMeetingInputRef = useRef('');
  const meetingNameInputRef = useRef('');
  const meetingDescriptionInputRef = useRef('');

  useEffect(() => {
    if (meeting) {
      setIsRecurringMeeting(meeting.recurringMeetingId >= 0);
      setMeetingDate(meeting.meetingDate);
      setMeetingDescription(meeting.meetingDescription);
      setMeetingEndTime(meeting.meetingEndTime);
      setMeetingName(meeting.meetingName);
      setMeetingStartTime(meeting.meetingStartTime);
    } else {
      setIsRecurringMeeting(false);
      setMeetingDate(dayjs());
      setMeetingDescription('');
      setMeetingName('');
    }
  }, [meeting]);

  const saveMeeting = () => {
    let params = {
      meetingName: meetingNameInputRef.current.value,
      meetingDescription: meetingDescriptionInputRef.current.value,
      meetingEndTime,
      meetingStartTime,
    };
    const plainParams = {
      isRecurringMeeting,
      meetingId: meeting ? meeting.id : '-1',
      recurringMeetingId: meeting ? meeting.id : '-1',
      teamId: teamId || '-1',
    };
    if (isRecurringMeeting) {
      // Add recurringMeeting-specific params here
      params = {
        ...params,
        meetingSequenceEndDate,
        meetingSequenceStartDate: meetingDate,
      };
    } else {
      // Add Meeting-specific params here
      params = {
        ...params,
        meetingDate,
      };
    }
    mutateMeetingSave(makeRequestParams(plainParams, params));
    setSaveButtonActive(false);
    setAppContextValue('editMeetingDrawerOpen', false);
    setAppContextValue('editMeetingDrawerMeetingId', undefined);
    setAppContextValue('editMeetingDrawerRecurringMeetingId', undefined);
    setAppContextValue('editMeetingDrawerTeamId', undefined);
    setAppContextValue('editMeetingDrawerLabel', '');
  };

  const updateSaveButton = () => {
    // console.log('updateSaveButton meetingNameInputRef:', meetingNameInputRef, ', saveButtonActive:', saveButtonActive);
    if (meetingNameInputRef.current.value && meetingNameInputRef.current.value.length &&
      meetingDescriptionInputRef.current.value && meetingDescriptionInputRef.current.value.length) {
      if (!saveButtonActive) {
        setSaveButtonActive(true);
      }
    }
  };

  return (
    <EditMeetingFormWrapper>
      <FormControl classes={{ root: classes.formControl }}>
        <TextField
          autoFocus
          defaultValue={meetingName}
          id="meetingNameToBeSaved"
          inputRef={meetingNameInputRef}
          label="Meeting Name"
          margin="dense"
          name="meetingName"
          onChange={() => updateSaveButton()}
          placeholder="Name of the meeting"
          variant="outlined"
        />
        <TextField
          defaultValue={meetingDescription}
          id="meetingDescriptionToBeSaved"
          inputRef={meetingDescriptionInputRef}
          label="Description"
          margin="dense"
          multiline
          name="meetingDescription"
          onChange={() => updateSaveButton()}
          placeholder="Meeting description"
          rows={6}
          variant="outlined"
        />
      </FormControl>
      <FormControl classes={{ root: classes.dateFormControl }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateOptionsWrapper>
            <DateWrapper>
              <DatePicker
                label="Meeting Date"
                onChange={(newValue) => {
                  setMeetingDate(newValue);
                  updateSaveButton();
                }}
                renderInput={() => (
                  <TextField
                    defaultValue={meetingDate}
                    margin="dense"
                  />
                )}
                value={meetingDate}
              />
            </DateWrapper>
            <DateWrapper>
              <TimePicker
                label="Start time"
                onChange={(newValue) => {
                  setMeetingStartTime(newValue);
                  updateSaveButton();
                }}
                value={meetingStartTime}
              />
            </DateWrapper>
            <DateWrapper>
              -
            </DateWrapper>
            <DateWrapper>
              <TimePicker
                label="End time"
                onChange={(newValue) => {
                  setMeetingEndTime(newValue);
                  updateSaveButton();
                }}
                value={meetingEndTime}
              />
            </DateWrapper>
          </DateOptionsWrapper>
          <DateOptionsWrapper>
            <DateWrapper>
              <DatePicker
                label="Meeting Sequence End Date"
                onChange={(newValue) => {
                  setMeetingSequenceEndDate(newValue);
                  updateSaveButton();
                }}
                renderInput={() => (
                  <TextField
                    value={meetingSequenceEndDate}
                    margin="dense"
                  />
                )}
                sx={isRecurringMeeting ? {} : {
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                }}
              />
            </DateWrapper>
          </DateOptionsWrapper>
        </LocalizationProvider>
      </FormControl>
      <FormControl classes={{ root: classes.formControl }}>
        <CheckboxLabel
          classes={{ label: classes.checkboxLabel }}
          control={(
            <Checkbox
              checked={Boolean(isRecurringMeeting)}
              className={classes.checkboxRoot}
              color="primary"
              id="isRecurringMeetingToBeSaved"
              inputRef={isRecurringMeetingInputRef}
              name="isRecurringMeeting"
              onChange={() => {
                setIsRecurringMeeting(!isRecurringMeeting);
                updateSaveButton();
              }}
            />
          )}
          label="Is this a recurring meeting?"
        />
        <Button
          classes={{ root: classes.saveMeetingButton }}
          color="primary"
          disabled={!saveButtonActive}
          onClick={saveMeeting}
          variant="contained"
        >
          Save Meeting
        </Button>
      </FormControl>
    </EditMeetingFormWrapper>
  );
};
EditMeetingForm.propTypes = {
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
  dateFormControl: {
    marginTop: 20,
  },
  formControl: {
    width: '100%',
  },
  saveMeetingButton: {
    width: 300,
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
  margin-top: 16px;
`;

const DateWrapper = styled('div')`
  margin-right: 4px;
`;

const EditMeetingFormWrapper = styled('div')`
`;

export default withStyles(styles)(EditMeetingForm);
