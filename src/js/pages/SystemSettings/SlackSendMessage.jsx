import CloseIcon from '@mui/icons-material/Close';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import { Button, DialogActions, FormControlLabel, IconButton, Radio, RadioGroup, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from '@mui/styles';
import * as PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';

function RadioGroupDividers (props) {
  return null;
}

RadioGroupDividers.propTypes = {
  dividers: PropTypes.bool,
  children: PropTypes.node,
};
const SlackSendMessage = () => {
  renderLog('SlackSendMessage');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const [sendAsBot, setSendAsBot] = useState(true);
  const messageInputRef = useRef(null);
  const channelInputRef = useRef(null);
  const senderInputRef = useRef(null);

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));


  const sendMessage = async () => {
    const message = messageInputRef.current.value;
    const channel = channelInputRef.current.value;
    const sender = sendAsBot ? '' : senderInputRef?.current?.value;
    console.log(`sendMessage ${message}`);

    const data = await weConnectQueryFn('slack-send-message', { message, channel, sendAsBot, sender }, METHOD.POST);
    console.log('SlackSendMessage', data);
    if (data?.success) {
      setResultsText(`Message '${message}' was sent to channel '${channel}'`);
    } else {
      setResultsText(`ERROR: Message '${message}' was NOT sent to channel '${channel}'`);
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
            startIcon={<LockOutlineIcon />}
          >
            Admins Only:  Slack Send Message
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Send a message
              <div style={{ fontSize: '.8rem', padding: '5px 0 0 0px' }}>
                Can use Channel Name (e.g &apos;engineering2021&apos;), or Channel ID (e.g &apos;C097Q5U1L&apos;), or DM via a Member ID (e.g &apos;U02GWLNJK&apos;)
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
              {/* <RadioGroup */}
              {/*  aria-labelledby="sendAsBot " */}
              {/*  value={sendAsBot ? 'sendBot' : 'sendUser'} */}
              {/*  name="includeOrOnly" */}
              {/*  onChange={(event) => { */}
              {/*    setSendAsBot(event.target.value === 'sendBot'); */}
              {/*  }} */}
              {/*  row */}
              {/*  sx={{ paddingBottom: '25px' }} */}
              {/* > */}
              {/*  <FormControlLabel */}
              {/*    control={<Radio />} */}
              {/*    key="includeKey" */}
              {/*    label="Send as &quot;WeVote Notifications&quot; Bot" */}
              {/*    value="sendBot" */}
              {/*  /> */}
              {/*  <FormControlLabel */}
              {/*    control={<Radio />} */}
              {/*    key="onlyKey" */}
              {/*    label="Send as User" */}
              {/*    value="sendUser" */}
              {/*  /> */}
              {/* </RadioGroup> */}
              <TextField
                id="search_input"
                label="Message"
                inputRef={messageInputRef}
                name="ShareToEmail"
                defaultValue="Hello world!"
                sx={{ minWidth: '400px', marginRight: '10px' }}
              />
              <TextField
                id="channel_input"
                label="Recipient Channel Name, Channel ID, or User ID"
                inputRef={channelInputRef}
                name="Channel"
                defaultValue="steve-test-channel"
                sx={{ minWidth: '400px', marginRight: '10px' }}
              />
              {!sendAsBot && (
                <TextField
                  id="channel_input"
                  label="Sender User ID"
                  inputRef={senderInputRef}
                  name="Sender"
                  defaultValue="U527YE5J4"
                  sx={{ minWidth: '400px', marginRight: '10px' }}
                />
              )}

              <div style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</div>
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={sendMessage}>
                Send Slack Message
              </Button>
            </DialogActions>
          </Dialog>

        </ButtonPanel>
      )}
    </>
  );
};
SlackSendMessage.propTypes = {
};

const styles = () => ({
});

const ButtonPanel = styled('div')`
  padding: 5px;
  width: fit-content;
`;

export default withStyles(styles)(SlackSendMessage);
