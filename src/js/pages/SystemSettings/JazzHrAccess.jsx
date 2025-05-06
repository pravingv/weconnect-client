import CloseIcon from '@mui/icons-material/Close';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import { Button, DialogActions, IconButton, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from '@mui/styles';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';

const JazzHrAccess = (params) => {
  renderLog('JazzHrAccess');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const cityInputRef = useRef(null);
  const jobIdInputRef = useRef(null);
  const jobTitleInputRef = useRef(null);
  const applyDateInputRef = useRef(null);
  const fromApplyDateInputRef = useRef(null);
  const toApplyDateInputRef = useRef(null);

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));
  const { isGetUsers, isGetApplicants } = params;

  const searchUsers = async () => {
    const email = emailInputRef.current.value;
    const name = nameInputRef.current.value;
    console.log(`searchUsers ${email}`);

    const data = await weConnectQueryFn('jazz-get-users', { email, name }, METHOD.POST);
    console.log('JazzHrAccess jazz-get-users: ', data);
    if (data?.success) {
      setResultsText(`Users found: ${data.data.length}`);
      if (data.data.length > 0) {
        document.getElementById('jsonResults').textContent = JSON.stringify(data.data, undefined, 2);
      }
    } else {
      setResultsText(`ERROR: error '${data.error}`);
    }
    setOpen(true);
  };

  const searchApplicants = async () => {
    const name = nameInputRef.current.value;
    const city = cityInputRef.current.value;
    /* eslint-disable camelcase */
    const job_id = jobIdInputRef.current.value;
    const job_title = jobTitleInputRef.current.value;
    const apply_date = applyDateInputRef.current.value;
    const from_apply_date = fromApplyDateInputRef.current.value;
    const to_apply_date = toApplyDateInputRef.current.value;

    console.log(`searchApplicants ${name}  ${job_title}`);
    const data = await weConnectQueryFn('jazz-get-applicants', { name, city, job_id, job_title, apply_date, from_apply_date, to_apply_date }, METHOD.POST);
    console.log('JazzHrAccess jazz-get-applicants: ', data);
    if (data?.success) {
      let count = data.data.length;
      if (!count && 'id' in data.data) {
        count = 1;
      }
      if (!count) {
        count = 0;
      }
      document.getElementById('jsonResults').textContent = '';

      setResultsText(`Applicants found: ${count}`);
      if (count) {
        document.getElementById('jsonResults').textContent = JSON.stringify(data.data, undefined, 2);
      }
    } else {
      setResultsText(`ERROR: error '${data.error}`);
    }
    setOpen(true);
  };

  const jazzActions = async () => {
    if (isGetUsers) {
      await searchUsers();
    } else if (isGetApplicants) {
      await searchApplicants();
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  let buttonLabel;
  let dialogTitleText;
  let shareMessage;
  let actionButtonText;
  if (isGetUsers) {
    buttonLabel = 'Admins Only: Search JazzHR for Users';
    dialogTitleText = 'Enter full or partial name, and/or full or partial email address.';
    shareMessage = 'In the name field it could be \'George\' or \'Washington\' or \'George Washington\'\n' +
      'In the email field needs to be a exact match like \'george.washington@whitehouse.gov\'';
    actionButtonText = 'Search For Users';
  } else if (isGetApplicants) {
    buttonLabel = 'Admins Only: Search JazzHR for Applicants';
    dialogTitleText = 'Enter one or more search criteria';
    shareMessage = 'The recruiter_id, status, and rating fields are also supported by the weconnect-server api endpoint, but are not in this test UI';
    actionButtonText = 'Search For Applicants';
  }

  return (
    <>
      {isAdmin && (
        <ButtonPanel>
          <Button
            color="primary"
            variant="outlined"
            size="small"
            onClick={handleOpen}
            sx={{ backgroundColor: 'white', whiteSpace: 'nowrap' }}
            startIcon={<LockOutlineIcon />}
          >
            {buttonLabel}
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              {dialogTitleText}
              <br />
              <div style={{ fontSize: '.8rem', padding: '5px 0 0 0px' }}>{shareMessage}</div>
            </DialogTitle>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={(theme) => ({
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
              })}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent dividers>
              <TextField
                id="search_input"
                label="User's Name"
                inputRef={nameInputRef}
                name="searchName"
                sx={{ minWidth: '400px', margin: '0 10px 10px 0' }}
              />
              {isGetUsers && (
                <TextField
                  id="search_input"
                  label="User's Email"
                  inputRef={emailInputRef}
                  name="searchEmail"
                  sx={{ minWidth: '400px', margin: '0 10px 10px 0' }}
                />
              )}
              {isGetApplicants && (
                <>
                  <TextField
                    id="city_input"
                    label="City"
                    inputRef={cityInputRef}
                    name="city"
                    sx={{ minWidth: '250px', margin: '0 10px 10px 0' }}
                  />
                  <TextField
                    id="job_id_input"
                    label="Job ID"
                    inputRef={jobIdInputRef}
                    name="jobid"
                    sx={{ minWidth: '300px', margin: '0 10px 10px 0' }}
                  />
                  <TextField
                    id="job_title_input"
                    label="Job Title"
                    inputRef={jobTitleInputRef}
                    name="jobtitle"
                    sx={{ minWidth: '300px', margin: '0 10px 10px 0' }}
                  />
                  <TextField
                    id="apply_date_input"
                    label="Application Date (YYYY-MM-DD)"
                    inputRef={applyDateInputRef}
                    name="applydate"
                    sx={{ minWidth: '300px', margin: '0 10px 10px 0' }}
                  />
                  <TextField
                    id="applyfrom_date_input"
                    label="From Application Date (YYYY-MM-DD)"
                    inputRef={fromApplyDateInputRef}
                    name="fromapplydate"
                    sx={{ minWidth: '340px', margin: '0 10px 10px 0' }}
                  />
                  <TextField
                    id="applyto_date_input"
                    label="To Application Date (YYYY-MM-DD)"
                    inputRef={toApplyDateInputRef}
                    name="toapplydate"
                    sx={{ minWidth: '300px', margin: '0 10px 10px 0' }}
                  />
                </>
              )}
              <div style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</div>
              <pre id="jsonResults" style={{ marginTop: '11px', fontWeight: '700' }} />
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={jazzActions}>
                {actionButtonText}
              </Button>
            </DialogActions>
          </Dialog>

        </ButtonPanel>
      )}
    </>
  );
};
JazzHrAccess.propTypes = {
};

const styles = () => ({
});

const ButtonPanel = styled('div')`
  padding: 5px;
  width: fit-content;
`;

export default withStyles(styles)(JazzHrAccess);
