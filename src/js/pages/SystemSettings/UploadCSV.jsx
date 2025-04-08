import CloseIcon from '@mui/icons-material/Close';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import { Button, DialogActions, IconButton, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
// eslint-disable-next-line import/no-unresolved
import { useFilePicker } from 'use-file-picker';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';

const UploadCSV = (classes) => {
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;
  const [open, setOpen] = useState(false);
  const [resultsText, setResultsText] = useState([]);


  const [isAdmin] = useState(viewerCanSeeOrDo(['canEditPermissionsAnyone'], viewerAccessRights));

  const { openFilePicker, filesContent, loading, errors } = useFilePicker({
    accept: '.csv',
  });

  if (loading) {
    console.log('----------- loading ------------');
  }
  if (errors.length > 0) {
    // for (let err in errors) {
    console.log('E: ', errors);
    // };
  }


  const uploadFile = async (csv) => {
    console.log(`Upload csv ${csv}`);
    const data = await weConnectQueryFn('update-db-from-csv', { csv }, METHOD.POST);
    const outputArray = data.outputString.split('\n');
    const done = outputArray.filter((line) => line.startsWith('DONE --------------'));
    const teams = outputArray.filter((line) => line.startsWith('------------------- Team Created'));
    const skipped = outputArray.filter((line) => line.startsWith('ROW SKIPPED:'));
    outputArray.unshift(['===================== Raw Data Follows =====================']);
    skipped.forEach((row) => outputArray.unshift(row));
    teams.forEach((row) => outputArray.unshift(row));
    done.forEach((row) => outputArray.unshift(row));
    setResultsText(outputArray);

    setOpen(true);
  };


  useEffect(() => {
    async function fetchData () {
      if (filesContent.length) {
        console.log(`useEffect filesContent ${JSON.stringify(filesContent[0].content)}`);
        const ret = await uploadFile(filesContent[0].content);
        console.log(ret);
      }
    }
    fetchData();
  }, [filesContent]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleClipboard = async () => {
    try {
      await navigator.clipboard.writeText(resultsText.join('\n'));
      console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };


  return (
    <>
      {isAdmin && (
        <ButtonPanel>
          <Button
            classes={{ root: classes.addQuestionnaireButtonRoot }}
            color="primary"
            variant="outlined"
            size="small"
            onClick={() => openFilePicker()}
            sx={{ backgroundColor: 'white', whiteSpace: 'nowrap' }}
            startIcon={<LockOutlineIcon />}
          >
            Admins Only:  Select csv file to upload
          </Button>
          <br />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Results of import <br />
              <span style={{ fontWeight: '300', fontSize: 'smaller' }}>Result text is not saved, copy it before closing if you want it</span>
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
              {resultsText.map((line) => (
                <Typography gutterBottom>
                  {line}
                </Typography>
              ))}
            </DialogContent>
            <DialogActions>
              <Button autoFocus variant="outlined" onClick={handleClipboard}>
                Save text to clipboard
              </Button>
            </DialogActions>
          </Dialog>

        </ButtonPanel>
      )}
    </>
  );
};
UploadCSV.propTypes = {
  // classes: PropTypes.object,
};

const styles = () => ({
});

const ButtonPanel = styled('div')`
  padding: 18px 5px 5px 5px;
  width: fit-content;
`;

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


export default withStyles(styles)(UploadCSV);
