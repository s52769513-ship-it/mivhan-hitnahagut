-- ============================================================================
-- הפעלת Row Level Security (RLS) עבור מכון התנהגות
-- ----------------------------------------------------------------------------
-- מריצים קובץ זה פעם אחת ב-Supabase: Dashboard → SQL Editor → New query →
-- מדביקים את כל התוכן → Run.
--
-- מה הקובץ עושה:
--   1. מפעיל RLS על כל הטבלאות בסכימה public (סוגר את "rls_disabled_in_public").
--   2. מוסיף מדיניות: רק משתמש מחובר (authenticated) רשאי לקרוא/לכתוב.
--      גישה אנונימית (anon) — מי שיש לו רק את כתובת ה-URL — נחסמת לחלוטין.
--   3. מוסיף מדיניות אחסון (Storage) כדי שהעלאת/מחיקת מסמכים תמשיך לעבוד
--      אחרי שהוסר מפתח ה-service_role מצד הלקוח.
--
-- ההרצה בטוחה וניתנת להרצה חוזרת (idempotent).
-- אם משהו משתבש אפשר לכבות RLS זמנית: alter table public.<שם> disable row level security;
-- ============================================================================

-- ============================================================================
-- טבלות חדשות לשיתוף פעילויות
-- ============================================================================

-- טבלת patient_collaborators - עבור שיתוף בין מדריך וטיפול
CREATE TABLE IF NOT EXISTS public.patient_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id, user_id)
);

-- טבלת activity_log - עבור מעקב פעילויות
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'note', 'file', 'update', etc.
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

-- טבלת saved_graphs - לשמירת הגדרות גרפים
CREATE TABLE IF NOT EXISTS public.saved_graphs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  graph_type VARCHAR(50) NOT NULL, -- 'revenue', 'attendance', 'distribution', etc.
  filters JSONB, -- filters like process_stage, date_range, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1 + 2: RLS + מדיניות "מחובר בלבד" לכל הטבלאות
do $$
declare
  t text;
  tables text[] := array[
    'patients','appointments','tasks','payments','institutions','classes',
    'notes','observations','treatment_goals','questionnaires','patient_files',
    'patient_emails','user_profiles','user_patients','user_institutions','app_settings',
    'patient_collaborators','activity_log','saved_graphs'
  ];
begin
  foreach t in array tables loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security;', t);
      execute format('drop policy if exists authenticated_all on public.%I;', t);
      execute format(
        'create policy authenticated_all on public.%I for all to authenticated using (true) with check (true);',
        t
      );
    end if;
  end loop;
end $$;

-- 3: מדיניות אחסון עבור ה-bucket של המסמכים (patient-files)
--    מאפשרת למשתמשים מחוברים להעלות/לצפות/לעדכן/למחוק קבצים ב-bucket זה.
drop policy if exists "patient_files_auth_select" on storage.objects;
create policy "patient_files_auth_select" on storage.objects
  for select to authenticated using (bucket_id = 'patient-files');

drop policy if exists "patient_files_auth_insert" on storage.objects;
create policy "patient_files_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'patient-files');

drop policy if exists "patient_files_auth_update" on storage.objects;
create policy "patient_files_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'patient-files') with check (bucket_id = 'patient-files');

drop policy if exists "patient_files_auth_delete" on storage.objects;
create policy "patient_files_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'patient-files');

-- ============================================================================
-- בדיקה: לאחר ההרצה, השאילתה הבאה צריכה להחזיר rowsecurity = true לכל הטבלאות.
--   select tablename, rowsecurity from pg_tables where schemaname = 'public';
-- ============================================================================
