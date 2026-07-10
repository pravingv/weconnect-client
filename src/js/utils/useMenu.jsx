import React, { useState, useCallback } from 'react';
import {
  Menu,
  MenuItem,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { useGetFullNamePreferred } from '../models/PersonModel';
import { useSaveTaskMutation, useDeleteTaskMutation } from '../react-query/mutations';
import { makeRequestParamsDictionary } from '../react-query/makeRequestParams';
import { useConnectAppContext } from '../contexts/ConnectAppContext';

const useMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { getAppContextValue } = useConnectAppContext();
  const authenticatedPerson = getAppContextValue('authenticatedPerson');
  const authenticatedPersonId = authenticatedPerson?.id || -1;

  const { mutate: saveTask } = useSaveTaskMutation();
  const { mutate: deleteTask } = useDeleteTaskMutation();

  const doneByPersonFullName = useGetFullNamePreferred(selectedTask?.doneByPersonId);

  const handleMenuOpen = useCallback((event, task, taskDefinition) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask({ ...task, taskDefinition });
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEditClick = useCallback(() => {
    handleMenuClose();
    setIsDrawerOpen(true);
  }, [handleMenuClose]);

  const handleDeleteClick = useCallback(() => {
    handleMenuClose();
    setIsDeleteDialogOpen(true);
  }, [handleMenuClose]);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    const deleteRequestParams = makeRequestParamsDictionary(
      {
        personId: selectedTask.personId,
        taskDefinitionId: selectedTask.taskDefinitionId,
      },
      {},
    );
    deleteTask(deleteRequestParams);
    setIsDeleteDialogOpen(false);
  }, [selectedTask, deleteTask]);

  const handleStatusChange = useCallback((e) => {
    const isDone = e.target.checked;
    setSelectedTask((prev) => ({
      ...prev,
      statusDone: isDone,
      doneByPersonId: authenticatedPersonId,
    }));
    const requestParams = makeRequestParamsDictionary(
      {
        personId: selectedTask.personId,
        taskDefinitionId: selectedTask.taskDefinitionId,
      },
      {
        doneByPersonId: authenticatedPersonId,
        statusDone: isDone,
      },
    );
    saveTask(requestParams);
  }, [selectedTask, authenticatedPersonId, saveTask]);

  const renderMenu = () => (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
      </Menu>
      <Drawer anchor="right" open={isDrawerOpen} onClose={handleDrawerClose}>
        <div
          style={{
            width: 350,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Typography variant="h6">Edit Task</Typography>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Typography>
              Task: {selectedTask?.taskDefinition?.taskName}
            </Typography>

            {selectedTask?.statusDone && (
              <Typography>
                Completed By: {doneByPersonFullName}
              </Typography>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormControlLabel
              control={(
                <Checkbox
                  checked={selectedTask?.statusDone || false}
                  onChange={handleStatusChange}
                />
              )}
              label="Status Done"
            />

            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsDeleteDialogOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Drawer>
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this task?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  return {
    handleMenuOpen,
    renderMenu,
  };
};

export default useMenu;
