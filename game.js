// game state

// wordle response categories
const { GREEN, YELLOW, BLACK } = require('./constants');

class Game {
  constructor(dateOverride, wordLength, rawList) {
    // default to today's date
    this.today = new Date(Date.now());
    if (dateOverride) {
      // convert string to date using local timezone
      this.today = new Date(dateOverride.split('-'));
      if (this.today.toString() === 'Invalid Date') {
        throw `invalid date override ${dateOverride}`;
      }
      this.today.setTime(
        this.today.getTime() + (this.today.getTimezoneOffset() * 60 * 1000)
      );
    }

    // make sure raw list is not empty
    if (!rawList || rawList.length === 0) {
      throw 'empty raw list';
    }

    // colors in responses are parsed into four state variables
    this.badLetters = new Set();
    this.requiredLetters = new Set();
    this.exactPosition = '.'.repeat(wordLength);
    this.wrongPosition = [];
    for (let i = 0; i < wordLength; i += 1) {
      this.wrongPosition.push(new Set());
    }
  
    // sort raw list based on weight of letter-positions
    const letterCount = Game.countLetters(wordLength, rawList);
    this.letterList = Game.sortLetters(letterCount);
    const weightedObjects = Game.weighWords(letterCount, rawList);
    this.wordList = Game.sortWords(weightedObjects);
  }

  // indexes for game state weights array
  static getAnyPosIndex() { return 0; }
  static getExactPosIndex(index) { return index + 1; }

  // get best guess (and number of possible guesses)
  getGuess(attempt) {
    // use day-of-month for first guess (for variety)
    // otherwise use first word in filtered word list
    const dateOffset = this.today.getDate() - 1;
    const listIndex = dateOffset < this.wordList.length ? dateOffset : 0;
    const guessIndex = (attempt > 1) ? 0 : listIndex;
    return [ this.wordList[guessIndex], this.wordList.length ];
  }

  // remove words from wordlist based on response colors
  applyFilter(guess, response) {
    for (let i = 0; i < response.length; i += 1) {
      const letter = guess[i];
      const color = response[i].toUpperCase();
      if (![BLACK, YELLOW, GREEN].includes(color)) {
        console.log('unknown response color:', response[i]);
        process.exit();
      }

      if (color === BLACK) {
        this.wrongPosition[i].add(letter);
      } else if (color === YELLOW) {
        this.requiredLetters.add(letter);
        this.wrongPosition[i].add(letter);
      } else if (color === GREEN) {
        this.requiredLetters.add(letter);
        const exactChars = this.exactPosition.split('');
        exactChars[i] = letter;
        this.exactPosition = exactChars.join('');
      }
    }

    // a black letter may also be a bad letter if not matched elsewhere
    for (let i = 0; i < response.length; i += 1) {
      const letter = guess[i];
      const color = response[i].toUpperCase();
      if (color === BLACK) {
        let allBlack = true;
        for (let j = 0; j < response.length; j += 1) {
          if (i !== j && letter === guess[j]) {
            let jColor = response[j].toUpperCase();
            if (jColor !== BLACK) {
              allBlack = false;
              break;
            }
          }
        }
        if (allBlack) {
          this.badLetters.add(letter);
        }
      }
    }
  
    // convert sets and patterns to regex objects
    // first insert (impossible) letter into bad array so that regex ctor works
    const BOGUS_LETTER = '#';
    const badArray = Array.from(this.badLetters);
    badArray.push(BOGUS_LETTER);
  
    const regex = {
      bad: new RegExp(badArray.join('|')),
      reqd: new RegExp(Array.from(this.requiredLetters)
        .map(letter => `(?=.*${letter})`)
        .join('')),
      exact: new RegExp(this.exactPosition),
      wrong: new RegExp(this.wrongPosition
        .map(set => `[^${Array.from(set).join('')}]`)
        .join(''))
    };
  
    // apply regexes to word list
    const filteredList = [];
    this.wordList.forEach((word) => {
      if (word.match(regex.bad)) return;
      if (!word.match(regex.reqd)) return;
      if (!word.match(regex.exact)) return;
      if (!word.match(regex.wrong)) return;
      filteredList.push(word);
    });
    this.wordList = filteredList;
  }

  static countLetters(wordLength, rawList) {
    // letter weights from full word list should be used each turn
    const letterCount = [];
    const anyPos = Game.getAnyPosIndex();
    rawList.forEach((word) => {
      if (word.length !== wordLength) {
        throw `invalid word length ${word.length} for word ${word}`;
      }

      const letters = word.split('');
      letters.forEach((letter, index) => {
        const exactPos = Game.getExactPosIndex(index);
        letterCount[anyPos] = letterCount[anyPos] || [];
        letterCount[exactPos] = letterCount[exactPos] || [];
        letterCount[anyPos][letter] = letterCount[anyPos][letter] || 0;
        letterCount[exactPos][letter] = letterCount[exactPos][letter] || 0;
        letterCount[anyPos][letter] += 1;
        letterCount[exactPos][letter] += 1;
      });
    });
    return letterCount;
  }

  static weighWords(weights, rawList) {
    const weightedObjects = [];
    const anyPos = Game.getAnyPosIndex();
    rawList.forEach(word => {
      // weigh based on unique letters in word
      let weight = 0;
      const letters = [...new Set(word.split(''))];
      letters.forEach((letter, index) => {
        // 1. start with frequency of any-position matching
        // 2. give extra weight to exact-position matching
        const exactPos = Game.getExactPosIndex(index);
        weight += weights[anyPos][letter];
        weight += weights[exactPos][letter];
      });
      weightedObjects.push({ word, weight });
    });
    return weightedObjects;
  }

  static sortLetters(letterCount) {
    const sortedLetters = [];
    letterCount.forEach((letterObject, index) => {
      const positionCount = [];
      Object.keys(letterObject).forEach(
        letter => positionCount.push({ letter, count: letterObject[letter] })
      );
      sortedLetters[index] = positionCount.sort((a, b) => {
        return b.count - a.count;
      });
    });
    return sortedLetters;
  }

  static sortWords(weightedObjects) {
    const sortedWords = weightedObjects.sort((a, b) => {
      return b.weight - a.weight;
    }).map(obj => obj.word);
    return sortedWords;
  }
}

module.exports = Game;
