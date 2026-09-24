import { Injectable, NotFoundException } from '@nestjs/common';
import type { CurriculumResponse } from '@letterwise/progress/contracts';
import { ARMENIAN_CURRICULUM, isKnownScriptId } from '@letterwise/scripts/domain';
import { SupabaseClientFactory } from '../supabase/supabase-client.factory';

interface CurriculumUnitRow {
  id: string;
  script_id: string;
  title: string;
  description: string;
  order_index: number;
}

interface CurriculumLessonRow {
  id: string;
  unit_id: string;
  title: string;
  order_index: number;
  exercises_json: unknown;
}

@Injectable()
export class CurriculumService {
  constructor(private readonly supabaseFactory: SupabaseClientFactory) {}

  async getCurriculum(scriptId: string): Promise<CurriculumResponse> {
    if (!isKnownScriptId(scriptId)) {
      throw new NotFoundException(`Unknown script: ${scriptId}`);
    }

    if (scriptId === 'hy') {
      try {
        const client = this.supabaseFactory.forAnonymous();
        const { data: unitsData, error: unitsError } = await client
          .from('curriculum_units')
          .select('id, script_id, title, description, order_index')
          .eq('script_id', scriptId)
          .order('order_index', { ascending: true });

        if (unitsError || !unitsData || unitsData.length === 0) {
          return { units: ARMENIAN_CURRICULUM as any };
        }

        const unitRows = unitsData as CurriculumUnitRow[];
        const unitIds = unitRows.map((u) => u.id);

        const { data: lessonsData, error: lessonsError } = await client
          .from('curriculum_lessons')
          .select('id, unit_id, title, order_index, exercises_json')
          .in('unit_id', unitIds)
          .order('order_index', { ascending: true });

        if (lessonsError || !lessonsData || lessonsData.length === 0) {
          return { units: ARMENIAN_CURRICULUM as any };
        }

        const lessonRows = lessonsData as CurriculumLessonRow[];
        const lessonsByUnitId = new Map<string, any[]>();
        for (const lesson of lessonRows) {
          const list = lessonsByUnitId.get(lesson.unit_id) ?? [];
          list.push({
            id: lesson.id,
            unitId: lesson.unit_id,
            title: lesson.title,
            orderIndex: lesson.order_index,
            exercises: Array.isArray(lesson.exercises_json) ? lesson.exercises_json : [],
          });
          lessonsByUnitId.set(lesson.unit_id, list);
        }

        const units = unitRows.map((u) => ({
          id: u.id,
          scriptId: u.script_id,
          title: u.title,
          description: u.description ?? '',
          orderIndex: u.order_index,
          lessons: lessonsByUnitId.get(u.id) ?? [],
        }));

        return { units };
      } catch {
        return { units: ARMENIAN_CURRICULUM as any };
      }
    }

    return { units: [] };
  }
}
