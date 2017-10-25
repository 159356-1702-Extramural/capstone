#!/bin/bash

set -ev

# echo ${TRAVIS_EVENT_TYPE};
#    + returns 'api' when manually triggering build
#    + returns 'push' when pushing to remote branch
#    + returns 'cron' when called by the travis cron job trigger

if [ "${TRAVIS_EVENT_TYPE}" = "cron" ]; then

        python tests/seleniumPythonTest/test_case/slnm_test_gameplay.py;
        
    else      
        npm test;
fi
