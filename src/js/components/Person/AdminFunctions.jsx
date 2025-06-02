import React from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import CreateNewGoogleUser from '../../pages/SystemSettings/CreateNewGoogleUser';
import FastLoad from '../../pages/SystemSettings/FastLoad';
import GetOneGoogleUser from '../../pages/SystemSettings/GetOneGoogleUser';
import JazzHrAccess from '../../pages/SystemSettings/JazzHrAccess';
import ResetGoogleUserPassword from '../../pages/SystemSettings/ResetGoogleUserPassword';
import GrantGoogleDriveAccess from '../../pages/SystemSettings/ShareGoogleDriveAccess';
import SlackChannelInvite from '../../pages/SystemSettings/SlackChannelInvite';
import SlackChannelMembers from '../../pages/SystemSettings/SlackChannelMembers';
import SlackGetPresence from '../../pages/SystemSettings/SlackGetPresence';
import SlackListUsers from '../../pages/SystemSettings/SlackListMembers';
import SlackSendMessage from '../../pages/SystemSettings/SlackSendMessage';
import UploadCSV from '../../pages/SystemSettings/UploadCSV';

const AdminFunctions = () => {
  renderLog('AdminFunctions');  // Set LOG_RENDER_EVENTS to log all renders

  return (
    <AdminFunctionsWrapper>
      <ProfileComponentSubTitle>This page is only visible, and usable, by a staff member with &quot;isAdmin&quot; privileges</ProfileComponentSubTitle>
      <div style={{ paddingTop: '2rem' }}>
        <SectionTitle>Overwrite your Local Postgres WeConnectDB with the data from the Master Database in AWS:</SectionTitle>
        <FastLoad />
        <SectionTitle>Upload a CSV file from Google Docs to import into the local database:</SectionTitle>
        <UploadCSV />
        <ButtonDividerLine />
        <SectionTitle>Google Users Creation:</SectionTitle>
        <ButtonRow>
          <CreateNewGoogleUser isCreate />
          <CreateNewGoogleUser isCreate={false} />
        </ButtonRow>
        <SectionTitle>Google Users Operations:</SectionTitle>
        <ButtonRow>
          <GetOneGoogleUser getAll={false} />
          <GetOneGoogleUser getAll />
          <ResetGoogleUserPassword />
        </ButtonRow>
        <SectionTitle>Google Drive Operations:</SectionTitle>
        <ButtonRow>
          <GrantGoogleDriveAccess isShare />
          {/* <GrantGoogleDriveAccess isRevoke /> Doesn't find all the files, and low priority */}
          <GrantGoogleDriveAccess isTransfer />
        </ButtonRow>
        <SectionTitle>Slack Operations:</SectionTitle>
        <ButtonRow>
          <SlackSendMessage />
          <SlackListUsers />
          <SlackGetPresence />
        </ButtonRow>
        <SectionTitle>Slack Channel Operations:</SectionTitle>
        <ButtonRow>
          <SlackChannelInvite />
          <SlackChannelMembers />
        </ButtonRow>
        <SectionTitle>JazzHr Operations:</SectionTitle>
        <ButtonRow>
          <JazzHrAccess isGetUsers />
          <JazzHrAccess isGetApplicants />
        </ButtonRow>
      </div>
    </AdminFunctionsWrapper>
  );
};
AdminFunctions.propTypes = {
};

const ButtonDividerLine = styled('div')`
  padding-top: 48px;
  padding-bottom: 4px;
  border-bottom: 1px solid #BCC6CC;
`;

const ProfileComponentSubTitle = styled('div')`
  font-size: 17px;
  font-weight: 400;
  margin-bottom: 4px;
  font-style: italic;
`;

const ButtonRow = styled('div')`
    display: flex;
`;

const AdminFunctionsWrapper = styled('div')`
  margin-left: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled('div')`
  padding-top: 16px;
  padding-bottom: 4px;
  font-weight: 500;  
`;

export default AdminFunctions;
