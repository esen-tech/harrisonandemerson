from __future__ import annotations

import abc
from datetime import timedelta
from typing import IO

from fastapi import UploadFile
from google.cloud import storage
from google.oauth2 import service_account


class StorageObject:
    @classmethod
    def from_upload_file(cls, upload_file: UploadFile) -> StorageObject:
        return cls(upload_file.file)

    def __init__(self, file_descriptor: IO) -> None:
        self._file_descriptor = file_descriptor

    def get_file_descriptor(self) -> IO:
        return self._file_descriptor


class StorageEngine(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def put(
        self,
        bucket_name: str,
        object_name: str,
        storage_object: StorageObject,
        *args,
        **kwargs,
    ):
        raise NotImplemented

    @abc.abstractmethod
    def get(self, bucket_name: str, object_name: str, *args, **kwargs):
        raise NotImplemented

    @abc.abstractmethod
    def delete(self, bucket_name: str, object_name: str):
        raise NotImplemented

    @abc.abstractmethod
    def bulk_delete(self, bucket_name: str, object_name_pattern: str):
        raise NotImplemented

    @abc.abstractmethod
    def request_url(self, bucket_name: str, object_name: str, *args, **kwargs) -> str:
        raise NotImplemented


class GoogleCloudStorageEngine(StorageEngine):
    def __init__(self, raw_credentials: dict):
        credentials = service_account.Credentials.from_service_account_info(
            raw_credentials
        )
        self._storage_client = storage.Client(credentials=credentials)

    def put(self, bucket_name: str, object_name: str, storage_object: StorageObject):
        bucket = self._storage_client.bucket(bucket_name)
        blob = bucket.blob(object_name)
        blob.upload_from_file(storage_object.get_file_descriptor())

    def get(self, bucket_name: str, object_name: str):
        raise NotImplemented

    def delete(self, bucket_name: str, object_name: str):
        bucket = self._storage_client.bucket(bucket_name)
        blob = bucket.blob(object_name)
        blob.delete()

    def bulk_delete(self, bucket_name: str, object_name_pattern: str):
        bucket = self._storage_client.bucket(bucket_name)
        blobs = list(
            self._storage_client.list_blobs(bucket_name, prefix=object_name_pattern)
        )
        bucket.delete_blobs(blobs)

    def request_url(
        self,
        bucket_name: str,
        object_name: str,
        age: timedelta = None,
        response_type: str = None,
    ) -> str:
        bucket = self._storage_client.bucket(bucket_name)
        blob = bucket.blob(object_name)
        # https://cloud.google.com/storage/docs/access-control/signing-urls-with-helpers#download-object
        url = blob.generate_signed_url(
            version="v4",
            expiration=age,
            method="GET",
            response_type=response_type,
        )
        return url
