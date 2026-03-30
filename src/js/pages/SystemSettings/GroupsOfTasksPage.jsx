import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { PageContentContainer } from '../../components/Style/pageLayoutStyles';
import TaskGroupListIndex from './TaskGroupListIndex';

export default function GroupsOfTasksPage () {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>Groups of Tasks - WeConnect Admin</title>
      </Helmet>
      <PageContentContainer style={{ maxWidth: '1500px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '20px' }}>
          <h1>Groups of Tasks</h1>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/system-settings')}
          >
            ← Back to Settings
          </Button>
        </div>
        <TaskGroupListIndex showTaskGroupList />
      </PageContentContainer>
    </>
  );
}
