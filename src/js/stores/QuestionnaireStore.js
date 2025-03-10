// import { ReduceStore } from 'flux/utils';
// import Dispatcher from '../common/dispatcher/Dispatcher';
// import arrayContains from '../common/utils/arrayContains';
//
// class QuestionnaireStore extends ReduceStore {
//   getInitialState () {
//     return {
//       allQuestionnairesCache: {}, // This is a dictionary key: questionnaireId, value: questionnaire dict
//       allQuestionsCache: {}, // This is a dictionary key: questionId, value: question dict
//       allAnswersCache: {}, // This is a dictionary key: personId, value: another dictionary key: questionId, value: answer dict
//       dateQuestionnaireCompletedDict: {}, // This is a dictionary key: personId, value: another dictionary key: questionnaireId, value: dateQuestionnaireCompleted
//       mostRecentQuestionIdSaved: -1,
//       mostRecentQuestionSaved: {
//         questionnaireId: -1,
//       },
//       mostRecentQuestionnaireIdSaved: -1,
//       mostRecentQuestionnaireSaved: {
//         firstName: '',
//         lastName: '',
//         questionnaireId: -1,
//       },
//       questionsAnsweredPersonIdList: {}, // This is a dictionary key: questionId, value: list of personIds who have answered the question
//       questionnairesAnsweredByPersonList: {}, // This is a dictionary key: questionnaireId, value: list of personIds who have answered the questionnaire
//       questionnairesAnsweredListByPersonId: {}, // This is a dictionary key: personId, value: list of questionnaireIds the person has answered
//       searchResults: [],
//     };
//   }
//
//   getAllCachedAnswersDictByPersonId (personId) {
//     // This lets us know when the person answered the questionnaire
//     const { allAnswersCache } = this.getState();
//     if (allAnswersCache[personId]) {
//       return allAnswersCache[personId];
//     }
//     return {};
//   }
//
//   getAllCachedQuestionnairesList () {
//     const { allQuestionnairesCache } = this.getState();
//     const questionnaireListRaw = Object.values(allQuestionnairesCache);
//
//     const questionnaireList = [];
//     let questionnaireFiltered;
//     let questionnaireRaw;
//     for (let i = 0; i < questionnaireListRaw.length; i++) {
//       questionnaireRaw = questionnaireListRaw[i];
//       // console.log('QuestionnaireStore getAllCachedQuestionnairesList questionnaire:', questionnaire);
//       questionnaireFiltered = questionnaireRaw;
//       questionnaireList.push(questionnaireFiltered);
//     }
//     return questionnaireList;
//   }
//
//   getDateQuestionnairesCompletedDictByPersonId (personId) {
//     // This lets us know when the person answered the questionnaire
//     const { dateQuestionnaireCompletedDict } = this.getState();
//     if (dateQuestionnaireCompletedDict[personId]) {
//       return dateQuestionnaireCompletedDict[personId];
//     }
//     return {};
//   }
//
//   getFirstName (questionnaireId) {
//     const questionnaire = this.getQuestionnaireById(questionnaireId);
//     return questionnaire.firstName || '';
//   }
//
//   getLastName (questionnaireId) {
//     const questionnaire = this.getQuestionnaireById(questionnaireId);
//     return questionnaire.lastName || '';
//   }
//
//   getMostRecentQuestionnaireChanged () {
//     // console.log('QuestionnaireStore getMostRecentQuestionnaireChanged Id:', this.getState().mostRecentQuestionnaireIdSaved);
//     if (this.getState().mostRecentQuestionnaireIdSaved !== -1) {
//       return this.getQuestionnaireById(this.getState().mostRecentQuestionnaireIdSaved);
//     }
//     return {};
//   }
//
//   getMostRecentQuestionnaireIdChanged () {
//     // console.log('QuestionnaireStore getMostRecentQuestionnaireChanged Id:', this.getState().mostRecentQuestionnaireIdSaved);
//     return this.getState().mostRecentQuestionnaireIdSaved;
//   }
//
//   getQuestionListByQuestionnaireId (questionnaireId) {
//     const { allQuestionsCache } = this.getState();
//     const questionListRaw = Object.values(allQuestionsCache);
//     const questionListForQuestionnaire = [];
//     for (let i = 0; i < questionListRaw.length; i++) {
//       if (questionListRaw[i].questionnaireId === questionnaireId) {
//         questionListForQuestionnaire.push(questionListRaw[i]);
//       }
//     }
//     // console.log('QuestionnaireStore getQuestionnaireById:', questionnaireId, ', questionListForQuestionnaire:', questionListForQuestionnaire);
//     return questionListForQuestionnaire;
//   }
//
//   getQuestionById (questionId) {
//     const { allQuestionsCache } = this.getState();
//     // console.log('QuestionnaireStore getQuestionById:', questionId, ', allQuestionsCache:', allQuestionsCache);
//     return allQuestionsCache[questionId] || {};
//   }
//
//   getQuestionnaireById (questionnaireId) {
//     const { allQuestionnairesCache } = this.getState();
//     // console.log('QuestionnaireStore getQuestionnaireById:', questionnaireId, ', allQuestionnairesCache:', allQuestionnairesCache);
//     return allQuestionnairesCache[questionnaireId] || {};
//   }
//
//   getQuestionnaireListByPersonId (personId) {
//     const { questionnairesAnsweredListByPersonId } = this.getState();
//     // console.log('QuestionnaireStore getQuestionnaireById:', questionnaireId, ', allQuestionnairesCache:', allQuestionnairesCache);
//     const questionnairesAnsweredIdList =  questionnairesAnsweredListByPersonId[personId] || [];
//     const questionnairesAnsweredListForPerson = [];
//     for (let i = 0; i < questionnairesAnsweredIdList.length; i++) {
//       questionnairesAnsweredListForPerson.push(this.getQuestionnaireById(questionnairesAnsweredIdList[i]));
//     }
//     return questionnairesAnsweredListForPerson;
//   }
//
//   getSearchResults () {
//     // console.log('QuestionnaireStore getSearchResults:', this.getState().searchResults);
//     return this.getState().searchResults || [];
//   }
//
//   reduce (state, action) {
//     const {
//       allAnswersCache, allQuestionsCache, allQuestionnairesCache,
//       dateQuestionnaireCompletedDict,
//       questionnairesAnsweredByPersonList, questionnairesAnsweredListByPersonId, questionsAnsweredPersonIdList,
//     } = state;
//     // let questionnaireTemp = {};
//     let questionId = -1;
//     let questionnaireId = -1;
//     let revisedState = state;
//     let searchResults = [];
//
//     switch (action.type) {
//       case 'question-list-retrieve':
//         if (!action.res.success) {
//           console.log('QuestionnaireStore ', action.type, ' FAILED action.res:', action.res);
//           return state;
//         }
//         revisedState = state;
//         // console.log('QuestionnaireStore question-list-retrieve questionList:', action.res.questionList);
//         if (action.res.isSearching && action.res.isSearching === true) {
//           // console.log('QuestionnaireStore isSearching:', action.res.isSearching);
//           searchResults = action.res.questionList;
//           // console.log('QuestionnaireStore searchResults:', searchResults);
//           revisedState = {
//             ...revisedState,
//             searchResults,
//           };
//         }
//         if (action.res.questionList) {
//           action.res.questionList.forEach((question) => {
//             // console.log('QuestionnaireStore question-list-retrieve adding question:', question);
//             if (question && (question.id >= 0)) {
//               allQuestionsCache[question.id] = question;
//             }
//           });
//           // console.log('allQuestionsCache:', allQuestionsCache);
//           revisedState = {
//             ...revisedState,
//             allQuestionsCache,
//           };
//         }
//         // console.log('QuestionnaireStore revisedState:', revisedState);
//         return revisedState;
//
//       case 'question-save':
//         if (!action.res.success) {
//           console.log('QuestionnaireStore ', action.type, ' FAILED action.res:', action.res);
//           return state;
//         }
//         revisedState = state;
//         if (action.res.questionId >= 0) {
//           questionId = action.res.questionId;
//         } else {
//           questionId = -1;
//         }
//
//         if (questionId >= 0) {
//           if (action.res.questionCreated || action.res.questionUpdated) {
//             // console.log('QuestionnaireStore question-save questionId:', questionId);
//             allQuestionsCache[questionId] = action.res;
//             revisedState = {
//               ...revisedState,
//               allQuestionsCache,
//               mostRecentQuestionIdSaved: questionId,
//             };
//           } else {
//             console.log('QuestionnaireStore question-save NOT updated or saved.');
//           }
//         } else {
//           console.log('QuestionnaireStore question-save MISSING questionId:', questionId);
//         }
//         return revisedState;
//
//       case 'questionnaire-responses-list-retrieve':
//         if (!action.res.success) {
//           console.log('QuestionnaireStore ', action.type, ' FAILED action.res:', action.res);
//           return state;
//         }
//         revisedState = state;
//         // questionnairesAnsweredByPersonList: {}, // This is a dictionary key: questionnaireId, value: list of personIds who have answered the questionnaire
//         // questionnairesAnsweredListByPersonId: {}, // This is a dictionary key: personId, value: list of questionnaireIds answered
//         // questionsAnsweredPersonIdList: {}, // This is a dictionary key: questionId, value: list of personIds who have answered the question
//         if (action.res.questionAnswerList) {
//           action.res.questionAnswerList.forEach((answer) => {
//             // console.log('QuestionnaireStore questionnaire-responses-list-retrieve adding answer:', answer);
//             if (answer && (answer.personId >= 0)) {
//               if (answer.questionId >= 0) {
//                 if (!allAnswersCache[answer.personId]) {
//                   allAnswersCache[answer.personId] = {};
//                 }
//                 allAnswersCache[answer.personId][answer.questionId] = answer;
//                 //
//                 // Add personId to questionnairesAnsweredByPersonList
//                 if (!Array.isArray(questionnairesAnsweredByPersonList[answer.questionnaireId])) {
//                   // Create if needed
//                   questionnairesAnsweredByPersonList[answer.questionnaireId] = [];
//                 }
//                 if (!arrayContains(answer.personId, questionnairesAnsweredByPersonList[answer.questionnaireId])) {
//                   // Add
//                   questionnairesAnsweredByPersonList[answer.questionnaireId].push(answer.personId);
//                 }
//                 //
//                 // This lets us know when the person answered the questionnaire
//                 if (!dateQuestionnaireCompletedDict[answer.personId]) {
//                   // Create if needed
//                   dateQuestionnaireCompletedDict[answer.personId] = {};
//                 }
//                 if (!dateQuestionnaireCompletedDict[answer.personId][answer.questionnaireId] && answer.dateCreated) {
//                   // Just use any of the answers to set the dateQuestionnaireCompletedDict
//                   dateQuestionnaireCompletedDict[answer.personId][answer.questionnaireId] = answer.dateCreated;
//                 }
//                 //
//                 // Add personId to questionnairesAnsweredByPersonList
//                 if (!Array.isArray(questionnairesAnsweredListByPersonId[answer.personId])) {
//                   // Create if needed
//                   questionnairesAnsweredListByPersonId[answer.personId] = [];
//                 }
//                 if (!arrayContains(answer.questionnaireId, questionnairesAnsweredListByPersonId[answer.personId])) {
//                   // Add
//                   questionnairesAnsweredListByPersonId[answer.personId].push(answer.questionnaireId);
//                 }
//                 //
//                 // Add personId to questionsAnsweredPersonIdList
//                 if (!Array.isArray(questionsAnsweredPersonIdList[answer.questionId])) {
//                   // Create if needed
//                   questionsAnsweredPersonIdList[answer.questionId] = [];
//                 }
//                 if (!arrayContains(answer.personId, questionsAnsweredPersonIdList[answer.questionId])) {
//                   // Add
//                   questionsAnsweredPersonIdList[answer.questionId].push(answer.personId);
//                 }
//               }
//             }
//           });
//           // console.log('allAnswersCache:', allAnswersCache);
//           revisedState = {
//             ...revisedState,
//             allAnswersCache,
//             questionnairesAnsweredByPersonList,
//             questionnairesAnsweredListByPersonId,
//             questionsAnsweredPersonIdList,
//           };
//         }
//         if (action.res.questionList) {
//           action.res.questionList.forEach((question) => {
//             // console.log('QuestionnaireStore questionnaire-responses-list-retrieve adding question:', question);
//             if (question && (question.id >= 0)) {
//               allQuestionsCache[question.id] = question;
//             }
//           });
//           // console.log('allQuestionsCache:', allQuestionsCache);
//           revisedState = {
//             ...revisedState,
//             allQuestionsCache,
//           };
//         }
//         // console.log('QuestionnaireStore questionnaire-responses-list-retrieve questionnaireList:', action.res.questionnaireList);
//         if (action.res.questionnaireList) {
//           action.res.questionnaireList.forEach((questionnaire) => {
//             // console.log('QuestionnaireStore questionnaire-responses-list-retrieve adding questionnaire:', questionnaire);
//             if (questionnaire && (questionnaire.id >= 0)) {
//               allQuestionnairesCache[questionnaire.id] = questionnaire;
//             }
//           });
//           // console.log('allQuestionnairesCache:', allQuestionnairesCache);
//           revisedState = {
//             ...revisedState,
//             allQuestionnairesCache,
//           };
//         }
//         // console.log('QuestionnaireStore revisedState:', revisedState);
//         return revisedState;
//
//       case 'questionnaire-list-retrieve':
//         if (!action.res.success) {
//           console.log('QuestionnaireStore ', action.type, ' FAILED action.res:', action.res);
//           return state;
//         }
//         revisedState = state;
//         // console.log('QuestionnaireStore questionnaire-list-retrieve questionnaireList:', action.res.questionnaireList);
//         if (action.res.isSearching && action.res.isSearching === true) {
//           // console.log('QuestionnaireStore isSearching:', action.res.isSearching);
//           searchResults = action.res.questionnaireList;
//           // console.log('QuestionnaireStore searchResults:', searchResults);
//           revisedState = {
//             ...revisedState,
//             searchResults,
//           };
//         }
//         if (action.res.questionnaireList) {
//           action.res.questionnaireList.forEach((questionnaire) => {
//             // console.log('QuestionnaireStore questionnaire-list-retrieve adding questionnaire:', questionnaire);
//             if (questionnaire && (questionnaire.id >= 0)) {
//               allQuestionnairesCache[questionnaire.id] = questionnaire;
//             }
//           });
//           // console.log('allQuestionnairesCache:', allQuestionnairesCache);
//           revisedState = {
//             ...revisedState,
//             allQuestionnairesCache,
//           };
//         }
//         // console.log('QuestionnaireStore revisedState:', revisedState);
//         return revisedState;
//
//       case 'questionnaire-save':
//         if (!action.res.success) {
//           console.log('QuestionnaireStore ', action.type, ' FAILED action.res:', action.res);
//           return state;
//         }
//         revisedState = state;
//         if (action.res.questionnaireId >= 0) {
//           questionnaireId = action.res.questionnaireId;
//         } else {
//           questionnaireId = -1;
//         }
//
//         if (questionnaireId >= 0) {
//           // console.log('QuestionnaireStore questionnaire-save questionnaireId:', questionnaireId);
//           allQuestionnairesCache[questionnaireId] = action.res;
//           revisedState = {
//             ...revisedState,
//             allQuestionnairesCache,
//             mostRecentQuestionnaireIdSaved: questionnaireId,
//           };
//         } else {
//           console.log('QuestionnaireStore questionnaire-save MISSING questionnaireId:', questionnaireId);
//         }
//         return revisedState;
//
//       default:
//         return state;
//     }
//   }
// }
//
// export default new QuestionnaireStore(Dispatcher);
