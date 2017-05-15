/**
 * Removes the given length of a string. If len is negative, will remove from the end.
 *
 * @param {string} str The string to slice
 * @param {number} len The length to remove.
 * @returns {string}
 */
function remove(str: string, len: number) {
  return len > 0 ? str.substring(len) : str.substring(0, str.length + len);
}

/**
 * Returns the length of matching characters in the given string, up to the length provided.
 *
 * @param {number} len The max length to count to. Should be the smallest length of all strings.
 * @param {Array<string>} strings The strings to check.
 * @returns {number}
 */
function fromStartLen(len: number, ...strings: Array<string>) {
  for(let i = 0; i < len; i++) {
    let last = null;
    for(let s = 0; s < strings.length; s++) {
      let c = strings[s][i];
      if(last !== null && c != last) {
        return i;
      }
      last = c;
    }
  }
  return 0;
}

/**
 * Returns the length of matching characters in the given string, counting from the end.
 *
 * @param {number} len The max length to count to. Should be the smallest length of all strings.
 * @param {Array<string>} strings The strings to check.
 * @returns {number}
 */
function fromEndLen(len: number, ...strings: Array<string>) {
  for(let i = 0; i < len; i++) {
    let last = null;
    for(let s = 0; s < strings.length; s++) {
      let si = strings[s].length - i - 1;
      let c = strings[s][si];
      if(last !== null && c != last) {
        return i;
      }
      last = c;
    }
  }
}

/**
 * Returns the longest non-matching sequence of characters in the string.
 *
 * @param {Array<string>} strings The list of strings to diff.
 * @returns {Array<string>}
 */
export function diff(...strings: Array<string>) {
  let len = Math.min.apply(null, strings.map(s => s.length));
  let fromStart = 0;
  let fromEnd = 0;

  fromStart = fromStartLen(len, ...strings);

  if(fromStart >= len / 2) {
    return strings.map(s => remove(s, fromStart));
  }

  fromEnd = fromEndLen(len, ...strings);

  if(fromStart >= fromEnd) {
    return strings.map(s => remove(s, fromStart));
  } else {
    return strings.map(s => remove(s, -fromEnd));
  }
}

/**
 * Returns the longest matching sequence of characters in the string.
 *
 * @param {Array<string>} strings The list of strings to match.
 * @returns {string}
 */
export function shared(...strings: Array<string>) {
  strings = strings.filter(s => s != null);
  let len = Math.min.apply(null, strings.map(s => s.length));
  let fromStart = 0;
  let fromEnd = 0;

  if(strings.length == 0) {
    return '';
  }
  if(strings.length == 1) {
    return strings[0];
  }

  fromStart = fromStartLen(len, ...strings);

  if(fromStart >= len / 2) {
    return strings[0].substring(0, fromStart);
  }

  fromEnd = fromEndLen(len, ...strings);

  if(fromStart >= fromEnd) {
    return strings[0].substring(0, fromStart);
  } else {
    let s = strings[0];
    return s.substring(s.length - fromEnd);
  }
}