import CloseIcon from '@mui/icons-material/Close';
import { Button, IconButton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { DropzoneArea } from 'mui-file-dropzone';
import React, { useState } from 'react';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { ButtonPanel } from './systemSettingsCommonStyles';

function SlackAddPersonImages () {
  renderLog('ImportDonationReport');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const [done, setDone] = useState(false);

  const [isAdmin] = useState(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));

  const handleClose = () => {
    setOpen(false);
    setDone(false);
    setResultsText('');
  };

  const handleOpen = () => {
    setDone(false);
    setOpen(true);
  };

  const dropped = async (files) => {
    if (files && files.length) {
      const url = URL.createObjectURL(files[0]);
      const response = await fetch(url);   // Response stream
      const csvText = await response.text();
      const arr = csvText.split('\n');
      const jsonObj = [];
      const headers = arr[0].split(',');
      for (let i = 1; i < arr.length; i++) {
        const data = arr[i].split(',');
        const obj = {};
        for (let j = 0; j < data.length; j++) {
          obj[headers[j].trim()] = data[j].trim();
        }
        jsonObj.push(obj);
      }
      const resp = await weConnectQueryFn('donations-add-status', { jsonObj }, METHOD.POST);
      let text = JSON.stringify(resp, null, 2);
      text = text.replace('"donorsMarkedAsActive":', '"Donors marked as active due to entries in the DonorBox csv report":')
        .replace('"donorsNotMatched":', '"Donors who most likely used a different email for their donation than they use for their WeVote relationship":')
        .replace('"donorsMarkedAsInactive":', '"Donors who were marked as active in the database, but who are not in the report -- displays actual rows from the database":')
        .replace('"donorsReceivedAsCancelled":', '"Donors in the report who were flagged as having cancelled their subscriptions -- displays actual rows from the csv report":');
      setResultsText(text);
      setDone(true);
    }
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
            Import Donation Report
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Import the DonorBox donation report
              <div style={{ fontSize: '.8rem', padding: '5px 0 0 0px' }}>
                For the staff with &quot;Monthly&quot; donations, make sure that they are
                marked as current donors, and unmark any staff who are no longer donors.
                <br />
                This feature can be run multiple times with the same csv file, with no ill effects.
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
              {!done && (
                <div style={{ width: '25%' }}>
                  <span style={{ opacity: 0.9, fontSize: '1.5rem)', fontWeight: 500, paddingBottom: '6px' }}>Drop (or click to select) the &quot;we-vote_plans_....csv&quot; file here:</span>
                  <div style={{ margin: '10px 0 0 60px' }}>
                    <DropzoneArea onChange={dropped} acceptedFiles={['text/csv']} />
                  </div>
                </div>
              )}
              <h3>{done && ('Results:')}</h3>
              <pre style={{ marginTop: '11px', fontWeight: '700' }}>{resultsText}</pre>
            </DialogContent>
          </Dialog>
        </ButtonPanel>
      )}
    </>
  );
}

export default SlackAddPersonImages;
