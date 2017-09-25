#!/bin/bash

python3 ../tests/seleniumPythonTest/test_case/setup_tests.py
wait
npm test "tests/selenium.test_cron.js"
wait
npm test "tests/gamelogic.test_cron.js"
wait
