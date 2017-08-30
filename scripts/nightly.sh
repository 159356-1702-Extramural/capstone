#!/bin/bash

set -ev

# echo ${TRAVIS_EVENT_TYPE};
#    + returns 'api' when manually triggering build
#    + returns 'push' when pushing to remote branch
#    + returns 'cron' when called by the travis cron job trigger

if [ "${TRAVIS_EVENT_TYPE}" = "cron" ]; then
        python tests/seleniumPythonTest/click_tutorial.py;
        echo "running selenium headless browser tests";
    else      
        npm test;
fi
