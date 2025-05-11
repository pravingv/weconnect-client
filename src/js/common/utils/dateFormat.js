// dateFormat.js
import { DateTime } from 'luxon';
import convertToInteger from './convertToInteger';

/**
 * Convert a SQL 'timestamp without time zone' .e.g. '2025-04-20 20:21:21.915' to 'Apr 20'
 * In moment format that was 'MMM Do', in Luxon format that would be 'LLL d'
 * @returns string like 'Apr 20'
 * @param dateString
 */
export function formatDateToMonthDay (dateString) {
  return DateTime.fromISO(dateString).toLocaleString({ month: 'short', day: 'numeric' }); // => 'Apr 20'
}

/**
 * Convert a SQL 'timestamp without time zone' .e.g. '2025-04-20 20:21:21.915' to 'Apr 20, 2025'
 * In moment's format that was 'MMM Do, YYYY', in Luxon format that would be 'LLL d, yyyy'
 * @returns string like 'Apr 20, 2025'
 * @param dateString
 */
export function formatDateToMonthDayYear (dateString) {
  return  DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_MED);
}

/**
 * Convert a SQL 'timestamp without time zone' .e.g. '2025-04-20 20:21:21.915' to '2025/04/20'
 * In moment format that was 'YYYY/M/D'
 * @returns string like 'Apr 20, 2025'
 * @param dateString
 */
export function formatDateToYearMonthDay (dateString) {
  const dt = DateTime.fromISO(dateString).toISODate();      // => '2017-04-20'
  return dt.replace('-', '/');                              // => '2017/04/20'
}

/**
 * Create a relative string, relative to now
 * @param dateString
 * @param removeAgo  make this a relative string, like '1 month, 5 days'
 * @returns {string}
 */
export function timeFromDate (dateString, removeAgo = false) {
  if (removeAgo) {
    // luxStr = DateTime.fromISO(dateString).toRelative();   // Not fancy enough, output is just like moment.fromNow
    // We would like to have this level of detail (fromNow just offers “4 years” instead of “4 years, 3 months, 2 weeks”
    const pastDT = DateTime.fromISO(dateString);
    const nowDt = DateTime.now();
    const diff = nowDt.diff(pastDT, ['years', 'months', 'days', 'hours', 'minutes']);
    console.log(diff);
    const { years, months, days } = diff.values;
    let fancy = '';
    if (years) fancy += `${years} year${years > 1 ? 's' : ''}, `;
    if ((months || years) && months > 0) fancy += `${months} month${months > 1 ? 's' : ''}, `;
    if (months || years || days) fancy += `${days} day${days > 1 ? 's' : ''}`;
    return fancy;
  } else {
    return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_MED);
  }
}

export function getTodayAsInteger (daysInPast = 0) {
  const today = new Date();
  const thisYearInteger = today.getFullYear();
  let month = today.getMonth() + 1; // getMonth comes back starting with 0
  let monthDay = today.getDate();
  // console.log('thisYearInteger:', thisYearInteger, ', month: ', month, ', monthDay:', monthDay);
  // We want to adjust date returned by adjustDayByThisInteger so for thinks like seeing endorsements for an election 5 days past election date
  if (daysInPast > 0) {
    if (monthDay < (daysInPast + 1)) {
      monthDay = 30 - daysInPast;
      if (month > 1) {
        month -= 1;
      }
    } else {
      monthDay -= daysInPast;
    }
  }
  const monthAsString = month < 10 ? `0${month}` : `${month}`; // `${month}` for string result
  const monthDayAsString = monthDay < 10 ? `0${monthDay}` : `${monthDay}`; // `${monthDay}` for string result
  const dateAsString = `${thisYearInteger}${monthAsString}${monthDayAsString}`;
  return convertToInteger(dateAsString);
}

export function isThisYearInOfficeSetTrue (year, representative) {
  const yearInOfficeKey = `year_in_office_${year}`;
  // console.log('yearInOfficeKey: ', yearInOfficeKey);
  return ((yearInOfficeKey in representative) && representative[yearInOfficeKey]);
}

export function isAnyYearInOfficeSetTrue (yearList, representative) {
  for (let i = 0; i < yearList.length; i += 1) {
    if (isThisYearInOfficeSetTrue(yearList[i], representative)) {
      return true;
    }
  }
  return false;
}

