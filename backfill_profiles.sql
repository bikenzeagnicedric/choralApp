-- BACKFILL SCRIPT
-- Run this if you have existing users who don't have a profile entry yet.

insert into public.profiles (id, full_name, role)
select id, raw_user_meta_data->>'full_name', 'admin' -- Defaulting existing users to admin for safety/ease during dev, change to 'user' if preferred
from auth.users
where id not in (select id from public.profiles);

-- If you want to force your specific email to be admin:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'votre_email@gmail.com');
