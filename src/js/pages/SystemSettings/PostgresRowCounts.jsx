import CloseIcon from '@mui/icons-material/Close';
import { Button, IconButton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { withStyles } from '@mui/styles';
import React, { useState } from 'react';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { ButtonPanel } from './systemSettingsCommonStyles';


const PostgresRowCounts = () => {
  const [open, setOpen] = useState(false);
  const [tableRowData, setTableRowData] = useState([]);

  /* HACK */      const forceMaster = false;
  async function fetchData () {
    if (tableRowData.length === 0) {
      const tablePacket = await weConnectQueryFn('fast-load-table-statistics', METHOD.POST, forceMaster);
      console.log(tablePacket);
      const parsedTablePacket = JSON.parse(tablePacket.sqlTables);
      console.log(parsedTablePacket);
      setTableRowData(parsedTablePacket);
    }
  }

  const handleOpen = () => {
    fetchData();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
        >
          Report SQL Row Counts from Master Server
        </Button>
        <br />

        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={open}
          PaperProps={{ sx: { width: '95%', maxWidth: '95%' } }}
          sx={{ paddingTop: '20px' }}
        >
          <DialogTitle sx={{ m: 0, p: 2, paddingTop: '10px' }} id="customized-dialog-title">
            Row counts for each table in the production Postgres DB
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
          <DialogContent style={{ display: 'flex' }}>
            <table style={{ paddingLeft: '50px' }}>
              <thead>
                <tr>
                  <th scope="col" style={{ textAlign: 'left', paddingRight: '200px' }}>Table</th>
                  <th scope="col" style={{ textAlign: 'left' }}>Row Count</th>
                </tr>
              </thead>
              <tbody id="tableBody">
                {tableRowData.map((t) => (
                  <tr id="tables" key={`row-${t[0]}`}>
                    <>
                      <td>{t[0]}</td>
                      <td id={`${t[0]}_id`}>{t[1]}</td>
                    </>
                  </tr>
                ))}

              </tbody>
            </table>
          </DialogContent>
        </Dialog>
      </ButtonPanel>
    </>
  );
};

const styles = () => ({
});


export default withStyles(styles)(PostgresRowCounts);
