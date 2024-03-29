
class Game {
  constructor(dateOverride, wordLength, rawList, weigher=Game.doNotSort) {
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

    this.wordLength = wordLength;
    this.sortWordlist(wordLength, rawList, weigher);
  }
  
  // sort raw list based on weight of letter-positions
  sortWordlist(wordLength, wordList, weigher, attempt=0) {
    const letterCount = Game.countLetters(wordLength, wordList);
    this.letterList = Game.sortLetters(letterCount);
    const weightedObjects = weigher(letterCount, wordList, attempt);
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

  // get regex for given guess and color-pattern response
  getFilter(guess, response) {
    // colors in responses are parsed into four variables
    const badLetters = new Set();
    const requiredLetters = new Set();
    let exactPosition = '.'.repeat(this.wordLength);
    const wrongPosition = [];
    for (let i = 0; i < this.wordLength; i += 1) {
      wrongPosition.push(new Set());
    }

    for (let i = 0; i < response.length; i += 1) {
      const letter = guess[i];
      const color = response[i].toUpperCase();
      const known = [ COLORCODE_BLACK, COLORCODE_YELLOW, COLORCODE_GREEN ];
      if (!known.includes(color)) {
        console.log('unknown response color:', response[i]);
        break;
      }

      if (color === COLORCODE_BLACK) {
        wrongPosition[i].add(letter);
      } else if (color === COLORCODE_YELLOW) {
        requiredLetters.add(letter);
        wrongPosition[i].add(letter);
      } else if (color === COLORCODE_GREEN) {
        requiredLetters.add(letter);
        const exactChars = exactPosition.split('');
        exactChars[i] = letter;
        exactPosition = exactChars.join('');
      }
    }

    // a black letter may also be a bad letter if not matched elsewhere
    for (let i = 0; i < response.length; i += 1) {
      const letter = guess[i];
      const color = response[i].toUpperCase();
      if (color === COLORCODE_BLACK) {
        let allBlack = true;
        for (let j = 0; j < response.length; j += 1) {
          if (i !== j && letter === guess[j]) {
            let jColor = response[j].toUpperCase();
            if (jColor !== COLORCODE_BLACK) {
              allBlack = false;
              break;
            }
          }
        }
        if (allBlack) {
          badLetters.add(letter);
        }
      }
    }
  
    // convert sets and patterns to regex objects
    // first insert (impossible) letter into bad array so that regex ctor works
    const BOGUS_LETTER = '#';
    const badArray = Array.from(badLetters);
    badArray.push(BOGUS_LETTER);
  
    const regex = {
      bad: new RegExp(badArray.join('|')),
      reqd: new RegExp(Array.from(requiredLetters)
        .map(letter => `(?=.*${letter})`)
        .join('')),
      exact: new RegExp(exactPosition),
      wrong: new RegExp(wrongPosition
        .map(set => `[^${Array.from(set).join('')}]`)
        .join(''))
    };
    return regex;
  }
  
  // remove words from wordlist based on response colors
  applyFilter(guess, response) {
    const regex = this.getFilter(guess, response);

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

  static countLetters(wordLength, wordList) {
    // letter weights from full word list should be used each turn
    const letterCount = [];
    const anyPos = Game.getAnyPosIndex();
    wordList.forEach((word) => {
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

  static doNotSort(letterCount, wordList) {
    return wordList.map((word, index) => {
      return { word, weight: -1 * index };
    });
  }

  static weighWords(letterCount, wordList) {
    const weightedObjects = [];
    const anyPos = Game.getAnyPosIndex();
    wordList.forEach(word => {
      // weigh based on unique letters in word
      let weight = 0;
      const letters = [...new Set(word.split(''))];
      letters.forEach((letter, index) => {
        // 1. start with frequency of any-position matching
        // 2. give extra weight to exact-position matching
        const exactPos = Game.getExactPosIndex(index);
        weight += letterCount[anyPos][letter];
        weight += letterCount[exactPos][letter];
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

  // calculate B/Y/G response filter for given guess and solution
  // not used in normal game, but useful for simulation
  static calculateResponse(guessString, solutionString) {
    const NO_LETTER = '#';
    const SOLUTIONLEN = solutionString.length;
    let guess = guessString.split('');
    let solution = solutionString.split('');
    let response = [];
    for (let i = 0; i < SOLUTIONLEN; i += 1) {
      if (guess[i] === solution[i]) {
        response[i] = COLORCODE_GREEN;
        guess[i] = NO_LETTER;
      }
    }
    for (let i = 0; i < SOLUTIONLEN; i += 1) {
      for (let j = 0; j < SOLUTIONLEN; j += 1) {
        if (i != j && guess[i] === solution[j]) {
          response[i] = COLORCODE_YELLOW;
          guess[i] = NO_LETTER;
        }
      }
    }
    for (let i = 0; i < SOLUTIONLEN; i += 1) {
      if (guess[i] != NO_LETTER) {
        response[i] = COLORCODE_BLACK;
        guess[i] = NO_LETTER;
      }
    }
    return response.join('');
  }
}
