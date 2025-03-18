import React, { useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import EditPersonAwayForm from './EditPersonAwayForm';
import QuestionnaireResponsesList from '../Questionnaire/QuestionnaireResponsesList';
import VisibleProfile from './VisibleProfile';
import { SpanWithLinkStyle } from '../Style/linkStyles';


// TODO Deprecate this drawer soon 2025-Mar-16
const PersonProfileDrawerMainContent = () => {
  renderLog('PersonProfileDrawerMainContent');
  const { getAppContextValue } = useConnectAppContext();

  const [personId] = useState(getAppContextValue('personDrawersPersonId'));
  const [showPersonAway, setShowPersonAway] = useState(false);

  return (
    <PersonProfileDrawerMainContentWrapper>
      <VisibleProfile personId={personId} />
    </PersonProfileDrawerMainContentWrapper>
  );
};

const PersonProfileDrawerMainContentWrapper = styled('div')`
`;

const PersonAwayTitle = styled('span')`
  font-weight: bold;
`;

const PersonAwayTitleAndToggle = styled('div')`
  margin-top: 12px;
`;

export default PersonProfileDrawerMainContent;
