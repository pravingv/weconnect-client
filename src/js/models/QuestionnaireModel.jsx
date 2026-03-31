import isEqual from 'lodash-es/isEqual';

export function getInitialGlobalQuestionnaireVariables () {
  return {
    allQuestionnairesCache: {}, // This is a dictionary key: questionnaireId, value: questionnaire dict
    allQuestionsCache: {}, // This is a dictionary key: questionId, value: question dict
    allAnswersCache: {}, // This is a dictionary key: personId, value: another dictionary key: questionId, value: answer dict
    dateQuestionnaireCompletedDict: {}, // This is a dictionary key: personId, value: another dictionary key: questionnaireId, value: dateQuestionnaireCompleted
    mostRecentQuestionIdSaved: -1,
    mostRecentQuestionSaved: {
      questionnaireId: -1,
    },
    mostRecentQuestionnaireIdSaved: -1,
    mostRecentQuestionnaireSaved: {
      firstName: '',
      lastName: '',
      questionnaireId: -1,
    },
    questionsAnsweredPersonIdList: {}, // This is a dictionary key: questionId, value: list of personIds who have answered the question
    questionnairesAnsweredByPersonList: {}, // This is a dictionary key: questionnaireId, value: list of personIds who have answered the questionnaire
    questionnairesAnsweredListByPersonId: {}, // This is a dictionary key: personId, value: list of questionnaireIds the person has answered
    searchResults: [],
  };
}

// This is called after making this fetchData request:
// const questionnaireResponsesListRetrieveResults = useFetchData(['questionnaire-list-retrieve'], {});
export function captureQuestionnaireListRetrieveData (
  incomingRetrieveResults = {},
  apiDataCache = {},
  dispatch,
) {
  const { data, isSuccess } = incomingRetrieveResults;
  const allQuestionnairesCache = apiDataCache.allQuestionnairesCache || {};
  const changeResults = {
    allQuestionnairesCache,
    allQuestionnairesCacheChanged: false,
  };
  const allQuestionnairesCacheNew = { ...allQuestionnairesCache };
  let newQuestionnaireListDataReceived = false;
  if (data && data.questionnaireList && isSuccess === true) {
    data.questionnaireList.forEach((questionnaire) => {
      if (questionnaire && questionnaire.questionnaireId && questionnaire.questionnaireId >= 0) {
        if (!allQuestionnairesCacheNew[questionnaire.questionnaireId]) {
          allQuestionnairesCacheNew[questionnaire.questionnaireId] = questionnaire;
          newQuestionnaireListDataReceived = true;
        } else if (!isEqual(questionnaire, allQuestionnairesCacheNew[questionnaire.questionnaireId])) {
          allQuestionnairesCacheNew[questionnaire.questionnaireId] = questionnaire;
          newQuestionnaireListDataReceived = true;
        }
      }
    });
  }
  if (newQuestionnaireListDataReceived) {
    // console.log('QuestionnaireListRetrieve setting allQuestionnairesCacheNew:', allQuestionnairesCacheNew);
    dispatch({ type: 'updateByKeyValue', key: 'allQuestionnairesCache', value: allQuestionnairesCacheNew });
    changeResults.allQuestionnairesCache = allQuestionnairesCacheNew;
    changeResults.allQuestionnairesCacheChanged = true;
  }
  return changeResults;
}

