from core.exceptions import EsenException


class EsenWebServerError(EsenException):
    pass


class EsenBadRequestError(EsenWebServerError):
    pass

class EsenUnauthorizedError(EsenWebServerError):
    pass


class EsenPermissionDeniedError(EsenWebServerError):
    pass
