#!/bin/bash

set -ev

# echo ${TRAVIS_EVENT_TYPE};
#    + returns 'api' when manually triggering build
#    + returns 'push' when pushing to remote branch
#    + returns 'cron' when called by the travis cron job trigger

if [ "${TRAVIS_EVENT_TYPE}" = "cron" ]; then
        npm test "tests/saucelabs.test_cron.js"
        #wait
        #python tests/seleniumPythonTest/test_case/setup_tests.py

    else
        npm test
fi
