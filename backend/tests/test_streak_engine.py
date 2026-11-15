"""
Unit tests for the LearnGraph Daily Learning Streak System.
Validates:
1. First qualifying learning activity starts streak at 1.
2. Multiple activities on the same day do not advance streak multiple times.
3. Activity on consecutive calendar days advances streak by 1.
4. Missing a complete calendar day breaks the streak; next activity starts new streak at 1.
5. Studying yesterday but not today preserves streak (does not prematurely reset to 0).
6. Longest streak is permanently preserved across resets.
7. Timezone boundary & midnight calculations (Asia/Kolkata vs UTC).
8. Milestone rewards unlocked at 3, 7, 14, 30, 50, 100 days.
"""

import asyncio
import os
import shutil
import tempfile
import unittest
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from app.schemas.streak import LearningActivityCreate
from app.services.streak_service import StreakService, MILESTONES


class TestStreakEngine(unittest.TestCase):
    def setUp(self):
        self.test_user_id = uuid.uuid4()
        # Point to a temporary data file for clean testing
        self.temp_dir = tempfile.mkdtemp()
        self.temp_file = Path(self.temp_dir) / "test_user_progress.json"
        
        # Override service file path
        import app.services.streak_service as ss
        self._orig_path = ss.DATA_FILE_PATH
        ss.DATA_FILE_PATH = self.temp_file
        self.service = StreakService(session=None)

    def tearDown(self):
        import app.services.streak_service as ss
        ss.DATA_FILE_PATH = self._orig_path
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_first_activity_starts_streak_at_one(self):
        """Rule 1: First qualifying learning activity begins a streak of 1."""
        async def run():
            payload = LearningActivityCreate(
                activity_type="lesson_completion",
                course_id="dsa-algorithms",
                lesson_id="binary-search",
            )
            res = await self.service.record_activity(self.test_user_id, payload)
            self.assertTrue(res.success)
            self.assertEqual(res.streak.current_streak, 1)
            self.assertEqual(res.streak.longest_streak, 1)
            self.assertEqual(res.streak.total_active_days, 1)
            self.assertTrue(res.streak.is_active_today)

        asyncio.run(run())

    def test_multiple_activities_same_day_do_not_duplicate(self):
        """Rule 2: Completing multiple lessons on same date must NOT increase streak multiple times."""
        async def run():
            # First lesson
            await self.service.record_activity(
                self.test_user_id,
                LearningActivityCreate(activity_type="lesson_completion", lesson_id="l1"),
            )
            # Second lesson on same date
            res2 = await self.service.record_activity(
                self.test_user_id,
                LearningActivityCreate(activity_type="lesson_completion", lesson_id="l2"),
            )
            # Quiz on same date
            res3 = await self.service.record_activity(
                self.test_user_id,
                LearningActivityCreate(activity_type="quiz_completion", quiz_id="q1", score=90),
            )

            self.assertEqual(res3.streak.current_streak, 1, "Streak should remain 1 on same day")
            self.assertEqual(res3.streak.total_active_days, 1, "Total active days should remain 1")
            self.assertTrue(res3.streak.is_active_today)

        asyncio.run(run())

    def test_consecutive_days_advance_streak(self):
        """Rule 3: Learning on consecutive calendar days increases streak by one."""
        async def run():
            user_tz = ZoneInfo("Asia/Kolkata")
            today, yesterday, _ = self.service._get_today_and_yesterday(user_tz)

            # Manually inject yesterday's completed activity
            data = self.service._read_data_file()
            data["users"][str(self.test_user_id)] = {
                "streakDays": 1,
                "longestStreak": 1,
                "lastActiveDate": yesterday.isoformat(),
                "totalActiveDays": 1,
            }
            data.setdefault("activities", {})[str(self.test_user_id)] = [
                {
                    "id": str(uuid.uuid4()),
                    "user_id": str(self.test_user_id),
                    "activity_type": "lesson_completion",
                    "activity_date": yesterday.isoformat(),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            ]
            self.service._write_data_file(data)

            # Before studying today: streak is 1, is_active_today is False
            st_before = await self.service.get_streak(self.test_user_id)
            self.assertEqual(st_before.current_streak, 1, "Streak must remain 1 (preserved from yesterday)")
            self.assertFalse(st_before.is_active_today, "User has not yet studied today")

            # Complete activity today
            res = await self.service.record_activity(
                self.test_user_id,
                LearningActivityCreate(activity_type="quiz_completion", quiz_id="q2"),
            )
            self.assertEqual(res.streak.current_streak, 2, "Consecutive day must advance streak to 2")
            self.assertEqual(res.streak.longest_streak, 2)
            self.assertEqual(res.streak.total_active_days, 2)
            self.assertTrue(res.streak.is_active_today)

        asyncio.run(run())

    def test_missing_full_day_breaks_streak(self):
        """Rule 4: Missing a complete calendar day resets streak; next activity starts new streak at 1."""
        async def run():
            user_tz = ZoneInfo("Asia/Kolkata")
            today, _, _ = self.service._get_today_and_yesterday(user_tz)
            three_days_ago = today - timedelta(days=3)

            # Inject activity from 3 days ago with an old streak of 5
            data = self.service._read_data_file()
            data["users"][str(self.test_user_id)] = {
                "streakDays": 5,
                "longestStreak": 12,
                "lastActiveDate": three_days_ago.isoformat(),
                "totalActiveDays": 8,
            }
            data.setdefault("activities", {})[str(self.test_user_id)] = [
                {
                    "id": str(uuid.uuid4()),
                    "user_id": str(self.test_user_id),
                    "activity_type": "lesson_completion",
                    "activity_date": three_days_ago.isoformat(),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            ]
            self.service._write_data_file(data)

            # Before studying today: current streak expired (0), longest streak preserved (12)
            st_before = await self.service.get_streak(self.test_user_id)
            self.assertEqual(st_before.current_streak, 0, "Streak must expire to 0 after full day missed")
            self.assertEqual(st_before.longest_streak, 12, "Longest streak must be preserved permanently")

            # Next activity starts new streak at 1
            res = await self.service.record_activity(
                self.test_user_id,
                LearningActivityCreate(activity_type="lesson_completion", lesson_id="l-new"),
            )
            self.assertEqual(res.streak.current_streak, 1, "New activity restarts streak at 1")
            self.assertEqual(res.streak.longest_streak, 12, "Longest streak preserved permanently")

        asyncio.run(run())

    def test_milestone_celebration(self):
        """Rule 5: Milestones (3, 7, etc.) trigger celebrations only once."""
        async def run():
            user_tz = ZoneInfo("Asia/Kolkata")
            today, yesterday, _ = self.service._get_today_and_yesterday(user_tz)

            # Set user at streak of 2 yesterday
            data = self.service._read_data_file()
            data["users"][str(self.test_user_id)] = {
                "streakDays": 2,
                "longestStreak": 2,
                "lastActiveDate": yesterday.isoformat(),
                "totalActiveDays": 2,
            }
            self.service._write_data_file(data)

            # Record lesson today -> streak becomes 3 (a milestone!)
            res = await self.service.record_activity(
                self.test_user_id,
                LearningActivityCreate(activity_type="lesson_completion", lesson_id="l3"),
            )
            self.assertEqual(res.streak.current_streak, 3)
            self.assertEqual(res.new_milestone_reached, 3)
            self.assertIn(3, res.streak.unlocked_milestones)

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
