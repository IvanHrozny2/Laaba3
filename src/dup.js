// removeConsecutiveDuplicates.js
export function removeConsecutiveDuplicates(arr) {
  return arr.map(str => {
    return str.split('').filter((char, index, self) => {
      return index === 0 || char !== self[index - 1];
    }).join('');
  });
}