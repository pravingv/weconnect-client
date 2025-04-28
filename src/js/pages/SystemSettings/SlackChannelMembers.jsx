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

const SlackChannelMembers = () => {
  renderLog('SlackChannelMembers');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const channelInputRef = useRef('');

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));

  const listMembers = async () => {
    const channel = channelInputRef.current.value;


    console.log(`listMembers ${channel}`);

    const data = await weConnectQueryFn('slack-channel-members', { channel }, METHOD.POST);
    console.log('SlackChannelMembers', data);
    document.getElementById('jsonResults').textContent = JSON.stringify(data, undefined, 2);
    setOpen(true);
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
            Admins Only:  Slack List Channel Members
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              List Members in a Channel
              <div style={{ fontSize: '.8rem', padding: '5px 0 0 0px' }}>
                Can only use a Channel ID (e.g &apos;C097Q5U1L&apos;) -- Not a channel name.
                <br />
                You can lookup Member IDs with the &apos;Slack List Members&apos;, the member id is listed simply as &apos;id&apos;
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
              id="channel_input"
              label="Channel ID"
              inputRef={channelInputRef}
              name="Channel"
              defaultValue="C08NMFNEUNB"
              sx={{ minWidth: '400px', marginRight: '10px' }}
            />
            {/* <div style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</div> */}
            <pre id="jsonResults" style={{ marginTop: '11px', fontWeight: '700' }} />
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={listMembers}>
                List Members in Slack Channel
              </Button>
            </DialogActions>
          </Dialog>
        </ButtonPanel>
      )}
    </>
  );
};
SlackChannelMembers.propTypes = {
};

const styles = () => ({
});

const ButtonPanel = styled('div')`
  padding: 5px;
  width: fit-content;
`;

export default withStyles(styles)(SlackChannelMembers);
