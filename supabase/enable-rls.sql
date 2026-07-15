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

-- 1 + 2: RLS + מדיניות "מחובר בלבד" לכל הטבלאות
do $$
declare
  t text;
  tables text[] := array[
    'patients','appointments','tasks','payments','institutions','classes',
    'notes','observations','treatment_goals','questionnaires','patient_files',
    'patient_emails','user_profiles','user_patients','user_institutions','app_settings'
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
