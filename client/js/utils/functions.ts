/**
 * Wraps a function so that it is only executed after a specified delay.
 *
 * @param {Function} fn The function to execute.
 * @param {number} delay The delay before teh function is executed.
 * @returns {Function} wrapper function
 */
export function debounce(fn, delay) {
  let timeoutId = null;
  return function() {
    let args = arguments;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(null, args), delay);
  }
}

/**
 * Wraps a function so that it's throttled to not executed more than once every
 * so often.
 *
 * @param {Function} fn The function to execute.
 * @param {number} threshold The delay before the function is executed.
 * @returns {Function} wrapper function
 */
export function throttle(fn, threshold) {
  let last = null;
  let deferTimer = null;

  return function() {
    let args = arguments;
    let now = +new Date;

    if(last && now < last + threshold) {
      clearTimeout(deferTimer);

      deferTimer = setTimeout(() => {
        last = now;
        fn.apply(null, args);
      }, threshold);
    } else {
      last = now;
      fn.apply(null, args);
    }
  }
}