// import AppObservableStore from '../../stores/AppObservableStore';
//
// export default function prepareDataPackageFromAppObservableStore (acceptedVariables) {
//   // Extract data from AppObservableStore and put into data object, with Changed variable, to be sent to server
//   const data = {};
//   for (let i = 0; i < acceptedVariables.length; i++) {
//     // Ex/ emailPersonalToBeSaved and emailPersonalChanged
//     // console.log(`prepareData: ${acceptedVariables[i]}ToBeSaved:`, AppObservableStore.getGlobalVariableState(`${acceptedVariables[i]}ToBeSaved`));
//     if (AppObservableStore.getGlobalVariableState(`${acceptedVariables[i]}Changed`)) {
//       // If the value has changed, add it to the data dictionary
//       if (AppObservableStore.getGlobalVariableState(`${acceptedVariables[i]}Changed`) === true) {
//         data[`${acceptedVariables[i]}Changed`] = true;
//         data[`${acceptedVariables[i]}ToBeSaved`] = AppObservableStore.getGlobalVariableState(`${acceptedVariables[i]}ToBeSaved`);
//       }
//     }
//   }
//   return data;
// }
