alter table rsvp_submissions
  add column if not exists plus_one boolean not null default false;
