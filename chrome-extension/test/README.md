# Testing the Chrome Extension

No automation has been written yet.

## Use cases

* user has no Wordle history
* user has lots of Wordle history
* user is using Chrome with no Wordle tab
* user is using Chrome with Wordle tab, but a different tab is active
* user is actively using Wordle in Chrome
* user starts game manually, then starts using extension half-way through
* game has 0 guesses
* game has 6 guesses without solution
* game has 1-6 guesses with solution

## Hints for manually testing

* The Wordle app saves data in the browser data. [Clear browser data](chrome://settings/clearBrowserData) will delete __all__ Wordle history, even if you only try to clear data for "last hour".
* This extension saves data in session memory; close and re-open the browser to re-initialize extension data.
