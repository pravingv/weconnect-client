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
  // const changeOwnerGloballyInputRef = useRef(false);

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));
  const { isShare } = params;

  const shareAccess = async () => {
    const primaryEmail = emailInputRef.current.value;
    const driveFolder = driveFolderInputRef.current.value;
    const role = roleInputRef.current.value;  // no error checking for this demo code, must be one of 'reader', 'commenter', 'writer', or 'owner'
    console.log(`shareAccess ${primaryEmail}`);

    const data = await weConnectQueryFn('google-share-drive-access', { primaryEmail, driveFolder, role }, METHOD.POST);
    console.log('createGoogleUser', data);
    if (data?.success) {
      setResultsText(`The drive folder '${driveFolder}' was shared with '${primaryEmail}'`);
    } else {
      setResultsText(`ERROR: The drive folder '${driveFolder}'s sharing WAS NOT changed for '${primaryEmail}'`);
    }
    setOpen(true);
  };

  const revokeAccess = async () => {
    const oldOwnersEmail = emailInputRef.current.value;
    const newOwnersEmail = newOwnersEmailInputRef.current.value;

    console.log(`revokeAccess ${oldOwnersEmail} => ${newOwnersEmail}`);
    const data = await weConnectQueryFn('google-revoke-drive-access', { oldOwnersEmail, newOwnersEmail }, METHOD.POST);
    console.log('createGoogleUser', data);
    if (data?.success) {
      setResultsText(`User '${oldOwnersEmail}'/'s drive access was revoked, and file ownership was transferred to '${newOwnersEmail}'`);
    } else {
      setResultsText(`ERROR: User '${oldOwnersEmail}''s drive access was WAS NOT revoked`);
    }
    setOpen(true);
  };

  const googleShareClick = async () => {
    if (isShare) {
      await shareAccess();
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

  let shareMessage;
  if (isShare) {
    shareMessage = 'This shares all files on a directory basis, and any subdirectories of the directory are included. To share the entire drive, ' +
    'enter "We Vote Education" (exact spelling and spacing is required).';
  } else {
    shareMessage = 'This revokes file and directory shares recursively on a directory basis, and any subdirectories of the directory are ' +
    'included. Any files owned by the user will be changed to the newOwner\'s email address.  To change ownership of ' +
    'any file owned by the primaryEmail address user, enter the root folder\'s name, "We Vote Education" (exact spelling and spacing is required).';
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
            Admins Only:  {isShare ? 'Share Google Drive Access' : 'Revoke Sharing of Google Drive Access'}
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              {isShare ? "Enter staff member's wevoteeducation.org info" : "Enter staff member's wevoteeducation.org info and the email of the staff inheriting ownership" }
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
              {isShare ? (
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
              ) : (
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
                {isShare ? 'Share Drive Folder' : 'Revoke Share'}
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

const ButtonPanel = styled('div')`
  padding: 5px;
  width: fit-content;
`;

export default withStyles(styles)(ShareGoogleDriveAccess);
