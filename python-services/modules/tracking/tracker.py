import abc

import sentry_sdk
from core.config import get_config as get_core_config
from core.enum import EnvEnum
from modules.tracking.config import get_config as get_tracking_config


class Tracker(metaclass=abc.ABCMeta):
    def __init__(self):
        self.initialize()

    @abc.abstractmethod
    def initialize(self, **kwargs):
        raise NotImplementedError

    @abc.abstractmethod
    def capture_exception(self, exception: Exception):
        raise NotImplementedError


class SentryTracker(Tracker):
    def initialize(self, dsn: str = None, traces_sample_rate: float = 0.0, **kwargs):
        core_config = get_core_config()
        if dsn is None:
            tracking_config = get_tracking_config()
            dsn = tracking_config.SENTRY_DSN

        # `traces_sample_rate` should be 0.0.
        # Otherwise, the endpoint `GET /metrics` will blow up sentry transaction capacity
        if core_config.ENV in [EnvEnum.STAGING, EnvEnum.PRODUCTION]:
            sentry_sdk.init(
                dsn=dsn,
                environment=core_config.ENV.value,
                # Set traces_sample_rate to 1.0 to capture 100%
                # of transactions for performance monitoring.
                # We recommend adjusting this value in production.
                traces_sample_rate=traces_sample_rate,
                **kwargs
            )
            sentry_sdk.set_tag("esen.service_name", core_config.SERVICE_NAME)
            sentry_sdk.set_tag("esen.entrypoint_name", core_config.ENTRYPOINT_NAME)
            sentry_sdk.set_tag("esen.release_image_tag", core_config.RELEASE_IMAGE_TAG)

    def capture_exception(self, exception: Exception):
        sentry_sdk.capture_exception(exception)
