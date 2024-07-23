from __future__ import annotations

import abc
from dataclasses import dataclass
from typing import Generic, Tuple, TypeVar

from pydantic import BaseModel
from pydantic.generics import GenericModel


class EnhanceContext(BaseModel):
    pass


class EnhanceMetadata(BaseModel):
    pass


@dataclass(kw_only=True)
class ViewEnhancement:
    enhancer: ViewEnhancer
    context: EnhanceContext


EnhancedDataT = TypeVar("EnhancedDataT")


class EnhancedViewSchema(GenericModel, Generic[EnhancedDataT]):
    enhanced_data: EnhancedDataT
    metadata: dict | None


EnhanceTargetT = TypeVar("EnhanceTargetT")
EnhanceContextT = TypeVar("EnhanceContextT", bound=EnhanceContext)
EnhanceMetadataT = TypeVar("EnhanceMetadataT", bound=EnhanceMetadata)


class ViewEnhancer(
    Generic[EnhanceTargetT, EnhanceContextT, EnhanceMetadataT], metaclass=abc.ABCMeta
):
    @abc.abstractmethod
    def enhance(
        self, target: EnhanceTargetT, context: EnhanceContextT
    ) -> Tuple[EnhanceTargetT, EnhanceMetadataT]:
        raise NotImplementedError

    @abc.abstractmethod
    def get_context(self, *args, **kwargs) -> EnhanceContextT:
        raise NotImplementedError
