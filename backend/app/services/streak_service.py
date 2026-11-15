"""
LearnGraph — Streak Service
Production-grade daily learning streak engine with authoritative timezone reckoning,
midnight boundary preservation, atomic activity validation, and milestone rewards.
"""

import json
import os
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple
from uuid import UUID
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import structlog
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.learning_activity import ActivityType, LearningActivity
from app.models.student_profile import StudentProfile
from app.models.user import User
from app.schemas.streak import (
    LearningActivityCreate,
    LearningActivityResponse,
    StreakDayHistory,
    StreakHistoryResponse,
    StreakInfo,
    StreakRecordResult,
)

logger = structlog.get_logger(__name__)

MILESTONES = [3, 7, 14, 30, 50, 100]
VALID_QUALIFYING_TYPES = {
    "lesson_completion",
    "quiz_completion",
    "exercise_completion",
    "milestone_completion",
}
DATA_FILE_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "user_progress_db.json"


class StreakService:
    """Encapsulates all business logic for student daily learning streaks."""

    def __init__(self, session: Optional[AsyncSession] = None) -> None:
        self._session = session

    def _get_user_timezone(self, tz_str: Optional[str]) -> ZoneInfo:
        """Safely parse timezone with Asia/Kolkata fallback."""
        if not tz_str:
            return ZoneInfo("Asia/Kolkata")
        try:
            return ZoneInfo(tz_str)
        except (ZoneInfoNotFoundError, ValueError):
            return ZoneInfo("Asia/Kolkata")

    def _get_today_and_yesterday(self, user_tz: ZoneInfo) -> Tuple[date, date, datetime]:
        """Compute the current and previous calendar dates in the user's timezone."""
        now_utc = datetime.now(timezone.utc)
        now_local = now_utc.astimezone(user_tz)
        today = now_local.date()
        yesterday = today - timedelta(days=1)
        return today, yesterday, now_utc

    def _compute_next_milestone(self, streak: int) -> Tuple[int, int, List[int]]:
        """Calculate next target milestone, remaining days, and unlocked milestones."""
        unlocked = [m for m in MILESTONES if streak >= m]
        remaining = [m for m in MILESTONES if streak < m]
        next_m = remaining[0] if remaining else MILESTONES[-1] + 50
        days_left = max(0, next_m - streak)
        return next_m, days_left, unlocked

    def _get_motivational_message(self, streak: int, is_active_today: bool, is_new: bool) -> str:
        """Generate accurate motivational context based on validated streak state."""
        if is_new or streak == 0:
            return "Complete a lesson or quiz today to start your daily streak!"
        if is_active_today:
            if streak in MILESTONES:
                return f"Milestone reached! You've maintained an incredible {streak}-day learning streak!"
            return f"Streak active! Awesome work learning today ({streak}-day streak)."
        return f"Streak alive! Complete your lesson today to keep your {streak}-day streak going."

    # ─────────────────────────────────────────────────────────────────────────
    # File-based Persistence Fallback (when PostgreSQL is disconnected/offline)
    # ─────────────────────────────────────────────────────────────────────────
    def _read_data_file(self) -> Dict[str, Any]:
        if not DATA_FILE_PATH.exists():
            DATA_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
            initial = {"users": {}, "activities": {}}
            DATA_FILE_PATH.write_text(json.dumps(initial, indent=2))
            return initial
        try:
            return json.loads(DATA_FILE_PATH.read_text(encoding="utf-8"))
        except Exception:
            return {"users": {}, "activities": {}}

    def _write_data_file(self, data: Dict[str, Any]) -> None:
        try:
            DATA_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
            DATA_FILE_PATH.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")
        except Exception as exc:
            logger.warning("failed_to_write_streak_data_file", error=str(exc))

    # ─────────────────────────────────────────────────────────────────────────
    # Public API: Get Current Streak
    # ─────────────────────────────────────────────────────────────────────────
    async def get_streak(self, user_id: UUID, timezone_override: Optional[str] = None) -> StreakInfo:
        """
        Inspect the user's authentic streak state.
        Preserves current streak if studied yesterday; does not prematurely reset to 0.
        """
        user_tz_str = timezone_override or "Asia/Kolkata"

        # 1. Fetch user's profile and timezone if session exists
        profile: Optional[StudentProfile] = None
        if self._session:
            try:
                user_stmt = select(User).where(User.id == user_id)
                u = (await self._session.execute(user_stmt)).scalar_one_or_none()
                if u and u.timezone:
                    user_tz_str = u.timezone

                prof_stmt = select(StudentProfile).where(StudentProfile.user_id == user_id)
                profile = (await self._session.execute(prof_stmt)).scalar_one_or_none()
            except Exception as e:
                logger.warning("streak_db_query_fallback", user_id=str(user_id), error=str(e))

        user_tz = self._get_user_timezone(user_tz_str)
        today, yesterday, _ = self._get_today_and_yesterday(user_tz)

        # 2. Query active dates from learning_activities table or JSON file
        active_dates: Set[date] = set()
        if self._session:
            try:
                act_stmt = (
                    select(LearningActivity.activity_date)
                    .where(LearningActivity.user_id == user_id)
                    .distinct()
                )
                res = await self._session.execute(act_stmt)
                active_dates = {row[0] for row in res.all()}
            except Exception:
                active_dates = set()

        if not active_dates:
            # Check JSON store
            file_data = self._read_data_file()
            user_acts = file_data.get("activities", {}).get(str(user_id), [])
            for a in user_acts:
                try:
                    active_dates.add(datetime.strptime(a["activity_date"], "%Y-%m-%d").date())
                except Exception:
                    pass

        # 3. Calculate streak values
        current_streak = 0
        longest_streak = 0
        total_active_days = len(active_dates)
        last_date: Optional[date] = None

        if profile:
            current_streak = profile.streak_days
            longest_streak = getattr(profile, "longest_streak", current_streak)
            last_date = getattr(profile, "last_activity_date", None)
        else:
            file_data = self._read_data_file()
            u_info = file_data.get("users", {}).get(str(user_id), {})
            current_streak = u_info.get("streakDays", 0)
            longest_streak = u_info.get("longestStreak", current_streak)
            raw_last = u_info.get("lastActiveDate")
            if raw_last:
                try:
                    last_date = datetime.strptime(raw_last, "%Y-%m-%d").date()
                except Exception:
                    last_date = None

        # Re-verify latest active date from actual recorded activities
        if active_dates:
            sorted_dates = sorted(list(active_dates), reverse=True)
            last_date = sorted_dates[0]

        is_active_today = today in active_dates

        # Evaluate streak continuity
        if last_date is None:
            current_streak = 0
        elif is_active_today:
            # Active today, streak is valid
            current_streak = max(1, current_streak)
        elif last_date == yesterday:
            # Studied yesterday, but hasn't studied today yet.
            # PRESERVE STREAK! Do not reset prematurely before day ends.
            current_streak = max(1, current_streak)
        else:
            # Gap of more than 1 calendar day -> streak broke
            current_streak = 0

        longest_streak = max(longest_streak, current_streak)

        # 4. Weekly 7-day indicator (Mon - Sun of current week in user timezone)
        monday = today - timedelta(days=today.weekday())
        weekly_activity: List[bool] = []
        for i in range(7):
            day_i = monday + timedelta(days=i)
            weekly_activity.append(day_i in active_dates)

        next_m, days_to_next, unlocked = self._compute_next_milestone(current_streak)
        msg = self._get_motivational_message(current_streak, is_active_today, total_active_days == 0)

        return StreakInfo(
            current_streak=current_streak,
            longest_streak=longest_streak,
            total_active_days=total_active_days,
            last_activity_date=last_date.isoformat() if last_date else None,
            is_active_today=is_active_today,
            today_date=today.isoformat(),
            user_timezone=user_tz_str,
            weekly_activity=weekly_activity,
            weekly_labels=["M", "T", "W", "T", "F", "S", "S"],
            motivational_message=msg,
            next_milestone=next_m,
            days_to_next_milestone=days_to_next,
            unlocked_milestones=unlocked,
            new_milestone_achieved=None,
        )

    # ─────────────────────────────────────────────────────────────────────────
    # Public API: Record Qualifying Learning Activity
    # ─────────────────────────────────────────────────────────────────────────
    async def record_activity(
        self, user_id: UUID, payload: LearningActivityCreate
    ) -> StreakRecordResult:
        """
        Record a verified learning milestone and update the daily streak transactionally.
        Enforces maximum 1 streak increment per calendar date.
        """
        # Validate activity type
        if payload.activity_type not in VALID_QUALIFYING_TYPES:
            raise ValueError(
                f"Invalid activity type: '{payload.activity_type}'. "
                f"Must be one of {sorted(list(VALID_QUALIFYING_TYPES))}"
            )

        # 1. Determine user timezone
        user_tz_str = payload.timezone or "Asia/Kolkata"
        if self._session:
            try:
                u_stmt = select(User).where(User.id == user_id)
                user_obj = (await self._session.execute(u_stmt)).scalar_one_or_none()
                if user_obj and user_obj.timezone:
                    user_tz_str = user_obj.timezone
            except Exception:
                pass

        user_tz = self._get_user_timezone(user_tz_str)
        today, yesterday, now_utc = self._get_today_and_yesterday(user_tz)

        # 2. Check if user already had a qualifying activity today
        already_active_today = False
        active_dates: Set[date] = set()

        if self._session:
            try:
                check_stmt = (
                    select(LearningActivity.activity_date)
                    .where(LearningActivity.user_id == user_id)
                    .distinct()
                )
                res = await self._session.execute(check_stmt)
                active_dates = {row[0] for row in res.all()}
                already_active_today = today in active_dates
            except Exception:
                pass

        file_data = self._read_data_file()
        if not already_active_today:
            user_acts = file_data.get("activities", {}).get(str(user_id), [])
            for a in user_acts:
                if a.get("activity_date") == today.isoformat():
                    already_active_today = True
                    break

        # 3. Create learning activity record
        activity_id = uuid.uuid4()
        new_activity_model = None

        if self._session:
            try:
                new_activity_model = LearningActivity(
                    id=activity_id,
                    user_id=user_id,
                    activity_type=payload.activity_type,
                    activity_date=today,
                    user_timezone=user_tz_str,
                    course_id=payload.course_id,
                    lesson_id=payload.lesson_id,
                    quiz_id=payload.quiz_id,
                    score=payload.score,
                    details=payload.details,
                    created_at=now_utc,
                )
                self._session.add(new_activity_model)
            except Exception as e:
                logger.warning("failed_to_add_activity_db", error=str(e))

        # Always append to JSON store as resilient backup
        act_dict = {
            "id": str(activity_id),
            "user_id": str(user_id),
            "activity_type": payload.activity_type,
            "activity_date": today.isoformat(),
            "created_at": now_utc.isoformat(),
            "course_id": payload.course_id,
            "lesson_id": payload.lesson_id,
            "quiz_id": payload.quiz_id,
            "score": payload.score,
        }
        if str(user_id) not in file_data.setdefault("activities", {}):
            file_data["activities"][str(user_id)] = []
        file_data["activities"][str(user_id)].append(act_dict)

        # 4. Advance streak
        user_info = file_data.setdefault("users", {}).setdefault(str(user_id), {})
        current_streak = user_info.get("streakDays", 0)
        longest_streak = user_info.get("longestStreak", current_streak)
        raw_last = user_info.get("lastActiveDate")
        last_date = datetime.strptime(raw_last, "%Y-%m-%d").date() if raw_last else None

        new_milestone_reached: Optional[int] = None
        message = ""

        if already_active_today:
            # Same day activity: log verified lesson/quiz, but do not increment streak again
            message = "Learning activity verified and recorded! Streak already maintained for today."
        else:
            # First qualifying activity of today!
            if last_date == yesterday:
                # Consecutive day: advance streak by 1
                current_streak += 1
                message = f"Streak increased! You've reached a {current_streak}-day streak."
            else:
                # First activity ever or gap of >= 2 days: restart streak at 1
                current_streak = 1
                message = "Daily streak started! 1 day recorded."

            longest_streak = max(longest_streak, current_streak)
            last_date = today

            # Check milestone celebration
            if current_streak in MILESTONES:
                new_milestone_reached = current_streak
                message = f"Incredible milestone reached: {current_streak}-Day Streak!"

            # Update JSON state
            user_info["streakDays"] = current_streak
            user_info["longestStreak"] = longest_streak
            user_info["lastActiveDate"] = today.isoformat()
            user_info["totalActiveDays"] = user_info.get("totalActiveDays", 0) + 1

        self._write_data_file(file_data)

        # Update database StudentProfile if available
        if self._session:
            try:
                prof_stmt = select(StudentProfile).where(StudentProfile.user_id == user_id)
                prof = (await self._session.execute(prof_stmt)).scalar_one_or_none()
                if prof:
                    prof.streak_days = current_streak
                    prof.longest_streak = longest_streak
                    prof.last_activity_date = last_date
                    if not already_active_today:
                        prof.total_active_days = getattr(prof, "total_active_days", 0) + 1
                    await self._session.flush()
                await self._session.commit()
            except Exception as e:
                logger.warning("failed_to_update_profile_db", error=str(e))
                await self._session.rollback()

        # Build refreshed streak info
        streak_info = await self.get_streak(user_id, timezone_override=user_tz_str)
        streak_info.new_milestone_achieved = new_milestone_reached

        return StreakRecordResult(
            success=True,
            streak=streak_info,
            activity=LearningActivityResponse(
                id=str(activity_id),
                user_id=str(user_id),
                activity_type=payload.activity_type,
                activity_date=today.isoformat(),
                created_at=now_utc.isoformat(),
                course_id=payload.course_id,
                lesson_id=payload.lesson_id,
                quiz_id=payload.quiz_id,
                score=payload.score,
            ),
            message=message,
            new_milestone_reached=new_milestone_reached,
        )

    # ─────────────────────────────────────────────────────────────────────────
    # Public API: Get Calendar Activity History
    # ─────────────────────────────────────────────────────────────────────────
    async def get_history(self, user_id: UUID, days: int = 30) -> StreakHistoryResponse:
        """Fetch chronological learning activity aggregated by calendar date."""
        streak = await self.get_streak(user_id)
        user_tz = self._get_user_timezone(streak.user_timezone)
        today, _, _ = self._get_today_and_yesterday(user_tz)
        start_date = today - timedelta(days=days)

        day_map: Dict[str, Dict[str, Any]] = {}
        for i in range(days + 1):
            d_str = (start_date + timedelta(days=i)).isoformat()
            day_map[d_str] = {"count": 0, "types": set()}

        # 1. Read from DB if available
        if self._session:
            try:
                stmt = (
                    select(LearningActivity)
                    .where(
                        LearningActivity.user_id == user_id,
                        LearningActivity.activity_date >= start_date,
                    )
                    .order_by(LearningActivity.activity_date.asc())
                )
                res = await self._session.execute(stmt)
                for act in res.scalars().all():
                    d_str = act.activity_date.isoformat()
                    if d_str in day_map:
                        day_map[d_str]["count"] += 1
                        day_map[d_str]["types"].add(act.activity_type)
            except Exception:
                pass

        # 2. Read from JSON file
        file_data = self._read_data_file()
        user_acts = file_data.get("activities", {}).get(str(user_id), [])
        for a in user_acts:
            d_str = a.get("activity_date")
            if d_str and d_str in day_map:
                day_map[d_str]["count"] += 1
                day_map[d_str]["types"].add(a.get("activity_type", "lesson_completion"))

        history: List[StreakDayHistory] = [
            StreakDayHistory(
                date=k,
                activity_count=v["count"],
                activity_types=sorted(list(v["types"])),
            )
            for k, v in sorted(day_map.items())
        ]

        return StreakHistoryResponse(
            history=history,
            total_active_days=streak.total_active_days,
            longest_streak=streak.longest_streak,
            current_streak=streak.current_streak,
        )
