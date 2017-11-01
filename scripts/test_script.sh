#!/bin/bash

# test drag and drop and general setup phase
python tests/seleniumPythonTest/test_case/slnm_tests_compatability.py
wait
# test popups open close and buttons clickable, values on screen update
npm test "tests/saucelabs.test_cron.js"