// This is called after making this fetchData request:
// const answerListRetrieveData = useFetchData(['questionnaire-responses-list-retrieve'], {}); // ...with params for questionnaireId and personId
export function captureAnswerListRetrieveData ( // Was captureQuestionnaireResponsesListRetrieveData
  incomingRetrieveResults = {},
  apiDataCache = {},
  dispatch,
) {
  const { data, isSuccess } = incomingRetrieveResults;
  // const allQuestionnairesCache = apiDataCache.allQuestionnairesCache || {};
  // const allQuestionsCache = apiDataCache.allQuestionsCache || {};
  const allAnswersCache = apiDataCache.allAnswersCache || {};
  const changeResults = {
    // allQuestionnairesCache,
    // allQuestionnairesCacheChanged: false,
    // allQuestionsCache,
    // allQuestionsCacheChanged: false,
    allAnswersCache,
    allAnswersCacheChanged: false,
  };
  // const allQuestionnairesCacheNew = { ...allQuestionnairesCache };
  // const allQuestionsCacheNew = { ...allQuestionsCache };
  const allAnswersCacheNew = { ...allAnswersCache };
  // let newQuestionnaireListDataReceived = false;
  // if (data && data.questionnaireList && isSuccess === true) {
  //   data.questionnaireList.forEach((questionnaire) => {
  //     if (questionnaire && questionnaire.questionnaireId && questionnaire.questionnaireId >= 0) {
  //       if (!allQuestionnairesCacheNew[questionnaire.questionnaireId]) {
  //         allQuestionnairesCacheNew[questionnaire.questionnaireId] = questionnaire;
  //         newQuestionnaireListDataReceived = true;
  //       } else if (!isEqual(questionnaire, allQuestionnairesCacheNew[questionnaire.questionnaireId])) {
  //         allQuestionnairesCacheNew[questionnaire.questionnaireId] = questionnaire;
  //         newQuestionnaireListDataReceived = true;
  //       }
  //     }
  //   });
  // }
  // let newQuestionListDataReceived = false;
  // if (data && data.questionList && isSuccess === true) {
  //   data.questionList.forEach((question) => {
  //     if (question && question.questionId && question.questionId >= 0) {
  //       if (!allQuestionsCacheNew[question.questionId]) {
  //         allQuestionsCacheNew[question.questionId] = question;
  //         newQuestionListDataReceived = true;
  //       } else if (!isEqual(question, allQuestionsCacheNew[question.questionId])) {
  //         allQuestionsCacheNew[question.questionId] = question;
  //         newQuestionListDataReceived = true;
  //       }
  //     }
  //   });
  // }
  let newAnswerListDataReceived = false;
  if (data && data.questionAnswerList && isSuccess === true) {
    // console.log('AnswerListRetrieve data:', data);
    data.questionAnswerList.forEach((answer) => {
      // console.log('== Answer:', answer);
      if (answer && answer.personId >= 0 && answer.questionnaireId >= 0) {
        // console.log('Answer from personId:', answer.personId);
        if (!allAnswersCacheNew[answer.personId]) {
          allAnswersCacheNew[answer.personId] = {};
        }
        if (!allAnswersCacheNew[answer.personId][answer.questionId]) {
          allAnswersCacheNew[answer.personId][answer.questionId] = answer;
          newAnswerListDataReceived = true;
        } else if (!isEqual(answer, allAnswersCacheNew[answer.personId][answer.questionId])) {
          allAnswersCacheNew[answer.personId][answer.questionId] = answer;
          newAnswerListDataReceived = true;
        }
      }
    });
    // if (newQuestionnaireListDataReceived) {
    //   // console.log('QuestionnaireListRetrieve setting allQuestionnairesCacheNew:', allQuestionnairesCacheNew);
    //   dispatch({ type: 'updateByKeyValue', key: 'allQuestionnairesCache', value: allQuestionnairesCacheNew });
    //   changeResults.allQuestionnairesCache = allQuestionnairesCacheNew;
    //   changeResults.allQuestionnairesCacheChanged = true;
    // }
    // if (newQuestionListDataReceived) {
    //   // console.log('QuestionnaireListRetrieve setting allQuestionsCacheNew:', allQuestionsCacheNew);
    //   dispatch({ type: 'updateByKeyValue', key: 'allQuestionsCache', value: allQuestionsCacheNew });
    //   changeResults.allQuestionsCache = allQuestionsCacheNew;
    //   changeResults.allQuestionsCacheChanged = true;
    // }
    if (newAnswerListDataReceived) {
      dispatch({ type: 'updateByKeyValue', key: 'allAnswersCache', value: allAnswersCacheNew });
      changeResults.allAnswersCache = allAnswersCacheNew;
      changeResults.allAnswersCacheChanged = true;
    }
  }
  return changeResults;
}

