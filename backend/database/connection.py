"""SQLite connection helpers used by all model files."""

import sqlite3
from contextlib import contextmanager
from typing import Iterator

from config import DATABASE_PATH


def get_db_connection() -> sqlite3.Connection:
    """Open one SQLite connection with safe project defaults."""

    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA busy_timeout = 10000")
    return connection


@contextmanager
def database_connection() -> Iterator[sqlite3.Connection]:
    """Yield a connection, then commit/rollback and always close it."""

    connection = get_db_connection()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
