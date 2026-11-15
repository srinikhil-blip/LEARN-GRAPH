/**
 * test_streak_engine.mjs
 * Comprehensive test harness verifying all required daily streak rules.
 */

import assert from "node:assert";

// Simulation of core timezone date functions
function getLocalCalendarDate(tz = "Asia/Kolkata", baseDate = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(baseDate);
}

function getYesterdayCalendarDate(todayStr) {
  const parts = todayStr.split("-").map(Number);
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

class MockStreakTracker {
  constructor(timezone = "Asia/Kolkata") {
    this.timezone = timezone;
    this.streakDays = 0;
    this.longestStreak = 0;
    this.totalActiveDays = 0;
    this.lastActiveDate = null;
    this.dailyActivities = [];
    this.celebratedMilestones = [];
  }

  recordActivity(activityType, dateOverride = null) {
    const today = dateOverride || getLocalCalendarDate(this.timezone);
    const yesterday = getYesterdayCalendarDate(today);

    const alreadyActiveToday =
      this.dailyActivities.some((a) => a.date === today) || this.lastActiveDate === today;

    this.dailyActivities.push({
      type: activityType,
      date: today,
      timestamp: new Date().toISOString(),
    });

    let newMilestone = null;

    if (alreadyActiveToday) {
      // Rule 4: Multiple completions on same day do not increase streak
      return {
        streakDays: this.streakDays,
        isNewStreakDay: false,
        newMilestone: null,
      };
    }

    // Rule 5: Consecutive calendar days increase streak by 1
    if (this.lastActiveDate === yesterday) {
      this.streakDays += 1;
    } else {
      // Rule 7: Missing a complete calendar day breaks streak; restarts at 1
      this.streakDays = 1;
    }

    this.lastActiveDate = today;
    this.totalActiveDays += 1;
    // Rule 8: Longest streak preserved permanently
    this.longestStreak = Math.max(this.longestStreak, this.streakDays);

    const MILESTONES = [3, 7, 14, 30, 50, 100];
    if (
      MILESTONES.includes(this.streakDays) &&
      !this.celebratedMilestones.includes(this.streakDays)
    ) {
      newMilestone = this.streakDays;
      this.celebratedMilestones.push(this.streakDays);
    }

    return {
      streakDays: this.streakDays,
      isNewStreakDay: true,
      newMilestone,
    };
  }

  getStreakInfo(currentDateOverride = null) {
    const today = currentDateOverride || getLocalCalendarDate(this.timezone);
    const yesterday = getYesterdayCalendarDate(today);

    const is_active_today =
      this.lastActiveDate === today || this.dailyActivities.some((a) => a.date === today);

    let current = this.streakDays;
    if (!this.lastActiveDate) {
      current = 0;
    } else if (is_active_today) {
      current = this.streakDays;
    } else if (this.lastActiveDate === yesterday) {
      // User studied yesterday but not today: streak preserved!
      current = this.streakDays;
    } else {
      // Missed full day
      current = 0;
    }

    return {
      current_streak: current,
      longest_streak: this.longestStreak,
      total_active_days: this.totalActiveDays,
      is_active_today,
    };
  }
}

console.log("=== RUNNING LEARNGRAPH DAILY STREAK ENGINE TESTS ===\n");

// TEST 1: First learning activity starts streak at 1
{
  const tracker = new MockStreakTracker();
  const res = tracker.recordActivity("lesson_completion", "2026-11-10");
  assert.strictEqual(res.streakDays, 1, "First activity must result in streak 1");
  assert.strictEqual(tracker.longestStreak, 1, "Longest streak must be 1");
  assert.strictEqual(tracker.totalActiveDays, 1, "Total active days must be 1");
  console.log("✓ TEST 1 PASSED: First activity starts streak at 1.");
}

// TEST 2: Multiple activities on same date do NOT increase streak multiple times
{
  const tracker = new MockStreakTracker();
  tracker.recordActivity("lesson_completion", "2026-11-10");
  const res2 = tracker.recordActivity("lesson_completion", "2026-11-10");
  const res3 = tracker.recordActivity("quiz_completion", "2026-11-10");
  assert.strictEqual(res2.isNewStreakDay, false);
  assert.strictEqual(res3.streakDays, 1, "Multiple activities on same day must keep streak at 1");
  assert.strictEqual(tracker.totalActiveDays, 1, "Total active days must stay 1 for same date");
  console.log("✓ TEST 2 PASSED: Multiple activities on same date do NOT duplicate streak.");
}

// TEST 3: Consecutive calendar days advance streak by 1
{
  const tracker = new MockStreakTracker();
  tracker.recordActivity("lesson_completion", "2026-11-10");
  const d2 = tracker.recordActivity("lesson_completion", "2026-11-11");
  const d3 = tracker.recordActivity("quiz_completion", "2026-11-12");
  assert.strictEqual(d2.streakDays, 2, "Consecutive day 2 must be 2");
  assert.strictEqual(d3.streakDays, 3, "Consecutive day 3 must be 3");
  assert.strictEqual(d3.newMilestone, 3, "Must trigger 3-day milestone celebration");
  assert.strictEqual(tracker.longestStreak, 3);
  console.log("✓ TEST 3 PASSED: Consecutive days advance streak by 1 & unlock milestones.");
}

// TEST 4: Missing one full day breaks streak; next activity starts new streak at 1
{
  const tracker = new MockStreakTracker();
  tracker.recordActivity("lesson_completion", "2026-11-10");
  tracker.recordActivity("lesson_completion", "2026-11-11"); // streak = 2
  // 2026-11-12 was completely missed!
  // User returns on 2026-11-13
  const dRet = tracker.recordActivity("lesson_completion", "2026-11-13");
  assert.strictEqual(dRet.streakDays, 1, "Returning after missed day must restart streak at 1");
  assert.strictEqual(tracker.longestStreak, 2, "Longest streak of 2 must be preserved");
  assert.strictEqual(tracker.totalActiveDays, 3, "Total active days count must be 3");
  console.log("✓ TEST 4 PASSED: Missing a full day breaks streak; next activity restarts at 1.");
}

// TEST 5: User studies yesterday but not today: streak remains preserved during today
{
  const tracker = new MockStreakTracker();
  tracker.recordActivity("lesson_completion", "2026-11-10");
  tracker.recordActivity("lesson_completion", "2026-11-11");
  tracker.recordActivity("lesson_completion", "2026-11-12"); // streak = 3

  // Current time is 2026-11-13, user has NOT studied today yet
  const status = tracker.getStreakInfo("2026-11-13");
  assert.strictEqual(status.current_streak, 3, "Streak must remain 3 during today");
  assert.strictEqual(status.is_active_today, false, "Must indicate pending activity for today");
  console.log("✓ TEST 5 PASSED: Studying yesterday preserves streak during today without premature reset.");
}

// TEST 6: Timezone boundaries (Asia/Kolkata UTC+5:30)
{
  // Test midnight rollover in Asia/Kolkata
  // 18:30 UTC on Nov 14 is 00:00 (Midnight) on Nov 15 in Asia/Kolkata
  const midnightUtc = new Date("2026-11-14T18:35:00Z");
  const localDate = getLocalCalendarDate("Asia/Kolkata", midnightUtc);
  assert.strictEqual(localDate, "2026-11-15", "Midnight boundary must correctly shift date in Asia/Kolkata");
  console.log("✓ TEST 6 PASSED: Timezone and midnight boundary calculations correct.");
}

// TEST 7: Milestones celebrated only once
{
  const tracker = new MockStreakTracker();
  tracker.recordActivity("lesson_completion", "2026-11-01");
  tracker.recordActivity("lesson_completion", "2026-11-02");
  const m3 = tracker.recordActivity("lesson_completion", "2026-11-03");
  assert.strictEqual(m3.newMilestone, 3);

  // Additional activity on day 3
  const m3Again = tracker.recordActivity("quiz_completion", "2026-11-03");
  assert.strictEqual(m3Again.newMilestone, null, "Milestone must not re-trigger on same day");

  // Day 4
  const m4 = tracker.recordActivity("lesson_completion", "2026-11-04");
  assert.strictEqual(m4.newMilestone, null, "Day 4 is not a milestone");
  console.log("✓ TEST 7 PASSED: Milestone celebrations trigger only once.");
}

console.log("\nALL 7 STREAK SYSTEM UNIT TESTS PASSED SUCCESSFULLY! 🎉\n");
