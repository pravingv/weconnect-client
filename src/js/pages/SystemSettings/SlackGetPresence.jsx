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

const SlackGetPresence = () => {
  renderLog('SlackGetPresence');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const channelInputRef = useRef('');

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));

  const getPresence = async () => {
    const channel = channelInputRef.current.value;
    console.log(`getPresence ${channel}`);

    const data = await weConnectQueryFn('slack-get-presence', { memberID: channel }, METHOD.POST);
    console.log('SlackGetPresence', data);
    document.getElementById('jsonResults').textContent = JSON.stringify(data, undefined, 2);

    setResultsText((!data || data.length === 0) ? 'API failed' : '');
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
            Slack Get Member&apos;s Presence
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Retrieve a member&apos;s presence
              <div style={{ fontSize: '.8rem', padding: '5px 0 0 0px' }}>
                Can use a Member ID (e.g &apos;U02GWLNJK&apos;)
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
                label="Member ID"
                inputRef={channelInputRef}
                name="Channel"
                defaultValue="U02GWLNJK"
                sx={{ minWidth: '400px', marginRight: '10px' }}
              />
              <div style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</div>
              <pre id="jsonResults" style={{ marginTop: '11px', fontWeight: '700' }} />
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={getPresence}>
                Get Slack Presence for Member
              </Button>
            </DialogActions>
          </Dialog>

        </ButtonPanel>
      )}
    </>
  );
};
SlackGetPresence.propTypes = {
};

const styles = () => ({
});

export default withStyles(styles)(SlackGetPresence);
