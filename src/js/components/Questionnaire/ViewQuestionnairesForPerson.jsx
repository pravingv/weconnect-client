import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import CopyQuestionnaireLink from './CopyQuestionnaireLink';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { captureQuestionnaireListRetrieveData } from '../../models/QuestionnaireModel';
import QuestionnaireResponsesList from './QuestionnaireResponsesList';


const ViewQuestionnairesForPerson = ({ personId }) => {
  renderLog('ViewQuestionnairesForPerson');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache } = useConnectAppContext();
  const { allQuestionnairesCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [questionnaireList, setQuestionnaireList] = useState([]);

  const questionnaireListRetrieveResults = useFetchData(['questionnaire-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    // console.log('questionnaireListRetrieveResults in Questionnaire useEffect captureQuestionnaireListRetrieveData');
    if (questionnaireListRetrieveResults) {
      captureQuestionnaireListRetrieveData(questionnaireListRetrieveResults, apiDataCache, dispatch);
    }
  }, [questionnaireListRetrieveResults, allQuestionnairesCache]);

  useEffect(() => {
    if (allQuestionnairesCache) {
      setQuestionnaireList(Object.values(allQuestionnairesCache));
    }
  }, [allQuestionnairesCache]);

  return (
    <ViewQuestionnairesForPersonWrapper>
      <QuestionnaireResponsesList personId={personId} />
      <ShowQuestionnaireOptions>
        <div>
          Questionnaires to Answer
        </div>
      </ShowQuestionnaireOptions>
      <QuestionnaireOptions>
        {questionnaireList.map((questionnaire) => (
          <OneQuestionnaire key={`questionnaire-${questionnaire.questionnaireId}`}>
            <div>{questionnaire.questionnaireName}</div>
            <CopyQuestionnaireLink personId={personId} questionnaireId={questionnaire.questionnaireId} />
          </OneQuestionnaire>
        ))}
      </QuestionnaireOptions>
    </ViewQuestionnairesForPersonWrapper>
  );
};
ViewQuestionnairesForPerson.propTypes = {
  personId: PropTypes.number,
};

const OneQuestionnaire = styled('div')`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const ViewQuestionnairesForPersonWrapper = styled('div')`
`;

const QuestionnaireOptions = styled('div')`
`;

const ShowQuestionnaireOptions = styled('div')`
`;

export default ViewQuestionnairesForPerson;
