#!/bin/bash

HOST=elk_elasticsearch_1

ping -c1 $HOST 1>/dev/null 2>/dev/null
SUCCESS=$?

if [ $SUCCESS -eq 0 ]
then
    echo "Elasticsearch container found - attaching to Cloudhost backend..."
    export ES_RUNNING=true
else
    echo "Elasticsearch container not found - skipping integration..."
    export ES_RUNNING=false
fi


