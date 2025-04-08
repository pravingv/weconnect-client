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

const GetOneGoogleUser = (params) => {
  renderLog('GetOneGoogleUser');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const emailInputRef = useRef(null);

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));
  const { getAll } = params;

  const getOneGoogleUser = async () => {
    const primaryEmail = emailInputRef.current.value;

    console.log(`getOneGoogleUser ${primaryEmail}`);
    const data = await weConnectQueryFn('google-get-user-info', { primaryEmail }, METHOD.POST);
    console.log('createGoogleUser', data);
    console.log('createGoogleUser', JSON.stringify(data));
    document.getElementById('jsonResults').textContent = JSON.stringify(data, undefined, 2);

    setOpen(true);
  };

  const getAllGoogleUsers = async () => {
    console.log(`getAllGoogleUsers`);
    const data = await weConnectQueryFn('google-get-user-list', {}, METHOD.POST);
    console.log('getAllGoogleUsers', data);
    console.log('getAllGoogleUsers', JSON.stringify(data));
    document.getElementById('jsonResults').textContent = JSON.stringify(data, undefined, 2);

    setOpen(true);
  };

  const googleUserClick = async () => {
    if (getAll) {
      await getAllGoogleUsers();
    } else {
      await getOneGoogleUser();
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
            {getAll ? 'Admins Only:  Get List of Google Users' : 'Admins Only:  Get Google User Info'}
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              {getAll ? 'Get a list of all users' : 'Lookup user\'s info by their wevoteeducation.org email address'}
              <br />
              <div style={{ fontSize: '.8rem', padding: '5px 0 0 0px' }}>
                Note from Google: Most user data updates within 1 hour, however, it may take up to 36 hours for new data to be reflected in all search results.
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
              {!getAll && (
                <TextField
                  id="search_input"
                  label="Email"
                  inputRef={emailInputRef}
                  name="email"
                  placeholder=""
                  defaultValue=".test@wevoteeducation.org"
                  sx={{ minWidth: '400px', marginRight: '10px' }}
                />
              )}
              <pre id="jsonResults" style={{ marginTop: '11px', fontWeight: '700' }} />
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={googleUserClick}>
                {getAll ? 'Get the user list' : 'Get the User\'s Info'}
              </Button>
            </DialogActions>
          </Dialog>

        </ButtonPanel>
      )}
    </>
  );
};
GetOneGoogleUser.propTypes = {
};

const styles = () => ({
});

const ButtonPanel = styled('div')`
  padding: 5px;
  width: fit-content;
`;

export default withStyles(styles)(GetOneGoogleUser);
