"""
MongoDB Connection Module
=========================
Initializes and manages a singleton PyMongo client connected via settings.MONGODB_URI.
Provides collection accessors and connection status check.
"""
import logging
from django.conf import settings
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

logger = logging.getLogger(__name__)

_mongo_client = None


def get_mongo_client():
    """Return a singleton MongoClient instance."""
    global _mongo_client
    if _mongo_client is None:
        try:
            _mongo_client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=getattr(settings, 'MONGODB_TIMEOUT_MS', 3000),
                connectTimeoutMS=getattr(settings, 'MONGODB_TIMEOUT_MS', 3000),
            )
        except Exception as e:
            logger.warning(f"Could not initialize MongoClient: {e}")
            return None
    return _mongo_client


def get_mongo_db():
    """Return the configured MongoDB database handle, or None if offline."""
    client = get_mongo_client()
    if client is None:
        return None
    try:
        return client[settings.MONGODB_DB_NAME]
    except Exception as e:
        logger.warning(f"Error accessing MongoDB database {settings.MONGODB_DB_NAME}: {e}")
        return None


def get_mongo_collection(collection_name):
    """
    Return a specific collection from the MongoDB database,
    or None if MongoDB is unavailable.
    """
    db = get_mongo_db()
    if db is not None:
        return db[collection_name]
    return None


def check_mongo_connection():
    """
    Ping MongoDB to verify active connection.
    Returns:
        (is_connected: bool, message: str)
    """
    client = get_mongo_client()
    if client is None:
        return False, "MongoClient not initialized"
    try:
        # The ping command is fast and confirms active server
        client.admin.command('ping')
        return True, "Connected to MongoDB"
    except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
        return False, str(e)
