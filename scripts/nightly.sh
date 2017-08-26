#!/bin/bash

set -ev
#bundle exec rake:units
echo ${TRAVIS_EVENT_TYPE};
if [ "${TRAVIS_EVENT_TYPE}" = "cron" ]; then
    #bundle exec rake test:integration
    echo test;
fi