export function getYearFromUltimateElectionDate (ultimateElectionDate) {
  if (ultimateElectionDate) {
    const tempYear = String(ultimateElectionDate).slice(0, 4);
    return Number(tempYear);
  } else {
    return 0;
  }
}

/**
 * Add a day to the ultimateElectionDate, and return in ISODate
 * @param ultimateElectionDate in the integer format of 20241105
 * @returns {*|void}
 */
export function getDateFromUltimateElectionDate (ultimateElectionDate) {
  const ultimateElectionDateAsString = String(ultimateElectionDate);  // => '20241105'
  return DateTime.fromISO(ultimateElectionDateAsString).plus({ days: 1 }).toISODate();
}

/**
 * Add a day to the dayText, and return in ISODate
 * @param dayText in the integer format of 20241105
 * @returns {*|void}
 */export function electionDateTomorrowFormatted (dayText) {   // '2026/11/03'
  // Luxon should parse '2026/11/03' as a valid ISO format https://moment.github.io/luxon/#/parsing?id=iso-8601
  return getDateFromUltimateElectionDate(dayText);
}

function addNumberSuffix (dateStr) {
  const th = 'th';
  const rd = 'rd';
  const nd = 'nd';
  const st = 'st';

  const last2Digits = dateStr.slice(-2);
  if (last2Digits === '11' || last2Digits === '12' || last2Digits === '13') return dateStr + th;

  const lastDigit = dateStr.slice(-1);
  switch (lastDigit) {
    case '1': return dateStr + st;
    case '2': return dateStr + nd;
    case '3': return dateStr + rd;
    default:  return dateStr + th;
  }
}

/**
 * Format a js date object, to the equivalent to moment 'MMM Do'
 * @returns {string}
 * @param date as "2024-09-23T07:00:00.000Z"
 */
export function formatDateMMMDo (date) {
  const dt = DateTime.fromISO(date);
  return addNumberSuffix(dt.toFormat('LLL d'));
}

/**
 * Format a js date object, to the equivalent to moment 'MMMDoYYYY'
 * @param date
 * @returns {string}
 */
export function formatDateMMMDoYYYY (date) {
  return date.toLocaleString(DateTime.DATE_MED);
}

// ------------- Comparison versions for if we run into a difference, Feel free to delete in 2026 ------------------

