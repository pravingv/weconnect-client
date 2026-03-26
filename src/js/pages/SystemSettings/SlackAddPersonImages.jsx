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

const SlackAddPersonImages = () => {
  renderLog('SlackAddPersonImages');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const personIdInputRef = useRef('');

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));

  const addPhotos = async () => {
    const personId = personIdInputRef.current.value;
    // console.log(`addPhotos ${personId}`);

    const data = await weConnectQueryFn('slack-add-person-images', { personId }, METHOD.POST);
    // console.log('SlackAddPersonImages', data);
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
            Slack Add Person(s) Photo Link
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Update one or more Person rows with image links and handles from their Slack profile
              <div style={{ fontSize: '.8rem', padding: '5px 0 0 0px' }}>
                If you supply a Person.id in the field below, you will update that single
                Person with the latest image link (slackImage48) and slackHandle.
                <br /><br />
                If the Person.id field is left blank, then all rows will be updated.
                This api matches Persons with Slack &quot;Members&quot; by email address
                (either the personalEmail or Official Email address will work).
                <br />
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
                id="personIdInput"
                label="Person id"
                inputRef={personIdInputRef}
                name="PersonId"
                defaultValue=""
                sx={{ minWidth: '400px', marginRight: '10px' }}
              />
              <div style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</div>
              <pre id="jsonResults" style={{ marginTop: '11px', fontWeight: '700' }} />
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={addPhotos}>
                Set Slack Image(s)
              </Button>
            </DialogActions>
          </Dialog>
        </ButtonPanel>
      )}
    </>
  );
};
SlackAddPersonImages.propTypes = {
};

const styles = () => ({
});

export default withStyles(styles)(SlackAddPersonImages);
