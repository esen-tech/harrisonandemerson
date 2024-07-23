#!/bin/bash

for SCHEMA_NAME in esen_marketing esen_emr esen_iam esen_product esen_scheduling
do
    docker exec -i $(docker ps -qf "name=python-services_database_1") /bin/bash -c "psql --username esen -d esen" < ./dump/${SCHEMA_NAME}.sql
done
