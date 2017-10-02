/**
 * Helper to shuffle an array and return it
 */
function Shuffler() {

  /**
   * Shuffles an array - using Fisher-Yates shuffle
   * @param {array} arr - array of something to shuffle
   * @return {array} arr - shuffled array
   */
  this.shuffle = function (arr) {
    var index = arr.length;
    var temp;
    var randIndex;

    while (0 !== index) {
      randIndex = Math.floor(Math.random() * index);
      index--;

      temp = arr[index];
      arr[index] = arr[randIndex];
      arr[randIndex] = temp;
    }

    return arr;
  };

}

module.exports = Shuffler;
