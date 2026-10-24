-- How the guest reached the form, and how long the expert run took (null for older rows)
alter table rsvp_submissions
  add column if not exists rsvp_mode text check (rsvp_mode in ('easy', 'hard', 'expert')),
  add column if not exists challenge_ms integer check (challenge_ms >= 0);
