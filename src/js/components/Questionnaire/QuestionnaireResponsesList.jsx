import { Launch } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import React, { Suspense, useEffect, useState } from 'react';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { renderLog } from '../../common/utils/logging';
import webAppConfig from '../../config';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { useGetPersonById } from '../../models/PersonModel';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { captureQuestionnaireListRetrieveData } from '../../models/QuestionnaireModel';

const OpenExternalWebSite = React.lazy(() => import(/* webpackChunkName: 'OpenExternalWebSite' */ '../../common/components/Widgets/OpenExternalWebSite'));

const QuestionnaireResponsesList = ({ personId }) => {
  renderLog('QuestionnaireList');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const { allQuestionsCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  // const [person] = useState(getAppContextValue('profileDrawerPerson'));
  const [person] = useState(useGetPersonById(getAppContextValue('profileDrawerPersonId')));
  const [questionnaireList, setQuestionnaireList] = useState([]);

  // Although we are sending a list, there will only be one person id, if there were more, just append them with commas
  // OLD: const requestParams = `personIdList[]=${person.id}`;
  const requestParams = {
    personIdList: [person.id],
  };

  const questionnaireResponsesListRetrieveResults = useFetchData(['questionnaire-responses-list-retrieve'], requestParams, METHOD.GET);
  // const { data: dataQRL, isSuccess: isSuccessQRL, isFetching: isFetchingQRL } = responsesRetrieveResults;
  const { data: dataQRL, isFetching: isFetchingQRL } = questionnaireResponsesListRetrieveResults;
  // if (isFetchingQRL) {
  //   console.log('isFetching  ------------ \'questionnaire-responses-list-retrieve\'');
  // }
  // useEffect(() => {
  //   if (dataQRL !== undefined && isFetchingQRL === false && person) {
  //     console.log('useFetchData in QuestionnaireResponsesList useEffect dataQRL is good:', dataQRL, isSuccessQRL, isFetchingQRL);
  //     console.log('Successfully retrieved QuestionnaireResponsesList...');
  //     setQuestionnaireList(dataQRL.questionnaireList);
  //   }
  // }, [dataQRL, isFetchingQRL, isSuccessQRL, person]);
  useEffect(() => {
    if (questionnaireResponsesListRetrieveResults) {
      captureQuestionnaireListRetrieveData(questionnaireResponsesListRetrieveResults, apiDataCache, dispatch);
      if (dataQRL && dataQRL.questionnaireList && isFetchingQRL === false) {
        setQuestionnaireList(dataQRL.questionnaireList);
      }
    }
  }, [questionnaireResponsesListRetrieveResults, allQuestionsCache]);

  return (
    <div>
      {questionnaireList.length > 0 && (
        <>
          <QuestionnaireResponses>
            Answered
          </QuestionnaireResponses>
          <QuestionnaireListWrapper>
            {questionnaireList.map((questionnaire) => (
              <OneQuestionnaireWrapper key={`questionnaire-${questionnaire.id}`}>
                <QuestionText>
                  {questionnaire.questionnaireName}
                </QuestionText>
                {/* <CopyQuestionnaireLink personId={personId} questionnaireId={questionnaire.id} /> */}
                <Suspense fallback={<></>}>
                  <OpenExternalWebSite
                    linkIdAttribute="view answers"
                    url={`${webAppConfig.PROTOCOL}${webAppConfig.HOSTNAME}/answers/${questionnaire.id}/${personId}`}
                    target="_blank"
                    body={(
                      <Tooltip title="View answers">
                        <div>
                          view answers
                          <LaunchStyled />
                        </div>
                      </Tooltip>
                    )}
                  />
                </Suspense>
                {questionnaire.dateQuestionnaireCompleted && (
                  <WhenCompleted>
                    Completed on
                    {' '}
                    {questionnaire.dateQuestionnaireCompleted.toLocaleString('en-US', {})}
                  </WhenCompleted>
                )}
              </OneQuestionnaireWrapper>
            ))}
          </QuestionnaireListWrapper>
        </>
      )}
    </div>
  );
};
QuestionnaireResponsesList.propTypes = {
  personId: PropTypes.number,
};

const LaunchStyled = styled(Launch)`
  height: 14px;
  margin-left: 2px;
  margin-top: -3px;
  width: 14px;
`;

const QuestionnaireResponses = styled('div')`
  font-weight: 500;
  margin-bottom: 6px;
  margin-top: 20px;
`;
const WhenCompleted = styled('div')`
  color: ${DesignTokenColors.neutralUI300};
  font-size: .9em;
`;

const OneQuestionnaireWrapper = styled('div')`
  display: flex;
  justify-content: flex-start;
`;

const QuestionText = styled('div')`
  margin-right: 8px;
`;

const QuestionnaireListWrapper = styled('div')`
  margin-bottom: 30px;
`;

export default QuestionnaireResponsesList;
