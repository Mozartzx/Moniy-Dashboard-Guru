-- Teachers generate story modules from the dashboard. Content tables stay read-only for clients;
-- this function is the single write path: teacher-only, module + scenarios in one transaction.
create or replace function public.create_ai_module(p_topic_id integer, p_title text, p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id integer;
begin
  if not exists (
    select 1 from public.users
    where lower(email) = lower(auth.jwt() ->> 'email') and role = 'teacher'
  ) then
    raise exception 'Hanya guru yang boleh membuat modul' using errcode = '42501';
  end if;

  insert into public.modules (topic_id, title, genre, lessons, duration, is_new, image_url)
  values (p_topic_id, left(p_title, 250), 'AI Generated', 7, '25 Menit', true, 'asset:card.png')
  returning id into v_id;

  insert into public.game_scenarios (module_id, result_title, story_text, decision_text, options, correct_option, warning_text)
  select v_id, r.result_title, r.story_text, r.decision_text, r.options, r.correct_option, r.warning_text
  from jsonb_to_recordset(p_rows) as r(
    result_title text, story_text text, decision_text text, options jsonb, correct_option integer, warning_text text
  );

  return v_id;
end;
$$;

revoke all on function public.create_ai_module(integer, text, jsonb) from public, anon;
grant execute on function public.create_ai_module(integer, text, jsonb) to authenticated;
