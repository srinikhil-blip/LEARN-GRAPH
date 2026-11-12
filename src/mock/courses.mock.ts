import type { Course } from "@/types/course";
import catalogJson from "@/data/generatedCurriculumCatalog.json";

/**
 * Production Course Library Catalog (69+ comprehensive courses across all 5 tiers)
 * Generated dynamically from scripts/build_curriculum_catalog.js
 */
export const MOCK_COURSES: Course[] = (catalogJson as any).courses ?? [];
