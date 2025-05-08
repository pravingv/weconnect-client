import { TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { Suspense, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { ActionOption, ActionOptionList, ActionOptionContainerLeft8, ActionOptionContainerOverflow } from '../Style/actionOptionStyles';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import webAppConfig from '../../config';

const OpenExternalWebSite = React.lazy(() => import(/* webpackChunkName: 'OpenExternalWebSite' */ '../../common/components/Widgets/OpenExternalWebSite'));

// const ACCEPTED_EMAIL_DOMAINS = ['@wevoteeducation.org'];

const GoogleDriveShareManager = (
  { task, taskDefinition },
) => {
  renderLog('GoogleDriveShareManager');
  const { apiDataCache } = useConnectAppContext();
  const { allPeopleCache, viewerAccessRights } = apiDataCache;

  const [activePerson, setActivePerson] = useState({});
  const [newAccountNotification, setNewAccountNotification] = useState('');
  const [newAccountNotificationCopied, setNewAccountNotificationCopied] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const [showNewAccountNotification, setShowNewAccountNotification] = useState(false);
  const [viewerIsOnHrTeam, setViewerIsOnHrTeam] = useState(false);

  const givePersonAccessToFolder = async () => {
    // Turn off warnings & jsonResults
    document.getElementById('jsonResults').textContent = '';

    const { googleDriveAssetId } = taskDefinition; // Was driveFolder
    const role = 'writer';  // no error checking for this demo code, must be one of 'reader', 'commenter', 'writer', or 'owner'

    if (activePerson && activePerson.emailOfficial) {
      const { firstName, firstNamePreferred, emailOfficial } = activePerson;
      // console.log(`givePersonAccessToFolder: ${emailOfficial}`);
      const giveDriveAccessResults = await weConnectQueryFn('google-share-drive-access', {
        primaryEmail: emailOfficial,
        driveFolderId: googleDriveAssetId,
        role,
      }, METHOD.POST);
      // console.log('givePersonAccessToFolder: ', giveDriveAccessResults);
      if (giveDriveAccessResults.success) {
        setResultsText(`Access to Google Drive folder granted for ${emailOfficial}`);
        const firstNameToDisplay = firstNamePreferred || firstName;
        setNewAccountNotification(
          `Hi${(firstNameToDisplay) && ` ${firstNameToDisplay}`}, I have just given your ${webAppConfig.ORGANIZATION_NAME} email account access to the team's Google Drive folder.`,
        );
        setShowNewAccountNotification(true);
      } else {
        setResultsText(`ERROR: '${giveDriveAccessResults.error}' Access to the folder could not be granted.`);
      }
      document.getElementById('jsonResults').textContent = JSON.stringify(giveDriveAccessResults, undefined, 2);
    }
  };

  const newAccountNotificationOnCopy = () => {
    setNewAccountNotificationCopied(true);
    setTimeout(() => {
      setNewAccountNotificationCopied(false);
    }, 1500);
  };

  useEffect(() => {
    setViewerIsOnHrTeam(viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights));
  }, [viewerAccessRights]);

  useEffect(() => {
    if (allPeopleCache && task && task.personId) {
      if (allPeopleCache && allPeopleCache[task.personId]) {
        setActivePerson(allPeopleCache[task.personId]);
      }
    }
  }, [allPeopleCache, task]);

  const googleDriveFolderUrl = `https://drive.google.com/drive/folders/${taskDefinition.googleDriveAssetId}`;
  return (
    <GoogleDriveShareManagerWrapper>
      {viewerIsOnHrTeam && (
        <ActionOptionContainerOverflow>
          <ActionOptionContainerLeft8>
            <ActionOptionList>
              {!(task.statusDone) && (
                <ActionOption>
                  <SpanWithLinkStyle onClick={() => givePersonAccessToFolder()}>
                    Give access to folder
                  </SpanWithLinkStyle>
                </ActionOption>
              )}
              <ActionOption>
                <Suspense fallback={<></>}>
                  <OpenExternalWebSite
                    linkIdAttribute={`taskGoogleDriveLink-${taskDefinition.googleDriveAssetId}`}
                    url={googleDriveFolderUrl}
                    target="_blank"
                    body="See folder"
                  />
                </Suspense>
              </ActionOption>
              <ActionOption>
                {newAccountNotificationCopied ? 'Copied!' : (
                  <CopyToClipboard text={googleDriveFolderUrl} onCopy={() => newAccountNotificationOnCopy(true)}>
                    <SpanWithLinkStyle>
                      Copy to Clipboard
                    </SpanWithLinkStyle>
                  </CopyToClipboard>
                )}
              </ActionOption>
            </ActionOptionList>
            {resultsText && (
              <ActionOptionList>
                <ActionOption>
                  {resultsText}
                </ActionOption>
              </ActionOptionList>
            )}
          </ActionOptionContainerLeft8>
        </ActionOptionContainerOverflow>
      )}
      {showNewAccountNotification && (
        <>
          <div>
            <TextField
              multiline
              rows={5}
              value={newAccountNotification}
              // onChange={(e) => setEmailText(e.target.value)}
              placeholder="Enter text to be copied..."
              fullWidth
              variant="outlined"
              margin="normal"
            />
          </div>
        </>
      )}
      <div>
        <pre id="jsonResults" style={{ marginTop: '11px', fontWeight: '700' }} />
      </div>
    </GoogleDriveShareManagerWrapper>
  );
};
GoogleDriveShareManager.propTypes = {
  task: PropTypes.object,
  taskDefinition: PropTypes.object,
};

const styles = () => ({
  formControl: {
    width: '100%',
  },
});

const GoogleDriveShareManagerWrapper = styled('div')`
  margin: 0 auto;
  // padding-bottom: 40px;
  width: 100%;
`;

export default withStyles(styles)(GoogleDriveShareManager);