// This is called after making this fetchData request:
// const questionListRetrieveResults = useFetchData(['question-list-retrieve'], {}, METHOD.GET);
export function captureQuestionListRetrieveData (
  incomingRetrieveResults = {},
  apiDataCache = {},
  dispatch,
) {
  const { data, isSuccess } = incomingRetrieveResults;
  const allQuestionsCache = apiDataCache.allQuestionsCache || {};
  const changeResults = {
    allQuestionsCache,
    allQuestionsCacheChanged: false,
  };
  const allQuestionsCacheNew = { ...allQuestionsCache };
  let newQuestionListDataReceived = false;
  if (data && data.questionList && isSuccess === true) {
    data.questionList.forEach((question) => {
      if (question && question.questionId && question.questionId >= 0) {
        if (!allQuestionsCacheNew[question.questionId]) {
          allQuestionsCacheNew[question.questionId] = question;
          newQuestionListDataReceived = true;
        } else if (!isEqual(question, allQuestionsCacheNew[question.questionId])) {
          allQuestionsCacheNew[question.questionId] = question;
          newQuestionListDataReceived = true;
        }
      }
    });
  }
  if (newQuestionListDataReceived) {
    // console.log('QuestionnaireListRetrieve setting allQuestionsCacheNew:', allQuestionsCacheNew);
    dispatch({ type: 'updateByKeyValue', key: 'allQuestionsCache', value: allQuestionsCacheNew });
    changeResults.allQuestionsCache = allQuestionsCacheNew;
    changeResults.allQuestionsCacheChanged = true;
  }
  return changeResults;
}

export const getAnswerToQuestion = (personId, questionId, allAnswersCache) => {
  let answer = {};
  if (allAnswersCache) {
    // personId, then questionId
    const dictOfQuestionsForThisPerson = allAnswersCache[personId] || {};
    // console.log('dictOfQuestionsForThisPerson:', dictOfQuestionsForThisPerson);
    answer = dictOfQuestionsForThisPerson[questionId] || {};
  }
  return answer;
};

export const getAnswerValueToQuestion = (questionId, personId, allAnswersCache) => {
  const answer = getAnswerToQuestion(personId, questionId, allAnswersCache) || {};
  if (!answer || !answer.answerType) {
    // console.log(`No answer found for questionId: ${questionId}`);
    return undefined;
  }
  let answerValue;
  switch (answer.answerType) {
    case 'BOOLEAN':
      answerValue = answer.answerBoolean || '';
      break;
    case 'DATE':
      answerValue = answer.answerDateTime || '';
      break;
    case 'INTEGER':
      answerValue = answer.answerInteger || '';
      break;
    case 'STRING':
    default:
      answerValue = answer.answerString || '';
      break;
  }
  // console.log('getValueFromAnswerDictByQuestionId answerValue:', answerValue);
  return answerValue;
};

export const getQuestionById = (questionId, allQuestionsCache) => {
  let question = {};
  // console.log('getQuestionById questionId:', questionId, ', allQuestionsCache:', allQuestionsCache, ', AllQuestionsCache[questionId]:', allQuestionsCache[questionId]);
  if (allQuestionsCache) {
    question = allQuestionsCache[questionId] || {};
  }
  return question;
};

export const getQuestionsForQuestionnaire = (incomingQuestionnaireId, allQuestionsCache) => {
  if (allQuestionsCache) {
    return Object.values(allQuestionsCache).filter((question) => question.questionnaireId === incomingQuestionnaireId);
  }
  return [];
};
