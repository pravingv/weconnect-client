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

const CreateNewGoogleUser = (params) => {
  renderLog('CreateNewGoogleUser');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const firstNameInputRef = useRef(null);
  const lastNameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const phoneNumberInputRef = useRef(null);

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));
  const { isCreate } = params;

  const reformatPhoneNumberToGooglePattern = () => {
    let returnedStr = '';
    const phoneNumber = phoneNumberInputRef.current.value;
    const digitsLocal = phoneNumber.match(/\d/g);
    if (digitsLocal) {
      if (digitsLocal[0] === '1') {
        digitsLocal.shift();
      }
      returnedStr = `+1 ${digitsLocal[0]}${digitsLocal[1]}${digitsLocal[2]} ${digitsLocal[3]}${digitsLocal[4]}${digitsLocal[5]} ${digitsLocal[6]}${digitsLocal[7]}${digitsLocal[8]}${digitsLocal[9]}`;
      console.log(returnedStr);
    }
    return returnedStr;
  };

  const createGoogleUser = async () => {
    const firstName = firstNameInputRef.current.value;
    const lastName = lastNameInputRef.current.value;
    const primaryEmail = emailInputRef.current.value;
    const password = passwordInputRef.current.value;
    const phoneNumber = reformatPhoneNumberToGooglePattern();

    console.log(`createGoogleUser ${primaryEmail}`);

    const personalEmail = '';   // personal email now required server side
    const data = await weConnectQueryFn('google-create-user', { firstName, lastName, primaryEmail, personalEmail, password, phoneNumber }, METHOD.POST);
    console.log('createGoogleUser', data);
    if (data.success) {
      setResultsText(`Staff member '${data.primaryEmail}' has been created`);
    } else {
      setResultsText(`ERROR: '${data.error}' A staff member was not created`);
    }

    setOpen(true);
  };

  const deleteGoogleUser = async () => {
    const firstName = firstNameInputRef.current.value;
    const lastName = lastNameInputRef.current.value;
    const primaryEmail = emailInputRef.current.value;

    // Since this works on live primary data, for safety, this test code can only delete emails that end with '.test@wevoteeducation.org'
    if (!primaryEmail.endsWith('.test@wevoteeducation.org') || primaryEmail === '.test@wevoteeducation.org') {
      setResultsText('ERROR: The email address must end with .test@wevoteeducation.org');
    } else {
      console.log(`deleteGoogleUser ${firstName} ${lastName}`);
      const data = await weConnectQueryFn('google-delete-user', { firstName, lastName, primaryEmail }, METHOD.POST);
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
    if (isCreate) {
      await createGoogleUser();
    } else {
      await deleteGoogleUser();
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
            Admins Only:  {isCreate ? 'Create New Google User' : 'Delete Google User'}
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Enter Google user info
              <div style={{ fontSize: '.8rem', padding: '5px 0 0 0px' }}>
                This can take a full minute to complete
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
                label="First Name"
                inputRef={firstNameInputRef}
                name="firstName"
                defaultValue=""
                sx={{ minWidth: '250px', marginRight: '10px' }}
              />
              <TextField
                id="search_input"
                label="Last Name"
                inputRef={lastNameInputRef}
                name="lastName"
                placeholder="Last name"
                defaultValue="test"
                sx={{ minWidth: '250px', marginRight: '10px' }}
              />
              <TextField
                id="search_input"
                label="Email"
                inputRef={emailInputRef}
                name="email"
                placeholder=""
                defaultValue=".test@wevoteeducation.org"
                sx={{ minWidth: '400px', marginRight: '10px' }}
              />
              {isCreate && (
                <>
                  <TextField
                    id="search_input"
                    label="Password"
                    inputRef={passwordInputRef}
                    name="password"
                    placeholder="Initial password"
                    defaultValue="12345678"
                    sx={{ minWidth: '250px', marginRight: '10px' }}
                  />
                  <TextField
                    id="search_input"
                    label="Phone Number"
                    inputRef={phoneNumberInputRef}
                    name="phoneNumber"
                    placeholder=""
                    defaultValue=""
                    sx={{ minWidth: '250px', marginRight: '10px' }}
                  />
                </>
              )}
              <div style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</div>
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={googleUserClick}>
                {isCreate ? 'Create the member\'s .test@wevoteeducation.org account' : 'Delete a member\'s .test@wevoteeducation.org account'}
              </Button>
            </DialogActions>
          </Dialog>
        </ButtonPanel>
      )}
    </>
  );
};
CreateNewGoogleUser.propTypes = {
};

const styles = () => ({
});

const ButtonPanel = styled('div')`
  padding: 5px;
  width: fit-content;
`;

export default withStyles(styles)(CreateNewGoogleUser);
