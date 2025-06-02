import CloseIcon from '@mui/icons-material/Close';
import { Button, DialogActions, IconButton, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from '@mui/styles';
import React, { useRef, useState } from 'react';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { ButtonPanel } from './systemSettingsCommonStyles';

const ResetGoogleUserPassword = () => {
  renderLog('ResetGoogleUserPassword');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);


  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));


  const resetPassword = async () => {
    const primaryEmail = emailInputRef.current.value;
    const newPassword = passwordInputRef.current.value;

    console.log(`deleteGoogleUser ${emailInputRef} ${newPassword}`);
    const data = await weConnectQueryFn('google-reset-user-password', { primaryEmail, newPassword }, METHOD.POST);
    console.log('resetGoogleUserPassword', data);
    if (data.success) {
      setResultsText(`Staff member '${data.primaryEmail}' has been reset`);
    } else {
      setResultsText(`ERROR: '${data.error.replace('userKey', primaryEmail)}' A staff member's password was not reset`);
    }
    setOpen(true);
  };

  const googleUserClick = async () => {
    await resetPassword();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

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
          >
            Reset Google User Password
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Enter the user&apos;s wevoteeducation.org email<br />
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
                label="Email"
                inputRef={emailInputRef}
                name="email"
                placeholder=""
                defaultValue=".test@wevoteeducation.org"
                sx={{ minWidth: '400px', marginRight: '10px' }}
              />
              <TextField
                id="search_input"
                label="Password"
                inputRef={passwordInputRef}
                name="password"
                placeholder="New password"
                defaultValue="12345678"
                sx={{ minWidth: '250px', marginRight: '10px' }}
              />
              <div style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</div>
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={googleUserClick}>
                Reset Password
              </Button>
            </DialogActions>
          </Dialog>

        </ButtonPanel>
      )}
    </>
  );
};
ResetGoogleUserPassword.propTypes = {
};

const styles = () => ({
});

export default withStyles(styles)(ResetGoogleUserPassword);
