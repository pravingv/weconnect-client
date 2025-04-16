import { TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
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

const ACCEPTED_EMAIL_DOMAINS = ['@wevoteeducation.org'];

const EmailOfficialManager = (
  {
    emailOfficialEdited, savedEmailOfficial, setEmailOfficialInParent,
    setIsEmailOfficialEditModeInParent, setEmailOfficialVerifiedInParent,
  },
) => {
  renderLog('EmailOfficialManager');
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

  const reformatPhoneNumberToGooglePattern = (phoneNumber) => {
    if (!phoneNumber) {
      return '';
    }
    const digitsLocal = phoneNumber.match(/\d/g);
    if (digitsLocal[0] === '1') {
      digitsLocal.shift();
    }
    const str = `+1 ${digitsLocal[0]}${digitsLocal[1]}${digitsLocal[2]} ${digitsLocal[3]}${digitsLocal[4]}${digitsLocal[5]} ${digitsLocal[6]}${digitsLocal[7]}${digitsLocal[8]}${digitsLocal[9]}`;
    // console.log(str);
    return str;
  };

  const createGoogleUser = async () => {
    // Turn off warnings & jsonResults
    setRequiredVariablesMissingMessage('');
    setSuggestedVariablesMissingMessage('');
    document.getElementById('jsonResults').textContent = '';

    const { firstName, firstNamePreferred, lastName, emailOfficial: primaryEmail, emailPersonal, phoneNumber } = activePerson;
    const password = generateRandomString(12); // Generate a random password
    const phoneNumberInGoogleFormat = reformatPhoneNumberToGooglePattern(phoneNumber);

    // console.log(`createGoogleUser: ${primaryEmail}`);
    const createUserResults = await weConnectQueryFn('google-create-user', { firstName: firstNamePreferred || firstName, lastName, personalEmail: emailPersonal, primaryEmail, password, phoneNumber: phoneNumberInGoogleFormat }, METHOD.POST);
    // console.log('createGoogleUser: ', createUserResults);
    if (createUserResults.success) {
      setEmailOfficialVerifiedLocally(true);
      setEmailOfficialVerifiedToNotExist(false);
      if (setEmailOfficialVerifiedInParent) {
        setEmailOfficialVerifiedInParent(true);
      }
      setResultsText(`Staff member '${createUserResults.primaryEmail}' has been created`);
      const firstNameToDisplay = firstNamePreferred || firstName;
      setNewAccountNotification(
        `Hi${(firstNameToDisplay) && ` ${firstNameToDisplay}`}, I have just created your new Gmail-powered ${webAppConfig.ORGANIZATION_NAME} email account. Can you please verify you can sign in?
Username: ${primaryEmail}
Password (expires in 48 hours): ${password}`,
      );
      setShowNewAccountNotification(true);
    } else {
      setResultsText(`ERROR: '${createUserResults.error}' A staff member was not created`);
    }
    document.getElementById('jsonResults').textContent = JSON.stringify(createUserResults, undefined, 2);
  };

  const newAccountNotificationOnCopy = () => {
    setNewAccountNotificationCopied(true);
    setTimeout(() => {
      setNewAccountNotificationCopied(false);
    }, 1500);
  };

  const resetPassword = async () => {
    //
  };

  const verifyEmail = async () => {
    let displayRawData = true; // When debugging set this to true
    let verifiedJustNow = false;
    let verifiedToNotExistJustNow = false;
    // console.log('verifyEmail savedEmailOfficial:', savedEmailOfficial);
    // Check to see if savedEmailOfficial is in approved email domain
    const isAcceptedDomain = ACCEPTED_EMAIL_DOMAINS.some((domain) => savedEmailOfficial.toLowerCase().endsWith(domain.toLowerCase()));
    if (!isAcceptedDomain) {
      setEmailOfficialNotValidDomain(true);
    } else {
      const verificationData = await weConnectQueryFn('google-get-user-info', { primaryEmail: savedEmailOfficial }, METHOD.POST);
      if (!verificationData || !verificationData.isMailboxSetup) {
        displayRawData = true;
        if (setEmailOfficialVerifiedInParent) {
          setEmailOfficialVerifiedInParent(false);
        }
        setEmailOfficialVerifiedLocally(false);
        if (verificationData && !verificationData.userFound) {
          verifiedToNotExistJustNow = true;
        }
      } else {
        verifiedJustNow = !!(verificationData.creationTime);
        verifiedToNotExistJustNow = !(verificationData.creationTime);
      }
      if (verifiedJustNow) {
        if (setEmailOfficialVerifiedInParent) {
          setEmailOfficialVerifiedInParent(true);
        }
        setEmailOfficialVerifiedLocally(true);
        setEmailOfficialVerifiedToNotExist(false);
      } else if (verifiedToNotExistJustNow) {
        if (setEmailOfficialVerifiedInParent) {
          setEmailOfficialVerifiedInParent(false);
        }
        setEmailOfficialVerifiedLocally(false);
        setEmailOfficialVerifiedToNotExist(true);
      }
      if (displayRawData) {
        // console.log(`getOneGoogleUser ${savedEmailOfficial}: `, verificationData);
        document.getElementById('jsonResults').textContent = JSON.stringify(verificationData, undefined, 2);
      }
      // creationTime: Tells us the account exists
      // agreedToTerms: tells us the account has been visited by the volunteer
      // lastLoginTime: Defaults to 1970 if the account has never logged in.
      // creationTime, isMailboxSetup, lastLoginTime, googleUserId
    }
    const requiredVariables = ['emailPersonal', 'firstName', 'lastName', 'phoneNumber']; // Add all required variables here
    // const suggestedVariables = []; // Add all suggested variables here
    let requiredVariableMissing = false;
    let requiredVariablesMissingMessageTemp = '';
    // let suggestedVariableMissing = false;
    // let suggestedVariablesMissingMessageTemp = '';
    requiredVariables.forEach((variable) => {
      if (!activePerson[variable]) {
        requiredVariableMissing = true;
        requiredVariablesMissingMessageTemp += `[${variable}]`;
      }
    });
    // suggestedVariables.forEach((variable) => {
    //   if (!activePerson[variable]) {
    //     suggestedVariableMissing = true;
    //     suggestedVariablesMissingMessageTemp += `[${variable}]`;
    //   }
    // });
    if (requiredVariableMissing) {
      requiredVariablesMissingMessageTemp = `Add before create: ${requiredVariablesMissingMessageTemp}`;
      setRequiredVariablesMissingMessage(requiredVariablesMissingMessageTemp);
    }
    // if (suggestedVariableMissing) {
    //   suggestedVariablesMissingMessageTemp = `Suggest updating before create: ${suggestedVariablesMissingMessageTemp}`;
    //   setSuggestedVariablesMissingMessage(suggestedVariablesMissingMessageTemp);
    // }
  };

  useEffect(() => {
    setViewerIsOnHrTeam(viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights));
  }, [viewerAccessRights]);

  const emailOfficialExistsInDbAndUnchanged = (activePerson.emailOfficial && !emailOfficialEdited);
  const emailOfficialNotVerifiedInDbOrLocally = !(activePerson.emailOfficialVerified || emailOfficialVerifiedLocally);
  const showCreateEmailLink = emailOfficialExistsInDbAndUnchanged && !isEmailOfficialEditModeOn && emailOfficialVerifiedToNotExist;
  const showEmailOfficialDoesNotExist = emailOfficialExistsInDbAndUnchanged && emailOfficialVerifiedToNotExist;
  const showEditEmailLink = emailOfficialExistsInDbAndUnchanged && !isEmailOfficialEditModeOn;
  const showEmailVerified = emailOfficialExistsInDbAndUnchanged && (!activePerson.emailOfficialVerified && emailOfficialVerifiedLocally);
  const showSavedEmailOfficialVerified = emailOfficialExistsInDbAndUnchanged && (activePerson.emailOfficialVerified);
  const showResetPassword = emailOfficialExistsInDbAndUnchanged && (isEmailOfficialEditModeOn && (activePerson.emailOfficialVerified || emailOfficialVerifiedLocally));
  const showVerifyEmailLink = emailOfficialExistsInDbAndUnchanged && ((isEmailOfficialEditModeOn && !emailOfficialVerifiedToNotExist) || emailOfficialNotVerifiedInDbOrLocally);

  return (
    <EmailOfficialManagerWrapper>
      {viewerIsOnHrTeam && (
        <ActionOptionContainerOverflow>
          <ActionOptionContainerLeft8>
            <ActionOptionList>
              {showEmailVerified ? (
                <ActionOption>
                  VERIFIED
                </ActionOption>
              ) : (
                <>
                  {showSavedEmailOfficialVerified && (
                    <ActionOption>
                      VERIFIED-DB
                    </ActionOption>
                  )}
                </>
              )}
              {showEmailOfficialDoesNotExist && (
                <ActionOption>
                  DOESNT EXIST
                </ActionOption>
              )}
              {emailOfficialNotValidDomain && (
                <ActionOption>
                  NOT VALID DOMAIN
                </ActionOption>
              )}
              {showVerifyEmailLink && (
                <ActionOption>
                  <SpanWithLinkStyle onClick={() => verifyEmail()}>
                    Verify
                  </SpanWithLinkStyle>
                </ActionOption>
              )}
              {showCreateEmailLink && (
                <ActionOption>
                  <SpanWithLinkStyle onClick={() => createGoogleUser()}>
                    Create Gmail account
                  </SpanWithLinkStyle>
                </ActionOption>
              )}
              {showResetPassword && (
                <ActionOption>
                  <SpanWithLinkStyle onClick={() => resetPassword()}>
                    Reset password
                  </SpanWithLinkStyle>
                </ActionOption>
              )}
              {showEditEmailLink && (
                <ActionOption>
                  <SpanWithLinkStyle onClick={() => setIsEmailOfficialEditModeOnLocal(true)}>
                    edit
                  </SpanWithLinkStyle>
                </ActionOption>
              )}
              {(savedEmailOfficial && !showEditEmailLink && !emailOfficialEdited) && (
                <ActionOption>
                  <SpanWithLinkStyle onClick={() => setIsEmailOfficialEditModeOnLocal(false)}>
                    cancel
                  </SpanWithLinkStyle>
                </ActionOption>
              )}
              {emailOfficialEdited && (
                <>
                  <ActionOption>
                    To verify/create email, click &quot;Save Person&quot;
                  </ActionOption>
                  <ActionOption>
                    <SpanWithLinkStyle onClick={() => cancelEmailEdit()}>
                      cancel
                    </SpanWithLinkStyle>
                  </ActionOption>
                </>
              )}
            </ActionOptionList>
          </ActionOptionContainerLeft8>
        </ActionOptionContainerOverflow>
      )}
      {(requiredVariablesMissingMessage) && (
        <div>
          {requiredVariablesMissingMessage}
        </div>
      )}
      {(suggestedVariablesMissingMessage) && (
        <div>
          {suggestedVariablesMissingMessage}
        </div>
      )}
      {!!(resultsText) && (
        <div>
          {resultsText}
        </div>
      )}
      {showNewAccountNotification && (
        <>
          <ActionOptionContainerOverflow>
            <ActionOptionContainerLeft8>
              <ActionOptionList>
                <ActionOption>
                  {newAccountNotificationCopied ? 'Copied!' : (
                    <CopyToClipboard text={newAccountNotification} onCopy={() => newAccountNotificationOnCopy(true)}>
                      <SpanWithLinkStyle>
                        Copy to Clipboard
                      </SpanWithLinkStyle>
                    </CopyToClipboard>
                  )}
                </ActionOption>
                <ActionOption>
                  Please send to volunteer via Slack.
                </ActionOption>
              </ActionOptionList>
            </ActionOptionContainerLeft8>
          </ActionOptionContainerOverflow>
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
    </EmailOfficialManagerWrapper>
  );
};
EmailOfficialManager.propTypes = {
  emailOfficialEdited: PropTypes.bool,
  savedEmailOfficial: PropTypes.string,
  setEmailOfficialVerifiedInParent: PropTypes.func,
  setIsEmailOfficialEditModeInParent: PropTypes.func,
  setEmailOfficialInParent: PropTypes.func,
};

const styles = () => ({
  formControl: {
    width: '100%',
  },
});

const EmailOfficialManagerWrapper = styled('div')`
  margin: 0 auto;
  // padding-bottom: 40px;
  width: 100%;
`;

export default withStyles(styles)(EmailOfficialManager);
