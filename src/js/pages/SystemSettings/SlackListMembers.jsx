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

const SlackListUsers = () => {
  renderLog('SlackListUsers');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const daysRangeInputRef = useRef(null);

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));

  const sendMessage = async () => {
    const daysRange = daysRangeInputRef.current.value;
    console.log(`daysRange ${daysRange}`);

    const data = await weConnectQueryFn('slack-list-users', { daysRange }, METHOD.POST);
    console.log('SlackListUsers', data);
    document.getElementById('jsonResults').textContent = JSON.stringify(data, undefined, 2);

    setResultsText((!data || data.length === 0) ? 'API failed' : `Received members: ${data.members.length} `);

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
            Slack List Members
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Get a list of slack members
              <div style={{ fontSize: '.8rem', padding: '5px 0 0 0px' }}>
                Two thirds of our slack members haven&apos;t logged-in within a year.  A &apos;Days Range &apos; of 365, means return members who have used the WeVote slack channel within a year.
              </div>
              <br />
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
                label="Days Range"
                inputRef={daysRangeInputRef}
                name="DaysRange"
                defaultValue="365"
                sx={{ minWidth: '400px', marginRight: '10px' }}
              />
              <div id="results" style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</div>
              <pre id="jsonResults" style={{ marginTop: '11px', fontWeight: '700' }} />
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={sendMessage}>
                List Slack Members
              </Button>
            </DialogActions>
          </Dialog>

        </ButtonPanel>
      )}
    </>
  );
};
SlackListUsers.propTypes = {
};

const styles = () => ({
});

export default withStyles(styles)(SlackListUsers);
