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
import generateRandomString from '../../common/utils/generateRandomString';
import webAppConfig from '../../config';

const OpenExternalWebSite = React.lazy(() => import(/* webpackChunkName: 'OpenExternalWebSite' */ '../../common/components/Widgets/OpenExternalWebSite'));

const ACCEPTED_EMAIL_DOMAINS = ['@wevoteeducation.org'];

const GoogleDriveShareManager = (
  {
    emailOfficialEdited, savedEmailOfficial, setEmailOfficialInParent,
    setIsEmailOfficialEditModeInParent, setEmailOfficialVerifiedInParent,
    task, taskDefinition,
  },
) => {
  renderLog('GoogleDriveShareManager');
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;

  const [activePerson] = useState(getAppContextValue('profileDrawerPerson'));
  const [emailOfficialNotValidDomain, setEmailOfficialNotValidDomain] = useState(false);
  const [emailOfficialVerifiedLocally, setEmailOfficialVerifiedLocally] = useState(false);
  const [emailOfficialVerifiedToNotExist, setEmailOfficialVerifiedToNotExist] = useState(false);
  const [isEmailOfficialEditModeOn, setIsEmailOfficialEditModeOn] = useState(false);
  const [newAccountNotification, setNewAccountNotification] = useState('');
  const [newAccountNotificationCopied, setNewAccountNotificationCopied] = useState(false);
  const [requiredVariablesMissingMessage, setRequiredVariablesMissingMessage] = useState('');
  const [resultsText, setResultsText] = useState('');
  const [showNewAccountNotification, setShowNewAccountNotification] = useState(false);
  const [suggestedVariablesMissingMessage, setSuggestedVariablesMissingMessage] = useState('');
  const [viewerIsOnHrTeam, setViewerIsOnHrTeam] = useState(false);

  const setIsEmailOfficialEditModeOnLocal = (newMode) => {
    if (setIsEmailOfficialEditModeInParent) {
      setIsEmailOfficialEditModeInParent(newMode);
    }
    setIsEmailOfficialEditModeOn(newMode);
    if (newMode) {
      setEmailOfficialNotValidDomain(false);
      setEmailOfficialVerifiedLocally(false);
      setEmailOfficialVerifiedToNotExist(false);
      document.getElementById('jsonResults').textContent = '';
    }
  };

  const cancelEmailEdit = () => {
    if (setEmailOfficialInParent) {
      setEmailOfficialInParent(savedEmailOfficial);
    }
    setIsEmailOfficialEditModeOn(false);
  };

  const givePersonAccessToFolder = async () => {
    // Turn off warnings & jsonResults
    setRequiredVariablesMissingMessage('');
    setSuggestedVariablesMissingMessage('');
    document.getElementById('jsonResults').textContent = '';

    const { firstName, firstNamePreferred, lastName, emailOfficial: primaryEmail } = activePerson;
    const { googleDriveAssetId } = taskDefinition; // Was driveFolder
    const role = 'writer';  // no error checking for this demo code, must be one of 'reader', 'commenter', 'writer', or 'owner'

    // console.log(`givePersonAccessToFolder: ${primaryEmail}`);
    const giveDriveAccessResults = await weConnectQueryFn('google-share-drive-access', { primaryEmail, driveFolderId: googleDriveAssetId, role }, METHOD.POST);
    console.log('givePersonAccessToFolder: ', giveDriveAccessResults);
    if (giveDriveAccessResults.success) {
      setEmailOfficialVerifiedLocally(true);
      setEmailOfficialVerifiedToNotExist(false);
      if (setEmailOfficialVerifiedInParent) {
        setEmailOfficialVerifiedInParent(true);
      }
      setResultsText(`Staff member '${giveDriveAccessResults.primaryEmail}' has been created`);
      const firstNameToDisplay = firstNamePreferred || firstName;
      setNewAccountNotification(
        `Hi${(firstNameToDisplay) && ` ${firstNameToDisplay}`}, I have just created your new Gmail-powered ${webAppConfig.ORGANIZATION_NAME} email account. Can you please verify you can sign in?
Username: ${primaryEmail}`,
      );
      setShowNewAccountNotification(true);
    } else {
      setResultsText(`ERROR: '${giveDriveAccessResults.error}' A staff member was not created`);
    }
    document.getElementById('jsonResults').textContent = JSON.stringify(giveDriveAccessResults, undefined, 2);
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

  const googleDriveFolderUrl = `https://drive.google.com/drive/u/0/folders/${taskDefinition.googleDriveAssetId}`;
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
  emailOfficialEdited: PropTypes.bool,
  savedEmailOfficial: PropTypes.string,
  setEmailOfficialVerifiedInParent: PropTypes.func,
  setIsEmailOfficialEditModeInParent: PropTypes.func,
  setEmailOfficialInParent: PropTypes.func,
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
