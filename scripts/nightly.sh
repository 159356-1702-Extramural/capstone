#!/bin/bash

set -ev

# echo ${TRAVIS_EVENT_TYPE};
#    + returns 'api' when manually triggering build
#    + returns 'push' when pushing to remote branch
#    + returns 'cron' when called by the travis cron job trigger

if [ "${TRAVIS_EVENT_TYPE}" = "push" ]; then
        npm test;
        echo "running selenium headless browser tests";
        pip install selenium && pip install sauceclient
        python tests/seleniumPythonTest/run_all_tests.py;
        
    else      
        npm test;
fi
