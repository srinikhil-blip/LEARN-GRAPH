"""
LearnGraph — Base Repository
Re-exports BaseRepository for modular repository imports.
"""

from app.repositories.user_repository import BaseRepository

__all__ = ["BaseRepository"]
