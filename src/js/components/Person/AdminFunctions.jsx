import React, { useEffect } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import CreateNewGoogleUser from '../../pages/SystemSettings/CreateNewGoogleUser';
import FastLoad from '../../pages/SystemSettings/FastLoad';
import GetOneGoogleUser from '../../pages/SystemSettings/GetOneGoogleUser';
import ImportDonationReport from '../../pages/SystemSettings/ImportDonationReport';
import JazzHrAccess from '../../pages/SystemSettings/JazzHrAccess';
import PostgresRowCounts from '../../pages/SystemSettings/PostgresRowCounts';
import ResetGoogleUserPassword from '../../pages/SystemSettings/ResetGoogleUserPassword';
import GrantGoogleDriveAccess from '../../pages/SystemSettings/ShareGoogleDriveAccess';
import SlackAddPersonImages from '../../pages/SystemSettings/SlackAddPersonImages';
import SlackChannelInvite from '../../pages/SystemSettings/SlackChannelInvite';
import SlackChannelMembers from '../../pages/SystemSettings/SlackChannelMembers';
import SlackGetPresence from '../../pages/SystemSettings/SlackGetPresence';
import SlackListUsers from '../../pages/SystemSettings/SlackListMembers';
import SlackSendMessage from '../../pages/SystemSettings/SlackSendMessage';

/* global $ */

const AdminFunctions = () => {
  renderLog('AdminFunctions');  // Set LOG_RENDER_EVENTS to log all renders

  const stats = {};  // Will contain webpack.DefinePlugin() variables, set at compile time
  /* eslint-disable no-undef */
  stats.Node_version = WEBPACK_NODE_VERSION;
  stats.NPM_version = WEBPACK_NPM_VERSION;
  stats.Pull_request = WEBPACK_PULL_REQUEST;
  stats.Git_date = WEBPACK_GIT_DATE;
  stats.Git_hash = WEBPACK_GIT_HASH;
  const keyValueArray = Object.entries(stats);
  const dirname = WEBPACK_NODISPLAY_DIRNAME;
  const rootFiles = WEBPACK_NODISPLAY_ROOT_DIR_FILES;
  /* eslint-enable no-undef */

  useEffect(() => {
    const theTd = $('td:contains("weconnect-client")');
    theTd.replaceWith(theTd.text());
  }, []);

  const hideLinesWithNone = false;
  return (
    <AdminFunctionsWrapper>
      <div style={{ padding: '10px', marginTop: '20px', marginBottom: '20px', border: '1px solid black', width: 'fit-content' }}>
        <input type="hidden" id="dirname" name="dirname" value={dirname} />
        <input type="hidden" id="dirname" name="dirname" value={rootFiles} />
        <table>
          <tbody>
            {keyValueArray.map((entry) => (
              <tr key={entry[0]} style={entry[1] === 'none' && hideLinesWithNone ? { display: 'none' } : {}}>
                <td style={{ width: 'fit-content', paddingRight: '20px' }}>
                  {entry[0].replaceAll('_', ' ')}:
                </td>
                <td style={{ width: 'fit-content' }}>
                  {entry[1]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProfileComponentSubTitle>This page is only visible, and usable, by a staff member with &quot;isAdmin&quot; privileges</ProfileComponentSubTitle>
      <ButtonDividerLine />
      <SectionTitle>Import the Donorbox csv donation report:</SectionTitle>
      <ImportDonationReport />

      <ButtonDividerLine />
      <div style={{ paddingTop: '1rem' }}>
        <SectionTitle>Overwrite your Local Postgres WeConnectDB with the data from the Master Database in AWS:</SectionTitle>
        <FastLoad />
        <PostgresRowCounts />
        {/* <SectionTitle>Upload a CSV file from Google Docs to import into the local database:</SectionTitle> */}
        {/* <UploadCSV /> */}
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
          <SlackAddPersonImages />
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
