import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertTitle } from '@mui/lab';
import { Button, DialogActions, IconButton, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from '@mui/styles';
import React, { useEffect, useRef, useState } from 'react';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { ButtonPanel } from './systemSettingsCommonStyles';

/* global $ */

const FastLoad = () => {
  const [open, setOpen] = useState(false);
  const [showUnanonOptions, setShowUnanonOptions] = useState(false);
  const [showUnanonButton, setShowUnanonButton] = useState(true);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [featureDisabled, setFeatureDisabled] = useState(false);
  const [showTable, setShowTable] =  useState(false);
  const [tablesLoaded, setTablesLoaded] =  useState(0);
  const emailInputRef = useRef('');
  const passwordInputRef = useRef('');

  useEffect(() => {
    const { location: { hostname } } = window;
    if (hostname.includes('wevote.org')) {
      setFeatureDisabled(true);
    }
  }, []);

  const doFastLoad = async () => {
    setShowUnanonButton(false);
    setShowUnanonOptions(false);
    setButtonsDisabled(true);

    const $tb = $('#tableBody');
    $tb.empty();
    setShowTable(true);
    const forceMaster = true;  // Must be true, when checking in this file!  Override webAppConfig.STAFF_API_SERVER_API_ROOT_URL, since in this case we ALWAYS want to hit the master server
    const data = await weConnectQueryFn('fast-load-get-allowable-tables', {}, METHOD.POST, forceMaster);
    const { allowableTables } = data;
    let insertableHtml = '';
    allowableTables.forEach((table) => {
      insertableHtml += `<tr><td>${table}</td><td id="${table}_id">Not yet started</td></tr>`;
    });
    $tb.append(insertableHtml);

    let loaded = 0;
    const doNotAnonymize =  emailInputRef.current?.value && emailInputRef.current.value.length > 0 && passwordInputRef.current?.value && passwordInputRef.current.value.length > 0;
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < allowableTables.length; i++) {
      const table = allowableTables[i];
      const tablePacket = await weConnectQueryFn('fast-load-table-retrieve', {
        tableName: table,
        doNotAnonymize,
        email: emailInputRef?.current?.value,
        password: passwordInputRef?.current?.value,
      }, METHOD.POST, forceMaster);
      console.log('response for ', table);
      if (tablePacket) {
        const { tableJSON } = tablePacket;
        await weConnectQueryFn('fast-load-local-table-replace', { tablePacket }, METHOD.POST);
        const count = tableJSON?.length || 0;
        if (count === 0) {
          $(`#${table}_id`).html('<td>no rows returned for table</td>');
        } else {
          $(`#${table}_id`).html(`<td><b>${count}</b> rows inserted</td>`);
          loaded += 1;
        }
      } else {
        console.error('fast-load-table-retrieve failed');
      }
    }
    setTablesLoaded(loaded);
    if (loaded) {
      $('#done').css('display', 'contents');
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleshowUnanonOptions = () => {
    setShowUnanonOptions(!showUnanonOptions);
    setShowUnanonButton(false);
  };

  const handleClose = () => {
    setOpen(false);
    setShowUnanonOptions(false);
    setShowUnanonButton(true);
    setShowTable(false);
  };


  return (
    <>
      <ButtonPanel>
        <Button
          color="primary"
          variant="outlined"
          size="small"
          onClick={() => handleOpen()}
          sx={{ backgroundColor: 'white', whiteSpace: 'nowrap' }}
          disabled={featureDisabled}
        >
          {featureDisabled ? 'Fast Load can only be run from your local server' : 'Fast Load Data From Master Server'}
        </Button>
        <br />
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={open}
          PaperProps={{ sx: { width: '95%', maxWidth: '95%' }  }}
        >
          <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            This function will overwrite the data in your local postgres database with the data from the master server
            in AWS.
          </DialogTitle>
          <div style={{ margin: '0 0 5px 30px' }}>
            Only in the very rare case where you need to restore your current data, it can be restored with a <i>psql -X</i> from a <i>pg_dump</i> that will be created in the
            project dir on your computer. See instructions in <i>FastLoad.jsx</i>
          </div>

          <div id="done" style={{ display: 'none' }}>
            <Alert severity="success">
              <AlertTitle>{tablesLoaded} Tables loaded</AlertTitle>
              The account that you sign into your local weconnect-server has been overwritten.  In a terminal, run <b>node ./node_scripts/createDevUser Samuel Adams samuel@adams.com ale</b> to make a new admin user for yourself (any name or password is fine for this command).
            </Alert>
          </div>
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
          <DialogContent dividers style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Button
              color="primary"
              variant="outlined"
              size="small"
              onClick={handleshowUnanonOptions}
              disabled={buttonsDisabled}
              sx={{
                backgroundColor: 'white',
                whiteSpace: 'nowrap',
                fontSize: '11px',
                color: '#6b6b6b',
                display: showUnanonButton ? 'flex' : 'none',
              }}
            >
              Only click this if you COMPLETELY are sure you need un-anonymized Data
            </Button>
            {showUnanonOptions && (
              <>
                <div style={{ margin: '20px 0 10px 10px' }}>
                  <span style={{ fontWeight: '600' }}>ONLY in the rare situation where you need non-anonymized data: </span>
                  The email/password is provided to allow you to access un-anonymized data.  To get this specialized data you must have <i>isAdmin</i> rights on the
                  Master server.
                </div>
                <TextField
                  id="search_input"
                  label="Master Server Login Email"
                  inputRef={emailInputRef}
                  name="firstName"
                  defaultValue=""
                  sx={{ minWidth: '250px', marginLeft: '10px', marginRight: '10px' }}
                />
                <TextField
                  id="search_input"
                  label="Master Server Password"
                  inputRef={passwordInputRef}
                  name="firstName"
                  defaultValue=""
                  sx={{ minWidth: '250px', marginRight: '10px' }}
                />
              </>
            )}
            <table style={{ paddingTop: '20px', display: `${showTable ? 'table' : 'none'}` }}>
              <thead>
                <tr>
                  <th scope="col" style={{ textAlign: 'left', paddingRight: '200px' }}>Table</th>
                  <th scope="col" style={{ textAlign: 'left' }}>Progress</th>
                </tr>
              </thead>
              <tbody id="tableBody">
                <></>
              </tbody>
            </table>
          </DialogContent>
          <DialogActions>
            <Button autoFocus variant="outlined" onClick={doFastLoad}>
              Overwrite ALL local data, with data from the master server
            </Button>
          </DialogActions>
        </Dialog>

      </ButtonPanel>
    </>
  );
};
FastLoad.propTypes = {
  // classes: PropTypes.object,
};

const styles = () => ({
});



// Save as an example of styled MUI components
// const BootstrapDialog = styled(Dialog)(({ theme }) => ({
//   maxWidth: '95%',
//   '& .MuiDialogContent-root': {
//     padding: theme.spacing(2),
//   },
//   '& .MuiDialogActions-root': {
//     padding: theme.spacing(1),
//   },
// }));


export default withStyles(styles)(FastLoad);
