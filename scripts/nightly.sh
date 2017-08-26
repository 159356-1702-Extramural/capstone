#!/bin/bash

set -ev

# echo ${TRAVIS_EVENT_TYPE};
#    + returns 'api' when manually triggering build
#    + returns 'push' when pushing to remote branch

if [ "${TRAVIS_EVENT_TYPE}" = "cron" ]; then
    # run selenium tests here
    echo test;
fi