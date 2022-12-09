#!/bin/bash

# export game for nodeJS
GAMEHEADER="const { COLORCODE_GREEN, COLORCODE_YELLOW, COLORCODE_BLACK } = require('./constants');"
GAMEFOOTER="module.exports = Game;"
echo $GAMEHEADER > command-line/game.js
cat ./game.js >> command-line/game.js
echo $GAMEFOOTER >> command-line/game.js

# export game for ES6
GAMEHEADER=`grep COLORCODE constants.js | cut -f 1 -d ';' | tr '\n' ';'`
GAMEFOOTER="export { Game };"
echo $GAMEHEADER > chrome-extension/game.js
cat ./game.js >> chrome-extension/game.js
echo $GAMEFOOTER >> chrome-extension/game.js

# export constants for nodeJS and ES6
CONSTLIST=`cat constants.js | grep '^const ' | cut -f 2 -d ' ' | tr '\n' ','`
CONSTLIST=$CONSTLIST'X'
cat ./constants.js > command-line/constants.js
echo 'module.exports = {' >> command-line/constants.js
echo $CONSTLIST >> command-line/constants.js
echo '};' >> command-line/constants.js

cat ./constants.js > chrome-extension/constants.js
echo 'export default {' >> chrome-extension/constants.js
echo $CONSTLIST >> chrome-extension/constants.js
echo '};' >> chrome-extension/constants.js

