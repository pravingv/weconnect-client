import { ContentCopy, Launch } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';
import React, { Suspense, useEffect, useState } from 'react';
import { getFullNamePreferredPerson, getPreferredEmail } from '../models/PersonModel';
import { useConnectAppContext } from '../contexts/ConnectAppContext';
import DesignTokenColors from '../common/components/Style/DesignTokenColors';
import webAppConfig from '../config';

const OpenExternalWebSite = React.lazy(() => import(/* webpackChunkName: 'OpenExternalWebSite' */ '../common/components/Widgets/OpenExternalWebSite'));

const DisplayWhatToDoTextAsActiveJSX = ({ taskDefinition, personId }) => {
  const { apiDataCache } = useConnectAppContext();
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
  taskWhatToDoModified = taskWhatToDoModified.replace(/\n/g, '<br />');
  taskWhatToDoModified = taskWhatToDoModified.replace('[official email]', person.emailOfficial || '(official email missing');
  taskWhatToDoModified = taskWhatToDoModified.replace('[person full name]', getFullNamePreferredPerson(person) || '');
  taskWhatToDoModified = taskWhatToDoModified.replace('[personal email]', person.emailPersonal || '(personal email missing');
  taskWhatToDoModified = taskWhatToDoModified.replace('[preferred email]', getPreferredEmail(person) || '(preferred email missing');
  // Copy official email address
  const copyOfficialEmailJsx = person.emailOfficial ? (
    <span>
      Copy
      {' '}
      {webAppConfig.ORGANIZATION_NAME || 'Official'}
      {' '}
      email
      <CopyToClipboard text={person.emailOfficial} onCopy={() => copyEmailOfficial()}>
        <ContentCopyStyled />
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
      Copy personal email
      <CopyToClipboard text={person.emailPersonal} onCopy={() => copyEmailPersonal()}>
        <ContentCopyStyled />
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
            JazzHR profile Link
            <LaunchStyled />
          </span>
        )}
      />
    </Suspense>
  ) : <>JazzHR profile Link</>;
  // Questionnaire needed for Onboarding team to create offer letter
  const questionnaireId = taskDefinition.questionnaireId || -1;
  const questionnaireUrl = `${webAppConfig.PROTOCOL}${webAppConfig.HOSTNAME}/q/${questionnaireId}/${personId}`;
  const questionnaireUrlJSX = (questionnaireId > 0) ? (
    <span>
      <CopyToClipboard text={questionnaireUrl} onCopy={() => copyQuestionnaire()}>
        <ContentCopyStyled />
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
    '[jazzhr link]': jazzHrUrlJsx,
    '[copy questionnaire link]': questionnaireUrlJSX,
    '[task link]': taskActionUrlJsx,
  };

  const parts = taskWhatToDoModified.split(/(\[copy official email]|\[copy personal email]|\[copy questionnaire link]|\[jazzhr link]|\[task link])/);

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
