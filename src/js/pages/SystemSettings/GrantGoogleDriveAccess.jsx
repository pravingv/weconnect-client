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

const GrantGoogleDriveAccess = (params) => {
  renderLog('GrantGoogleDriveAccess');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const emailInputRef = useRef(null);
  const driveFolderInputRef = useRef(null);
  const writeAccessInputRef = useRef(null);

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));
  const { isGrant } = params;

  const grantAccess = async () => {
    const primaryEmail = emailInputRef.current.value;
    const driveFolder = driveFolderInputRef.current.value;
    const writeAccess = writeAccessInputRef.current.value;

    console.log(`grantAccess ${primaryEmail}`);
    const data = await weConnectQueryFn('google-grant-drive-access', { primaryEmail, driveFolder, writeAccess }, METHOD.POST);
    console.log('createGoogleUser', data);
    if (data?.success) {
      setResultsText(`Staff member '${data.primaryEmail}' has been created`);
    } else {
      setResultsText(`ERROR: '${data.error}' A staff member was not created`);
    }

    setOpen(true);
  };

  const revokeAccess = async () => {
    const primaryEmail = emailInputRef.current.value;
    const driveFolder = driveFolderInputRef.current.value;
    const writeAccess = writeAccessInputRef.current.value;

    // Since this works on live primary data, for safety, this test code can only delete emails that end with '.test@wevoteeducation.org'
    if (!primaryEmail.endsWith('.test@wevoteeducation.org') || primaryEmail === '.test@wevoteeducation.org') {
      setResultsText('ERROR: The email address must end with .test@wevoteeducation.org');
    } else {
      console.log(`deleteGoogleUser ${primaryEmail} ${driveFolder} ${driveFolder}`);
      const data = await weConnectQueryFn('delete-google-user', { primaryEmail, driveFolder, writeAccess }, METHOD.POST);
      console.log('deleteGoogleUser', data);
      if (data.success) {
        setResultsText(`Staff member '${data.primaryEmail}' has been deleted`);
      } else {
        setResultsText(`ERROR: '${data.error.replace('userKey', primaryEmail)}' A staff member was not deleted`);
      }
    }
    setOpen(true);
  };

  const googleUserClick = async () => {
    if (isGrant) {
      await grantAccess();
    } else {
      await revokeAccess();
    }
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
            startIcon={<LockOutlineIcon />}
          >
            Admins Only:  {isGrant ? 'Grant Google Drive Access' : 'Revoke Google Drive Access'}
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Enter Google user info <br />
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
                defaultValue="@wevoteeducation.org"
                sx={{ minWidth: '400px', marginRight: '10px' }}
              />
              <TextField
                id="sdrive_input"
                label="Drive Folder"
                inputRef={driveFolderInputRef}
                name="driveFolder"
                defaultValue="/"
                sx={{ minWidth: '250px', marginRight: '10px' }}
              />
              <TextField
                id="access_input"
                label="Write Access"
                inputRef={writeAccessInputRef}
                name="writeAccess"
                // placeholder="Last name"
                defaultValue="true"
                sx={{ minWidth: '250px', marginRight: '10px' }}
              />
              <div style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</div>
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={googleUserClick}>
                {isGrant ? 'Grant Access' : 'Revoke Access'}
              </Button>
            </DialogActions>
          </Dialog>

        </ButtonPanel>
      )}
    </>
  );
};
GrantGoogleDriveAccess.propTypes = {
};

const styles = () => ({
});

const ButtonPanel = styled('div')`
  padding: 5px;
  width: fit-content;
`;

export default withStyles(styles)(GrantGoogleDriveAccess);
