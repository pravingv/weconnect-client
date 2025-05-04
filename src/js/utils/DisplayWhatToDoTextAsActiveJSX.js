import { ContentCopy, Launch } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import React, { Suspense, useEffect, useState } from 'react';
import { getFullNamePreferredPerson, getPreferredEmail } from '../models/PersonModel';
import { useConnectAppContext } from '../contexts/ConnectAppContext';
import { SpanWithLinkStyle } from '../components/Style/linkStyles';
import DesignTokenColors from '../common/components/Style/DesignTokenColors';
import webAppConfig from '../config';

const OpenExternalWebSite = React.lazy(() => import(/* webpackChunkName: 'OpenExternalWebSite' */ '../common/components/Widgets/OpenExternalWebSite'));

const DisplayWhatToDoTextAsActiveJSX = ({ taskDefinition, personId }) => {
  const { apiDataCache, setAppContextValue } = useConnectAppContext();
  const { allPeopleCache } = apiDataCache;

  const [person, setPerson] = useState({});
  const [questionnaireCopied, setQuestionnaireCopied] = useState('');
  const [emailOfficialCopied, setEmailOfficialCopied] = useState('');
  const [emailPersonalCopied, setEmailPersonalCopied] = useState('');

  const copyEmailOfficial = () => {
    setEmailOfficialCopied('Copied!');
    setTimeout(() => {
      setEmailOfficialCopied('');
    }, 1500);
  };

  const copyEmailPersonal = () => {
    setEmailPersonalCopied('Copied!');
    setTimeout(() => {
      setEmailPersonalCopied('');
    }, 1500);
  };

  const copyQuestionnaire = () => {
    setQuestionnaireCopied('Copied!');
    setTimeout(() => {
      setQuestionnaireCopied('');
    }, 1500);
  };

  const editPersonClick = () => {
    setAppContextValue('headerProfileDrawerOpen', true);
    setAppContextValue('profileDrawerPerson', person);
    setAppContextValue('profileDrawerPersonId', person.personId);
    setAppContextValue('headerProfileSection', 'nameAndPhoto');
  };

  const profileQuestionnairesClick = () => {
    setAppContextValue('headerProfileDrawerOpen', true);
    setAppContextValue('profileDrawerPerson', person);
    setAppContextValue('profileDrawerPersonId', person.personId);
    setAppContextValue('headerProfileSection', 'personQuestionnaires');
  };

  useEffect(() => {
    let personTemp = {};
    if (allPeopleCache) {
      personTemp = allPeopleCache[personId] || {};
    }
    setPerson(personTemp);
  }, [personId, allPeopleCache]);

  // console.log('useGetPersonById personId:', personId, ', allPeopleCache:', allPeopleCache);
  // console.log('task:', task, ', taskDefinition:', taskDefinition, ', person:', person);
  let taskWhatToDoModified = taskDefinition.taskWhatToDo || '';
  // NOTE: Any customization tokens added here should also be added to customizationTokensList
  //  in EditTaskDefinitionForm
  taskWhatToDoModified = taskWhatToDoModified.replace(/\n/g, '<br />');
  taskWhatToDoModified = taskWhatToDoModified.replace('[official email]', person.emailOfficial || '(official email missing');
  taskWhatToDoModified = taskWhatToDoModified.replace('[person first name]', person.firstName || '(first name missing');
  taskWhatToDoModified = taskWhatToDoModified.replace('[person full name]', getFullNamePreferredPerson(person) || '');
  taskWhatToDoModified = taskWhatToDoModified.replace('[personal email]', person.emailPersonal || '(personal email missing');
  taskWhatToDoModified = taskWhatToDoModified.replace('[preferred email]', getPreferredEmail(person) || '(preferred email missing');
  // Copy official email address
  const copyOfficialEmailJsx = person.emailOfficial ? (
    <span>
      <CopyToClipboard text={person.emailOfficial} onCopy={() => copyEmailOfficial()}>
        <SpanWithLinkStyle>
          Copy
          {' '}
          {webAppConfig.ORGANIZATION_NAME || 'Official'}
          {' '}
          email
          <ContentCopyStyled />
        </SpanWithLinkStyle>
      </CopyToClipboard>
      {' '}
      {emailOfficialCopied}
    </span>
  ) : (
    <>
      (
      {webAppConfig.ORGANIZATION_NAME || 'Official'}
      {' '}
      Email Missing)
    </>
  );
  // Copy personal email address
  const copyPersonalEmailJsx = person.emailPersonal ? (
    <span>
      <CopyToClipboard text={person.emailPersonal} onCopy={() => copyEmailPersonal()}>
        <SpanWithLinkStyle>
          Copy personal email
          <ContentCopyStyled />
        </SpanWithLinkStyle>
      </CopyToClipboard>
      {' '}
      {emailPersonalCopied}
    </span>
  ) : <>(Personal Email Missing)</>;

  // Open JazzHR profile link
  const jazzHrUrlJsx = person.jazzHrUrl ? (
    <Suspense fallback={<></>}>
      <OpenExternalWebSite
        linkIdAttribute="JazzHrLink"
        url={person.jazzHrUrl}
        target="_blank"
        body={(
          <span>
            JazzHR profile
            <LaunchStyled />
          </span>
        )}
      />
    </Suspense>
  ) : <>JazzHR profile</>;

  // Open JazzHR discussion section
  const jazzHrDiscussionUrlJsx = (person.jazzHrUrl && person.jazzHrUrl.endsWith('/profile')) ? (
    <Suspense fallback={<></>}>
      <OpenExternalWebSite
        linkIdAttribute="jazzHrDiscussionUrlId"
        url={person.jazzHrUrl.replace(/\/profile$/, '/discussion')}
        target="_blank"
        body={(
          <span>
            JazzHR discussion
            <LaunchStyled />
          </span>
        )}
      />
    </Suspense>
  ) : <>JazzHR discussion</>;

  // Open JazzHR documents section
  const jazzHrDocumentsUrlJsx = (person.jazzHrUrl && person.jazzHrUrl.endsWith('/profile')) ? (
    <Suspense fallback={<></>}>
      <OpenExternalWebSite
        linkIdAttribute="jazzHrDocumentsUrlId"
        url={person.jazzHrUrl.replace(/\/profile$/, '/document')}
        target="_blank"
        body={(
          <span>
            JazzHR documents
            <LaunchStyled />
          </span>
        )}
      />
    </Suspense>
  ) : <>JazzHR documents</>;

  // Open JazzHR emails section
  const jazzHrEmailsUrlJsx = (person.jazzHrUrl && person.jazzHrUrl.endsWith('/profile')) ? (
    <Suspense fallback={<></>}>
      <OpenExternalWebSite
        linkIdAttribute="jazzHrEmailsUrlId"
        url={person.jazzHrUrl.replace(/\/profile$/, '/message')}
        target="_blank"
        body={(
          <span>
            JazzHR emails
            <LaunchStyled />
          </span>
        )}
      />
    </Suspense>
  ) : <>JazzHR emails</>;

  // Open Job Description Google Doc
  const jobDescriptionsUrlJsx = (
    <Suspense fallback={<></>}>
      <OpenExternalWebSite
        linkIdAttribute="jobDescriptionsUrlId"
        url="https://docs.google.com/document/d/1RMQc6yl3p6cM-CGo5sVlQ7zUqGfvQPVrlzsv5NxWmg8/edit"
        target="_blank"
        body={(
          <span>
            Job descriptions
            <LaunchStyled />
          </span>
        )}
      />
    </Suspense>
  );

  // Open the edit profile drawer
  const openProfileEditDrawerJsx = person ? (
    <SpanWithLinkStyle onClick={() => editPersonClick()}>
      Edit profile
    </SpanWithLinkStyle>
  ) : <>Edit profile</>;

  // Open the view profile questionnaires drawer
  const openProfileQuestionnairesDrawerJsx = person ? (
    <SpanWithLinkStyle onClick={() => profileQuestionnairesClick()}>
      Profile questionnaires
    </SpanWithLinkStyle>
  ) : <>Profile questionnaires</>;

  // Questionnaire needed for Onboarding team to create offer letter
  const questionnaireId = taskDefinition.questionnaireId || -1;
  const questionnaireUrl = `${webAppConfig.PROTOCOL}${webAppConfig.HOSTNAME}/q/${questionnaireId}/${personId}`;
  const questionnaireUrlJSX = (questionnaireId > 0) ? (
    <span>
      <CopyToClipboard text={questionnaireUrl} onCopy={() => copyQuestionnaire()}>
        <SpanWithLinkStyle>
          Copy questionnaire link
          <ContentCopyStyled />
        </SpanWithLinkStyle>
      </CopyToClipboard>
      {' '}
      {questionnaireCopied}
    </span>
  ) : <>(Questionnaire Id Missing)</>;

  // Link to where the person needs to go to complete this task
  const taskActionUrlJsx = (taskDefinition.taskActionUrl) ? (
    <div>
      <Suspense fallback={<></>}>
        <OpenExternalWebSite
          linkIdAttribute={`taskActionUrl-${taskDefinition.id}`}
          url={taskDefinition.taskActionUrl}
          target="_blank"
          body={(
            <Tooltip
              arrow
              id={`taskActionUrlTooltip-${taskDefinition.id}`}
              title={taskDefinition.taskActionUrl}
            >
              <LaunchStyled />
            </Tooltip>
          )}
        />
      </Suspense>
    </div>
  ) : <></>;

  const replacements = {
    '[copy official email]': copyOfficialEmailJsx,
    '[copy personal email]': copyPersonalEmailJsx,
    '[profile edit]': openProfileEditDrawerJsx,
    '[profile questionnaires]': openProfileQuestionnairesDrawerJsx,
    '[jazzhr discussion]': jazzHrDiscussionUrlJsx,
    '[jazzhr documents]': jazzHrDocumentsUrlJsx,
    '[jazzhr emails]': jazzHrEmailsUrlJsx,
    '[jazzhr link]': jazzHrUrlJsx,
    '[jazzhr profile]': jazzHrUrlJsx,
    '[job descriptions]': jobDescriptionsUrlJsx,
    '[copy questionnaire link]': questionnaireUrlJSX,
    '[task link]': taskActionUrlJsx,
  };

  const parts = taskWhatToDoModified.split(/(\[copy official email]|\[copy personal email]|\[copy questionnaire link]|\[profile edit]|\[profile questionnaires]|\[jazzhr discussion]|\[jazzhr documents]|\[jazzhr emails]|\[jazzhr link]|\[jazzhr profile]|\[job descriptions]|\[task link])/);

  return (
    <span>
      {parts.map((part, index) => {
        if (replacements[part]) {
          // eslint-disable-next-line react/no-array-index-key
          return <React.Fragment key={index}>{replacements[part]}</React.Fragment>;
        }
        // eslint-disable-next-line react/no-danger,react/no-array-index-key
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </span>
  );
};
DisplayWhatToDoTextAsActiveJSX.propTypes = {
  personId: PropTypes.number.isRequired,
  taskDefinition: PropTypes.object.isRequired,
  // task: PropTypes.object.isRequired,
};

const ContentCopyStyled = styled(ContentCopy)`
  color: ${DesignTokenColors.neutral300};
  height: 16px;
  margin-left: 4px;
  width: 16px;
`;

const LaunchStyled = styled(Launch)`
  color: ${DesignTokenColors.primary500};
  cursor: pointer;
  margin-left: 2px;
  margin-top: -3px;
  width: 14px;
  height: 14px;
`;

export default DisplayWhatToDoTextAsActiveJSX;
