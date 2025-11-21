import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { PageContentContainer } from '../../components/Style/pageLayoutStyles';
import PermissionsAdministration from './PermissionsAdministration';

export default function PermissionsPage() {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>Permissions Administration - WeConnect Admin</title>
      </Helmet>
      <PageContentContainer style={{ maxWidth: '1500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Permissions Administration</h1>
          <Button
            variant="outlined"
            onClick={() => navigate('/system-settings')}
          >
            ← Back to System Settings
          </Button>
        </div>
        <PermissionsAdministration />
      </PageContentContainer>
    </>
  );
}
