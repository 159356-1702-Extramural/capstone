#!/bin/bash

# test drag and drop and general setup phase
python tests/seleniumPythonTest/test_case/setup_tests.py
wait
# test popups open close and buttons clickable, values on screen update
npm test "tests/selenium.test_cron.js"
wait
# game logic - work in progress
npm test "tests/gamelogic.test_cron.js"
