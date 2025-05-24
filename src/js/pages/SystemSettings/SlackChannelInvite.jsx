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

const SlackChannelInvite = () => {
  renderLog('SlackChannelInvite');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const messageInputRef = useRef(null);
  const channelInputRef = useRef('');

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));

  const inviteMembers = async () => {
    const channel = channelInputRef.current.value;
    const user_ids = messageInputRef.current.value;

    console.log(`inviteMembers ${user_ids}`);

    const data = await weConnectQueryFn('slack-channel-invite', { channel, user_ids }, METHOD.POST);
    console.log('SlackChannelInvite', data);
    if (data?.success) {
      if (data.warning) {
        setResultsText(`Already in channel:  User '${user_ids}' was already in channel '${channel}'. API responded with ('${data.warning}').`);

      } else {
        setResultsText(`Success: '${user_ids}' were invited to join channel '${channel}'`);
      }
    } else {
      setResultsText(`ERROR: Message '${data.warning}' `);
    }
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
          >
            Slack Invite Members to Channel
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Invite Members to a Channel
              <div style={{ fontSize: '.8rem', padding: '5px 0 0 0px' }}>
                Can only use a Channel ID (e.g &apos;C097Q5U1L&apos;) -- Not a channel name.
                Must supply a comma separated list of Member IDs (These are &aposU&apos member ids, not &aposD&apos (direct message) user ids)
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
                defaultValue="C08PFCHHWS3"  // test-channel-3
                sx={{ minWidth: '400px', marginRight: '10px' }}
              />
              <TextField
                id="users_input"
                label="Member IDs (comma separated)"
                inputRef={messageInputRef}
                name="ShareToEmail"
                defaultValue="U08PKV14T4H"
                sx={{ minWidth: '400px', marginRight: '10px' }}
              />            <div style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</div>
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={inviteMembers}>
                Invite Members to join Slack Channel
              </Button>
            </DialogActions>
          </Dialog>

        </ButtonPanel>
      )}
    </>
  );
};
SlackChannelInvite.propTypes = {
};

const styles = () => ({
});


export default withStyles(styles)(SlackChannelInvite);
