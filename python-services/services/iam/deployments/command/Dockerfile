FROM python:3.10.2-slim

ARG SERVICE_NAME
ARG ENTRYPOINT_NAME
ARG IMAGE_NAME
ARG RELEASE_IMAGE_TAG

WORKDIR /app

RUN apt-get update

COPY ./services/${SERVICE_NAME}/requirements.txt /app/requirements.txt
RUN pip3 install -r /app/requirements.txt

COPY ./core /app/core
COPY ./modules /app/modules
COPY ./services/${SERVICE_NAME} /app/services/${SERVICE_NAME}

ENV SERVICE_NAME=${SERVICE_NAME}
ENV ENTRYPOINT_NAME=${ENTRYPOINT_NAME}
ENV IMAGE_NAME=${IMAGE_NAME}
ENV RELEASE_IMAGE_TAG=${RELEASE_IMAGE_TAG}

ENTRYPOINT python3 -m services.${SERVICE_NAME}.entrypoints.${ENTRYPOINT_NAME} "$@"
