// import Dispatcher from '../common/dispatcher/Dispatcher';
//
// export default {
//   questionListRetrieve (questionnaireId, searchText = '') {
//     // console.log('QuestionnaireActions, questionListRetrieve searchText:', searchText);
//     if (searchText) {
//       Dispatcher.loadEndpoint('question-list-retrieve', {
//         questionnaireId,
//         searchText,
//       });
//     } else {
//       Dispatcher.loadEndpoint('question-list-retrieve', {
//         questionnaireId,
//       });
//     }
//   },
//
//   questionnaireListRetrieve (searchText = '') {
//     // console.log('QuestionnaireActions, questionnaireListRetrieve searchText:', searchText);
//     if (searchText) {
//       Dispatcher.loadEndpoint('questionnaire-list-retrieve', {
//         searchText,
//       });
//     } else {
//       Dispatcher.loadEndpoint('questionnaire-list-retrieve');
//     }
//   },
//
//   questionnaireResponsesListRetrieve (personIdList = []) {
//     // console.log('QuestionnaireActions, questionnaireRetrieve personIdList:', personIdList);
//     if (personIdList) {
//       Dispatcher.loadEndpoint('questionnaire-responses-list-retrieve', {
//         personIdList,
//       });
//     } else {
//       Dispatcher.loadEndpoint('questionnaire-responses-list-retrieve');
//     }
//   },
//
//   questionnaireRetrieve (questionnaireId = '') {
//     // console.log('QuestionnaireActions, questionnaireRetrieve questionnaireId:', questionnaireId);
//     if (questionnaireId) {
//       Dispatcher.loadEndpoint('questionnaire-retrieve', {
//         questionnaireId,
//       });
//     } else {
//       Dispatcher.loadEndpoint('questionnaire-retrieve');
//     }
//   },
//
//   questionnaireAnswerListSave (questionnaireId = -1, personId = -1, incomingData = {}) {
//     const data = {
//       questionnaireId,
//       personId,
//       ...incomingData,
//     };
//     Dispatcher.loadEndpoint('answer-list-save', data);
//   },
//
//   questionnaireSave (questionnaireId = -1, incomingData = {}) {
//     // console.log('QuestionnaireActions, questionnaireSave questionnaireId:', questionnaireId, ', incomingData:', incomingData);
//     const data = {
//       questionnaireId,
//       ...incomingData,
//     };
//     Dispatcher.loadEndpoint('questionnaire-save', data);
//   },
//
//   questionSave (questionnaireId = -1, questionId = -1, incomingData = {}) {
//     // console.log('QuestionnaireActions, questionSave questionId:', questionId, ', incomingData:', incomingData);
//     const data = {
//       questionId,
//       questionnaireId,
//       ...incomingData,
//     };
//     Dispatcher.loadEndpoint('question-save', data);
//   },
// };
