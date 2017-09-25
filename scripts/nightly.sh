#!/bin/bash

set -ev

# echo ${TRAVIS_EVENT_TYPE};
#    + returns 'api' when manually triggering build
#    + returns 'push' when pushing to remote branch
#    + returns 'cron' when called by the travis cron job trigger

if [ "${TRAVIS_EVENT_TYPE}" = "push" ]; then
        #pip install selenium && pip install sauceclient
        python tests/seleniumPythonTest/test_case/setup_tests.py
        wait
        npm test "tests/selenium.test_cron.js"
        wait
        npm test "tests/gamelogic.test_cron.js"

    else
        npm test;
fi
