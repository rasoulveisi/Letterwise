-- Run in Supabase SQL editor or through Supabase CLI.

create table if not exists public.curriculum_units (
  id text primary key,
  script_id text not null,
  title text not null,
  description text not null default '',
  order_index integer not null default 0
);

create table if not exists public.curriculum_lessons (
  id text primary key,
  unit_id text not null references public.curriculum_units(id) on delete cascade,
  title text not null,
  order_index integer not null default 0,
  exercises_json jsonb not null default '[]'::jsonb
);

alter table public.curriculum_units enable row level security;
alter table public.curriculum_lessons enable row level security;

create policy "curriculum_units_read_all"
  on public.curriculum_units for select
  using (true);

create policy "curriculum_lessons_read_all"
  on public.curriculum_lessons for select
  using (true);

alter table public.user_script_progress
  add column if not exists completed_lessons jsonb not null default '[]'::jsonb,
  add column if not exists xp integer not null default 0,
  add column if not exists hearts integer not null default 5,
  add column if not exists streak_count integer not null default 0;

-- Seed Units
insert into public.curriculum_units (id, script_id, title, description, order_index)
values
  ('hy-u1', 'hy', 'Unit 1: First Words & Vowels', 'Master foundational vowels and consonants to read your first words.', 1),
  ('hy-u2', 'hy', 'Unit 2: Identity & Basic Verbs', 'Learn Է, Մ, Կ, Ր, Լ and form simple sentences.', 2),
  ('hy-u3', 'hy', 'Unit 3: Cognates & Loan Words', 'Learn Օ/Ո, Պ, Բ, Ֆ and read familiar loan words.', 3),
  ('hy-u4', 'hy', 'Unit 4: Deceptive Look-alikes', 'Disambiguate look-alikes like Հ vs Ն and Տ vs S.', 4)
on conflict (id) do update set
  script_id = excluded.script_id,
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index;

-- Seed Unit 1 Lessons
insert into public.curriculum_lessons (id, unit_id, title, order_index, exercises_json)
values
  (
    'hy-u1-l1',
    'hy-u1',
    'Vowels: Ա, Ե, Ի',
    1,
    '[
      {"id": "ex-1", "type": "LETTER_PAIR", "prompt": "Match uppercase and lowercase", "target": "Ա", "options": ["ա", "ե", "ի", "տ"], "correctAnswer": "ա"},
      {"id": "ex-2", "type": "LETTER_PAIR", "prompt": "Match uppercase and lowercase", "target": "Ե", "options": ["ե", "ա", "ի", "ն"], "correctAnswer": "ե"},
      {"id": "ex-3", "type": "LETTER_PAIR", "prompt": "Match uppercase and lowercase", "target": "Ի", "options": ["ի", "ե", "ս", "ա"], "correctAnswer": "ի"},
      {"id": "ex-4", "type": "PHONETIC_SELECT", "prompt": "Which letter makes the sound \"a\"?", "soundHint": "a", "options": ["Ա", "Ե", "Ի", "Ս"], "correctAnswer": "Ա"},
      {"id": "ex-5", "type": "PHONETIC_SELECT", "prompt": "Which letter makes the sound \"e\" / \"ye\"?", "soundHint": "e / ye", "options": ["Ե", "Ա", "Ի", "Տ"], "correctAnswer": "Ե"},
      {"id": "ex-6", "type": "PHONETIC_SELECT", "prompt": "Which letter makes the sound \"i\"?", "soundHint": "i", "options": ["Ի", "Ե", "Ա", "Ն"], "correctAnswer": "Ի"}
    ]'::jsonb
  ),
  (
    'hy-u1-l2',
    'hy-u1',
    'Consonants: Ս, Տ, Ն',
    2,
    '[
      {"id": "ex-7", "type": "LETTER_PAIR", "prompt": "Match uppercase and lowercase", "target": "Ս", "options": ["ս", "տ", "ն", "ա"], "correctAnswer": "ս"},
      {"id": "ex-8", "type": "LETTER_PAIR", "prompt": "Match uppercase and lowercase", "target": "Տ", "options": ["տ", "ս", "ն", "ե"], "correctAnswer": "տ"},
      {"id": "ex-9", "type": "LETTER_PAIR", "prompt": "Match uppercase and lowercase", "target": "Ն", "options": ["ն", "տ", "ս", "ի"], "correctAnswer": "ն"},
      {"id": "ex-10", "type": "PHONETIC_SELECT", "prompt": "Which letter makes the sound \"s\"?", "soundHint": "s", "options": ["Ս", "Տ", "Ն", "Ա"], "correctAnswer": "Ս"},
      {"id": "ex-11", "type": "PHONETIC_SELECT", "prompt": "Which letter makes the sound \"t\"?", "soundHint": "t", "options": ["Տ", "Ս", "Ն", "Ե"], "correctAnswer": "Տ"},
      {"id": "ex-12", "type": "PHONETIC_SELECT", "prompt": "Which letter makes the sound \"n\"?", "soundHint": "n", "options": ["Ն", "Տ", "Ս", "Ի"], "correctAnswer": "Ն"}
    ]'::jsonb
  ),
  (
    'hy-u1-l3',
    'hy-u1',
    'First Words: ես, նա, սա',
    3,
    '[
      {"id": "ex-13", "type": "DECODE_COGNATE", "prompt": "What does this word mean?", "targetWord": "ես", "pronunciation": "yes", "options": ["I", "you", "he / she", "this"], "correctAnswer": "I"},
      {"id": "ex-14", "type": "WORD_BUILDER", "prompt": "Spell \"I\" in Armenian", "targetWord": "ես", "translation": "I", "tokens": ["ս", "ե", "ա", "տ"], "correctAnswer": ["ե", "ս"]},
      {"id": "ex-15", "type": "DECODE_COGNATE", "prompt": "What does this word mean?", "targetWord": "նա", "pronunciation": "na", "options": ["he / she", "I", "this", "we"], "correctAnswer": "he / she"},
      {"id": "ex-16", "type": "WORD_BUILDER", "prompt": "Spell \"he / she\" in Armenian", "targetWord": "նա", "translation": "he / she", "tokens": ["ն", "ա", "ե", "ս"], "correctAnswer": ["ն", "ա"]},
      {"id": "ex-17", "type": "DECODE_COGNATE", "prompt": "What does this word mean?", "targetWord": "սա", "pronunciation": "sa", "options": ["this", "I", "he / she", "that"], "correctAnswer": "this"},
      {"id": "ex-18", "type": "WORD_BUILDER", "prompt": "Spell \"this\" in Armenian", "targetWord": "սա", "translation": "this", "tokens": ["ս", "ա", "տ", "ի"], "correctAnswer": ["ս", "ա"]}
    ]'::jsonb
  )
on conflict (id) do update set
  unit_id = excluded.unit_id,
  title = excluded.title,
  order_index = excluded.order_index,
  exercises_json = excluded.exercises_json;
