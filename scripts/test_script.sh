#!/bin/bash

npm test "tests/selenium.test_cron.js"
wait
npm test "tests/gamelogic.test_cron.js"
wait
python3 tests/seleniumPythonTest/test_case/slnm_test_check_title.py