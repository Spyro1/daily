import logging
import sys
from app.core.config import app_configs
from loguru import logger

class InterceptHandler(logging.Handler):
    def emit(self, record: logging.LogRecord) -> None:
        level: str | int
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )

def configure_logging():
    logger.remove()
    logger.add(sys.stdout, level=app_configs.log_level, enqueue=True)

    intercept_handler = InterceptHandler()

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(intercept_handler)
    root_logger.setLevel(app_configs.log_level)

    for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
        target_logger = logging.getLogger(name)
        target_logger.handlers.clear()
        target_logger.addHandler(intercept_handler)
        target_logger.setLevel(app_configs.log_level)
        target_logger.propagate = False