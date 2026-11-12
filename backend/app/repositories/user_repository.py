"""
LearnGraph — User Repository
Generic async BaseRepository and concrete UserRepository built on SQLAlchemy 2.0.
"""

from datetime import UTC, datetime
from typing import Any, Generic, List, Optional, Sequence, Type, TypeVar
from uuid import UUID

import structlog
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError, NoResultFound, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DatabaseError, DuplicateEntryError, NotFoundError
from app.database.base import Base
from app.models.enums import UserRole
from app.models.user import User

logger = structlog.get_logger(__name__)

ModelT = TypeVar("ModelT", bound=Base)


# ── Generic Base Repository ───────────────────────────────────────────────────


class BaseRepository(Generic[ModelT]):
    """
    Generic async CRUD repository.

    Type Parameters:
        ModelT: SQLAlchemy declarative model class.

    Args:
        session: Injected :class:`AsyncSession` from FastAPI dependency.
        model: The SQLAlchemy model class this repository operates on.
    """

    def __init__(self, session: AsyncSession, model: Type[ModelT]) -> None:
        self._session = session
        self._model = model

    # ── Read ──────────────────────────────────────────────────────────────────

    async def get_by_id(self, id: UUID) -> Optional[ModelT]:
        """
        Fetch a single record by its UUID primary key.

        Args:
            id: UUID primary key value.

        Returns:
            Model instance if found, else None.
        """
        try:
            result = await self._session.execute(
                select(self._model).where(self._model.id == id)  # type: ignore[attr-defined]
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            logger.error(
                "get_by_id failed",
                model=self._model.__name__,
                id=str(id),
                error=str(exc),
            )
            raise DatabaseError(f"Failed to fetch {self._model.__name__}") from exc

    async def get_all(
        self,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> Sequence[ModelT]:
        """
        Fetch a paginated list of records.

        Args:
            limit: Maximum number of records to return.
            offset: Number of records to skip.

        Returns:
            Sequence of model instances.
        """
        try:
            result = await self._session.execute(
                select(self._model).limit(limit).offset(offset)
            )
            return result.scalars().all()
        except SQLAlchemyError as exc:
            logger.error(
                "get_all failed", model=self._model.__name__, error=str(exc)
            )
            raise DatabaseError(f"Failed to list {self._model.__name__}") from exc

    async def exists(self, **filters: Any) -> bool:
        """
        Check whether at least one record matching *filters* exists.

        Args:
            **filters: Column-name/value keyword pairs used for WHERE clause.

        Returns:
            True if a matching record exists, False otherwise.
        """
        try:
            query = select(func.count()).select_from(self._model)
            for attr, value in filters.items():
                query = query.where(getattr(self._model, attr) == value)
            result = await self._session.execute(query)
            count: int = result.scalar_one()
            return count > 0
        except SQLAlchemyError as exc:
            logger.error(
                "exists check failed",
                model=self._model.__name__,
                filters=filters,
                error=str(exc),
            )
            raise DatabaseError(f"Existence check failed for {self._model.__name__}") from exc

    # ── Write ─────────────────────────────────────────────────────────────────

    async def create(self, data: dict[str, Any]) -> ModelT:
        """
        Insert a new record.

        Args:
            data: Dictionary of column-name/value pairs.

        Returns:
            Freshly created and refreshed model instance.

        Raises:
            DuplicateEntryError: On unique-constraint violation.
            DatabaseError: On other database failures.
        """
        try:
            instance = self._model(**data)
            self._session.add(instance)
            await self._session.flush()
            await self._session.refresh(instance)
            logger.debug("Record created", model=self._model.__name__, id=str(instance.id))  # type: ignore[attr-defined]
            return instance
        except IntegrityError as exc:
            await self._session.rollback()
            logger.warning(
                "Duplicate entry on create",
                model=self._model.__name__,
                error=str(exc),
            )
            raise DuplicateEntryError() from exc
        except SQLAlchemyError as exc:
            await self._session.rollback()
            logger.error(
                "create failed", model=self._model.__name__, error=str(exc)
            )
            raise DatabaseError(f"Failed to create {self._model.__name__}") from exc

    async def update(self, id: UUID, data: dict[str, Any]) -> ModelT:
        """
        Update a record by primary key.

        Args:
            id: UUID primary key of the record to update.
            data: Mapping of column names to new values.

        Returns:
            Updated and refreshed model instance.

        Raises:
            NotFoundError: If no record with *id* exists.
            DatabaseError: On database failures.
        """
        try:
            instance = await self.get_by_id(id)
            if instance is None:
                raise NotFoundError(f"{self._model.__name__} with id={id} not found")
            for attr, value in data.items():
                setattr(instance, attr, value)
            await self._session.flush()
            await self._session.refresh(instance)
            logger.debug("Record updated", model=self._model.__name__, id=str(id))
            return instance
        except (NotFoundError, DatabaseError):
            raise
        except SQLAlchemyError as exc:
            await self._session.rollback()
            logger.error(
                "update failed",
                model=self._model.__name__,
                id=str(id),
                error=str(exc),
            )
            raise DatabaseError(f"Failed to update {self._model.__name__}") from exc

    async def delete(self, id: UUID) -> bool:
        """
        Hard-delete a record by primary key.

        Args:
            id: UUID primary key of the record to delete.

        Returns:
            True if the record was deleted, False if it did not exist.
        """
        try:
            instance = await self.get_by_id(id)
            if instance is None:
                return False
            await self._session.delete(instance)
            await self._session.flush()
            logger.debug("Record deleted", model=self._model.__name__, id=str(id))
            return True
        except SQLAlchemyError as exc:
            await self._session.rollback()
            logger.error(
                "delete failed",
                model=self._model.__name__,
                id=str(id),
                error=str(exc),
            )
            raise DatabaseError(f"Failed to delete {self._model.__name__}") from exc


# ── User Repository ───────────────────────────────────────────────────────────


class UserRepository(BaseRepository[User]):
    """
    Domain-specific repository for :class:`~app.models.user.User`.

    Provides typed query methods on top of the generic CRUD base.
    All methods are async and use SQLAlchemy 2.0 ``select()`` style.
    """

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, User)

    # ── Lookups ───────────────────────────────────────────────────────────────

    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Fetch a user by email address (case-insensitive).

        Args:
            email: Email address to look up.

        Returns:
            Matching :class:`User` instance, or None if not found.
        """
        try:
            result = await self._session.execute(
                select(User).where(func.lower(User.email) == email.lower().strip())
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            logger.error("get_by_email failed", email=email, error=str(exc))
            raise DatabaseError("Failed to look up user by email") from exc

    async def get_by_id(self, id: UUID) -> Optional[User]:  # type: ignore[override]
        """
        Fetch a user by their UUID primary key.

        Args:
            id: UUID of the user.

        Returns:
            Matching :class:`User` instance, or None if not found.
        """
        try:
            result = await self._session.execute(
                select(User).where(User.id == id)
            )
            return result.scalar_one_or_none()
        except SQLAlchemyError as exc:
            logger.error("get_by_id failed", user_id=str(id), error=str(exc))
            raise DatabaseError("Failed to look up user by id") from exc

    async def get_by_role(
        self,
        role: UserRole,
        *,
        limit: int = 20,
        offset: int = 0,
    ) -> List[User]:
        """
        Return a paginated list of users with a specific role.

        Args:
            role: :class:`~app.models.enums.UserRole` to filter on.
            limit: Maximum number of records to return (default 20).
            offset: Records to skip for pagination (default 0).

        Returns:
            List of matching :class:`User` instances.
        """
        try:
            result = await self._session.execute(
                select(User)
                .where(User.role == role)
                .order_by(User.created_at.desc())
                .limit(limit)
                .offset(offset)
            )
            return list(result.scalars().all())
        except SQLAlchemyError as exc:
            logger.error("get_by_role failed", role=role, error=str(exc))
            raise DatabaseError("Failed to list users by role") from exc

    # ── Mutations ─────────────────────────────────────────────────────────────

    async def create_user(self, data: dict[str, Any]) -> User:
        """
        Create a new user record.

        Args:
            data: Dictionary containing at minimum ``email``, ``hashed_password``,
                  ``full_name``, and ``role``.

        Returns:
            Newly created :class:`User` instance.

        Raises:
            DuplicateEntryError: If the email is already registered.
        """
        return await self.create(data)

    async def update_user(self, id: UUID, data: dict[str, Any]) -> User:
        """
        Partial-update a user record.

        Args:
            id: UUID of the user to update.
            data: Fields and new values to apply.

        Returns:
            Updated :class:`User` instance.

        Raises:
            NotFoundError: If no user with *id* exists.
        """
        return await self.update(id, data)

    async def set_password(self, id: UUID, hashed_password: str) -> None:
        """
        Overwrite the stored password hash for a user.

        Args:
            id: UUID of the target user.
            hashed_password: New bcrypt hash to store.

        Raises:
            NotFoundError: If no user with *id* exists.
        """
        try:
            await self._session.execute(
                update(User)
                .where(User.id == id)
                .values(hashed_password=hashed_password)
            )
            await self._session.flush()
            logger.info("Password updated", user_id=str(id))
        except SQLAlchemyError as exc:
            await self._session.rollback()
            logger.error("set_password failed", user_id=str(id), error=str(exc))
            raise DatabaseError("Failed to update password") from exc

    async def set_verified(self, id: UUID) -> None:
        """
        Mark the user's email as verified.

        Args:
            id: UUID of the user to verify.
        """
        try:
            await self._session.execute(
                update(User).where(User.id == id).values(is_verified=True)
            )
            await self._session.flush()
            logger.info("Email verified", user_id=str(id))
        except SQLAlchemyError as exc:
            await self._session.rollback()
            logger.error("set_verified failed", user_id=str(id), error=str(exc))
            raise DatabaseError("Failed to verify user email") from exc

    async def set_last_login(self, id: UUID) -> None:
        """
        Stamp the current UTC timestamp as the user's last-login time.

        Args:
            id: UUID of the user who just logged in.
        """
        try:
            await self._session.execute(
                update(User)
                .where(User.id == id)
                .values(last_login_at=datetime.now(UTC))
            )
            await self._session.flush()
        except SQLAlchemyError as exc:
            # Non-critical — log but don't raise so login still succeeds
            logger.warning(
                "set_last_login failed (non-fatal)",
                user_id=str(id),
                error=str(exc),
            )