// export function formatDateToMonthDay (dateString) {
//   const lux = DateTime.fromSQL(dateString);
//   const luxStr = lux.toLocaleString({ month: 'short', day: 'numeric' }); // => 'Apr 20'
//
//   let momentStr = '';
//   if (typeof window.moment === 'undefined') {
//     initializeMoment(() => {
//       const momentDate = window.moment(dateString, 'YYYY-MM-DD');
//       momentStr = momentDate.format('MMM Do');
//     });
//   } else {
//     const momentDate = window.moment(dateString, 'YYYY-MM-DD');
//     momentStr =  momentDate.format('MMM Do');
//   }
//   if (momentStr !== luxStr) {
//     console.error(`formatDateToMonthDay moment: '${momentStr}' does not match '${luxStr}'`);
//   }
//
//   return luxStr;
// }
//
// export function formatDateToMonthDayYear (dateString) {
//   const luxStr =  DateTime.fromSQL(dateString).toLocaleString(DateTime.DATE_MED);
//
//   let momentStr = '';
//   if (typeof window.moment === 'undefined') {
//     initializeMoment(() => {
//       const momentDate = window.moment(dateString, 'YYYY-MM-DD');
//       momentStr = momentDate.format('MMM Do, YYYY');
//     });
//   } else {
//     const momentDate = window.moment(dateString, 'YYYY-MM-DD');
//     momentStr = momentDate.format('MMM Do, YYYY');
//   }
//   if (momentStr !== luxStr) {
//     console.error(`formatDateToMonthDayYear moment: '${momentStr}' does not match '${luxStr}'`);
//   }
//   return luxStr;
// }
//
// export function formatDateToYearMonthDay (dateString) {
//   const dt = DateTime.fromSQL(dateString).toISODate();      // => '2017-04-20'
//   const luxStr = dt.replace('-', '/');                   // => '2017/04/20'
//
//   let momentStr = '';
//   initializeMoment(() => {
//     const momentDate = window.moment(dateString, 'YYYY-MM-DD');
//     momentStr = momentDate.format('YYYY/M/D');
//   });
//   if (momentStr !== luxStr) {
//     console.error(`formatDateToYearMonthDay moment: '${momentStr}' does not match '${luxStr}'`);
//   }
//   return luxStr;
// }
//
// export function timeFromDate (dateString, removeAgo = false) {
//   let luxStr = '';
//   if (removeAgo) {
//     luxStr = DateTime.fromISO(dateString).toRelative();
//     console.log('toRelative luxon: ', luxStr);
//   } else {
//     luxStr = DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_MED);
//   }
//
//   let momentStr = '';
//   if (window.moment === undefined) {
//     initializeMoment(() => {
//       if (!dateString || dateString === '') {
//         momentStr = '';
//       } else {
//         momentStr = window.moment.utc(dateString).fromNow(removeAgo);
//       }
//     });
//   }
//   if (!dateString || dateString === '' || window.moment === undefined) {
//     momentStr = '';
//   }
//   momentStr = window.moment.utc(dateString).fromNow(removeAgo);
//   if (momentStr !== luxStr) {
//     console.log(`timeFromDate moment: '${momentStr}' does not match '${luxStr}'`);  // These are not going to match exactly
//   }
//   return luxStr;
// }
//
// export function getDateFromUltimateElectionDate (ultimateElectionDate) {
//   const ultimateElectionDateAsString = String(ultimateElectionDate);  // => '20241105'
//   const luxStr = DateTime.fromISO(ultimateElectionDateAsString).plus({ days: 1 }).toISODate();
//
//   let momentStr = '';
//   if (typeof window.moment === 'undefined') {
//     momentStr = initializeMoment(() => window.moment(ultimateElectionDateAsString, 'YYYYMMDD').add(1, 'days').format('YYYY-MM-DD'));
//   } else {
//     momentStr = window.moment(ultimateElectionDateAsString, 'YYYYMMDD').add(1, 'days').format('YYYY-MM-DD');
//   }
//   if (momentStr !== luxStr) {
//     console.error(`getDateFromUltimateElectionDate moment: '${momentStr}' does not match '${luxStr}'`);
//   }
//   return luxStr;
// }
//
// export function electionDateTomorrowFormatted (dayText) {   // '2026/11/03'
//   // Luxon should parse '2026/11/03' as a valid ISO format https://moment.github.io/luxon/#/parsing?id=iso-8601
//   const luxStr = getDateFromUltimateElectionDate(dayText);
//
//   let momentStr = '';
//   if (typeof window.moment === 'undefined') {
//     momentStr = initializeMoment(() => window.moment(dayText, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD'));
//   } else {
//     momentStr = window.moment(dayText, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
//   }
//   if (momentStr !== luxStr) {
//     console.error(`electionDateTomorrowFormatted moment: '${momentStr}' does not match '${luxStr}'`);
//   }
//   return luxStr;
// }
//
// export function formatDateMMMDo (date) {
//   const dt = DateTime.fromISO(date);
//   const luxStr =  addNumberSuffix(dt.toFormat('LLL d'));
//
//   let momentStr = '';
//   if (typeof window.moment === 'undefined') {
//     momentStr = initializeMoment(() => window.moment(date).format('MMM Do'));
//   } else {
//     momentStr = window.moment(date).format('MMM Do');
//   }
//   if (momentStr !== luxStr) {
//     console.error(`formatDateMMMDo moment: '${momentStr}' does not match '${luxStr}'`);
//   }
//   return luxStr;
// }
//
// export function formatDateMMMDoYYYY (date) {
//   const luxStr = date.toLocaleString(DateTime.DATE_MED);
//
//   let momentStr = '';
//   if (typeof window.moment === 'undefined') {
//     momentStr = initializeMoment(() => window.moment(date).format('MMM Do, YYYY'));
//   } else {
//     momentStr = window.moment(date).format('MMM Do, YYYY');
//   }
//   if (momentStr !== luxStr) {
//     console.error(`formatDateMMMDoYYYY moment: '${momentStr}' does not match '${luxStr}'`);
//   }
//   return luxStr;
// }
