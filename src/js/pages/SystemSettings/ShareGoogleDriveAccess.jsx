import CloseIcon from '@mui/icons-material/Close';
import { Button, DialogActions, IconButton, MenuItem, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { ButtonPanel } from './systemSettingsCommonStyles';

const ShareMessage = ({ isShare, isTransfer, isRevoke }) => {
  if (isShare) {
    return (
      <>
        <div>
          This shares all files on a directory basis, and any subdirectories of that shared directory are included. To
          share
          the entire wevoteeducation.org C3 drive, enter &#34;We Vote Education&#34; (exact spelling and spacing is
          required).
        </div>
        <div>
          Before sharing a drive in the wevote.us C4 drive domain, make sure that the drive or highest folder of the
          drive is already
          shared to api.superadminuser@wevoteeducation.org (Engineering & Data Storage Team, We Vote USA has already
          been shared to api.superadminuser@wevoteeducation.org)
        </div>
        <div>
          The wevote.us C4 drive, unlike the wevoteeducation.org C3 drive does not have a
          common &quot;root&quot; folder
          (like &quot;We Vote Education&quot;), so each folder will need to be shared
          individually to api.superadminuser@wevoteeducation.org
        </div>
      </>
    );
  } else if (isTransfer) {
    return (
      <>
        <div>This transfers the ownership of all files and directories in the &quot;We Vote Education&quot; drive, from a Member/User/Staff/Person to the &quot;New Owner&quot;.  The &quot;Member&quot; is demoted from &quot;owner&quot; to &quot;editor&quot; for those files.</div>
        <div>To stop the Member from accessing the files, make their deactivate their wevoteeductation.org Google account.</div>
      </>
    );
  } else if (isRevoke) {
    return (
      <div>This revokes sharing of all files and directories for the Member</div>
    );
  }
  return <></>;
};
ShareMessage.propTypes = {
  isShare: PropTypes.bool,
  isTransfer: PropTypes.bool,
  isRevoke: PropTypes.bool,
};

const ShareGoogleDriveAccess = (params) => {
  renderLog('ShareGoogleDriveAccess');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  // const [driveDomain, setDriveDomain] = useState('wevoteeducation');
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

    const isWeVoteEducationC3 = true; // doesn't matter, relies on api.superadminuser@wevoteeducation.org, not differing JWTs on the server driveDomain === 'wevoteeducation';
    const data = await weConnectQueryFn('google-share-drive-access', { primaryEmail, driveFolder, isWeVoteEducationC3, role }, METHOD.POST);
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
    const data = await weConnectQueryFn('google-revoke-sharing', { ownersEmail }, METHOD.POST);
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
    setResultsText('');
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

  // const handleDomainChange = (event) => {
  //   setDriveDomain(event.target.value);
  // };

  let buttonLabel;
  let dialogTitleText;
  let actionButtonText;

  if (isShare) {
    buttonLabel = 'Share Google Drive Access';
    dialogTitleText = 'Enter staff members wevoteeducation.org info';
    actionButtonText = 'Share Drive Folder';
  } else if (isTransfer) {
    buttonLabel = 'Transfer Ownership of Google Drive Files';
    dialogTitleText = 'Enter staff member\'s wevoteeducation.org info and the email of the staff inheriting ownership';
    actionButtonText = 'Transfer File and Folder Ownership';
  } else if (isRevoke) {
    buttonLabel = 'Revoke Sharing of Google Drive Access';
    dialogTitleText = 'Enter staff member\'s wevoteeducation.org info';
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
              <div style={{ fontSize: '.8rem', padding: '5px 0 0 0px' }}>
                <ShareMessage isShare={isShare || false} isTransfer={isTransfer || false} isRevoke={isRevoke || false} />
              </div>
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
                  {/* <TextField */}
                  {/*  select */}
                  {/*  label="Select a drive domain" */}
                  {/*  value={driveDomain} */}
                  {/*  onChange={handleDomainChange} */}
                  {/*  sx={{ width: 250, marginRight: '10px' }} */}
                  {/* > */}
                  {/*  <MenuItem value="wevoteeducation">wevoteeducation.org (c3)</MenuItem> */}
                  {/*  <MenuItem value="wevoteus">wevote.us (c4)</MenuItem> */}
                  {/* </TextField> */}
                  <TextField
                    select
                    id="access_input"
                    label="Role {'reader', 'commenter', 'writer', or 'owner'}"
                    inputRef={roleInputRef}
                    name="role"
                    defaultValue="writer"
                    sx={{ minWidth: '300px', marginRight: '10px' }}
                  >
                    <MenuItem value="writer">writer</MenuItem>
                    <MenuItem value="reader">reader</MenuItem>
                    <MenuItem value="commenter">commenter</MenuItem>
                    <MenuItem value="owner">owner</MenuItem>
                  </TextField>
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
