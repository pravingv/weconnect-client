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

const ShareGoogleDriveAccess = (params) => {
  renderLog('ShareGoogleDriveAccess');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const emailInputRef = useRef(null);
  const driveFolderInputRef = useRef(null);
  const roleInputRef = useRef('writer');
  const newOwnersEmailInputRef = useRef('');

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));
  const { isShare, isRevoke, isTransfer } = params;

  const shareAccess = async () => {
    const primaryEmail = emailInputRef.current.value;
    const driveFolder = driveFolderInputRef.current.value;
    const role = roleInputRef.current.value;  // no error checking for this demo code, must be one of 'reader', 'commenter', 'writer', or 'owner'
    console.log(`shareAccess ${primaryEmail}`);

    const data = await weConnectQueryFn('google-share-drive-access', { primaryEmail, driveFolder, role }, METHOD.POST);
    console.log('shareGoogleDriveAccess', data);
    if (data?.success) {
      setResultsText(`The drive folder '${driveFolder}' was shared with '${primaryEmail}'`);
    } else {
      setResultsText(`ERROR: The drive folder '${driveFolder}'s sharing WAS NOT changed for '${primaryEmail}'`);
    }
    setOpen(true);
  };

  const transferAccess = async () => {
    const oldOwnersEmail = emailInputRef.current.value;
    const newOwnersEmail = newOwnersEmailInputRef.current.value;

    console.log(`transferAccess ${oldOwnersEmail} => ${newOwnersEmail}`);
    const data = await weConnectQueryFn('google-transfer-drive-access', { oldOwnersEmail, newOwnersEmail }, METHOD.POST);
    console.log('revokeAccess', data);
    if (data?.success) {
      setResultsText(`User '${oldOwnersEmail}'/'s drive file and directory ownership was transferred to '${newOwnersEmail}'`);
    } else {
      setResultsText(`ERROR: User '${oldOwnersEmail}''s drive access was WAS NOT transferred`);
    }
    setOpen(true);
  };

  const revokeSharing = async () => {
    const ownersEmail = emailInputRef.current.value;

    console.log(`revokeSharing ${ownersEmail}`);
    const data = await weConnectQueryFn('google-revoke-sharing', {ownersEmail }, METHOD.POST);
    console.log('revokeSharing', data);
    if (data?.success) {
      setResultsText(`User "${ownersEmail}"s' drive sharing was revoked`);
      console.log('revokeSharing, files revoked: ', data?.filesRevoked);
    } else {
      setResultsText(`ERROR: User '${ownersEmail}''s drive access was WAS NOT revoked`);
    }
    setOpen(true);
  };

  const googleShareClick = async () => {
    if (isShare) {
      await shareAccess();
    } else if (isRevoke) {
      await revokeSharing();
    } else if (isTransfer) {
      await transferAccess();
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
  if (isShare) {
    buttonLabel = 'Share Google Drive Access';
    dialogTitleText = 'Enter staff members wevoteeducation.org info';
    shareMessage = 'This shares all files on a directory basis, and any subdirectories of the directory are included. To share the entire drive, ' +
      'enter "We Vote Education" (exact spelling and spacing is required).';
    actionButtonText = 'Share Drive Folder';
  } else if (isTransfer) {
    buttonLabel = 'Transfer Ownership of Google Drive Files';
    dialogTitleText = 'Enter staff member\'s wevoteeducation.org info and the email of the staff inheriting ownership';
    shareMessage = 'This transfers the ownership of all files and directories in the \'We Vote Education\' drive, from a Member/User/Staff/Person to the \'New Owner\'.  The \'Member\' is demoted from \'owner\' to \'editor\' for those files. \n' +
      'To stop the Member from accessing the files, make their deactivate their wevoteeductation.org Google account.';
    actionButtonText = 'Transfer File and Folder Ownership';
  } else if (isRevoke) {
    buttonLabel = 'Revoke Sharing of Google Drive Access';
    dialogTitleText = 'Enter staff member\'s wevoteeducation.org info';
    shareMessage = 'This revokes sharing of all files and directories for the Member';
    actionButtonText = 'Revoke Sharing';
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
                label="Member's wevoteeducation.org Email"
                inputRef={emailInputRef}
                name="ShareToEmail"
                defaultValue="@wevoteeducation.org"
                sx={{ minWidth: '400px', marginRight: '10px' }}
              />
              {isShare && (
                <>
                  <TextField
                    id="drive_input"
                    label="Drive Folder"
                    inputRef={driveFolderInputRef}
                    name="driveFolder"
                    defaultValue="UA Api Test Folder"
                    sx={{ minWidth: '250px', marginRight: '10px' }}
                  />
                  <TextField
                    id="access_input"
                    label="Role {'reader', 'commenter', 'writer', or 'owner'}"
                    inputRef={roleInputRef}
                    name="role"
                    defaultValue="writer"
                    sx={{ minWidth: '300px', marginRight: '10px' }}
                  />
                </>
              )}
              {isTransfer && (
                <TextField
                  id="search_input"
                  label="New Owner's Email"
                  inputRef={newOwnersEmailInputRef}
                  name="NewOwnerEmail"
                  defaultValue="steve.podell@wevoteeducation.org"
                  sx={{ minWidth: '400px', marginRight: '10px' }}
                />
              )}
              <div style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</div>
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={googleShareClick}>
                {actionButtonText}
              </Button>
            </DialogActions>
          </Dialog>

        </ButtonPanel>
      )}
    </>
  );
};
ShareGoogleDriveAccess.propTypes = {
};

const styles = () => ({
});

export default withStyles(styles)(ShareGoogleDriveAccess);
