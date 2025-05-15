export function generateActivatedByDescription (taskGroup) {
  if (!taskGroup) {
    return '';
  }
  const activatedByParts = [];
  if (taskGroup.assignIfOfferDecisionNeeded) {
    activatedByParts.push('Hiring decision needed');
  }
  if (taskGroup.assignIfOfferApproved) {
    activatedByParts.push('Hiring manager wants to hire');
  }
  if (taskGroup.assignIfOfferWillNotBeMade) {
    activatedByParts.push('Offer will not be made');
  }
  if (taskGroup.assignIfOfferQuestionnaireAnswered) {
    activatedByParts.push('Offer questionnaire has been answered');
  }
  if (taskGroup.assignIfOfferQuestionnaireSent) {
    activatedByParts.push('Offer questionnaire has been sent');
  }
  if (taskGroup.assignIfQuestionnaireAnswered) {
    activatedByParts.push('Questionnaire has been answered');
  }
  if (taskGroup.assignIfEmailCreated) {
    activatedByParts.push('Email has been created');
  }
  if (taskGroup.assignIfOfferLetterCreated) {
    activatedByParts.push('Offer letter has been created');
  }
  if (taskGroup.assignIfOfferLetterSigned) {
    activatedByParts.push('Offer letter has been signed');
  }
  if (taskGroup.taskGroupIsForTeam) {
    activatedByParts.push('Tasks related to a team');
  }

  return activatedByParts.join(', ');
}

export function generateTaskDefinitionListString (taskGroupId, taskDefinitionList) {
  if (!taskDefinitionList) {
    return '';
  }
  const taskDefinitionListParts = [];
  const taskDefinitionListForThisTaskGroup = taskDefinitionList ? taskDefinitionList.filter((taskDefinition) => taskDefinition.taskGroupId === taskGroupId) : [];
  taskDefinitionListForThisTaskGroup.forEach((taskDefinition) => {
    if (taskDefinition && taskDefinition.taskName) {
      taskDefinitionListParts.push(taskDefinition.taskName);
    }
  });
  return taskDefinitionListParts.join(', ');
}
