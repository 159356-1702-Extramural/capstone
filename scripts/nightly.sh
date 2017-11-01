#!/bin/bash
import datetime
set -ev

# echo ${TRAVIS_EVENT_TYPE};
#    + returns 'api' when manually triggering build
#    + returns 'push' when pushing to remote branch
#    + returns 'cron' when called by the travis cron job trigger

if [ "${TRAVIS_EVENT_TYPE}" = "cron" ]; then
        
        # run once a week
        if (datetime.datetime.now().timetuple().tm_yday % 7 == 0):
            python tests/seleniumPythonTest/test_case/slnm_tests_compatability.py

        wait
        npm test "tests/saucelabs.test_cron.js"

    else
        npm test
fi
