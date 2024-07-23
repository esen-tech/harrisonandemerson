#!/bin/bash

SOURCE_DB_HOST=34.80.74.40
SOURCE_DB_USERNAME=postgres
SOURCE_DB_PASSWORD=8yAuEE6lyfdg24cs

for SCHEMA_NAME in esen_marketing esen_emr esen_iam esen_product esen_scheduling
do
    docker exec -i $(docker ps -qf "name=python-services_database_1") /bin/bash -c "PGPASSWORD=${SOURCE_DB_PASSWORD} pg_dump -d postgres -h $SOURCE_DB_HOST --username ${SOURCE_DB_USERNAME} -n ${SCHEMA_NAME}" > ./dump/${SCHEMA_NAME}.sql
done
