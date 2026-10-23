-- Table for RSVP submissions (what guests fill in themselves)
-- Separate from the official guest list (guests table)
create table if not exists rsvp_submissions (
  id                   uuid primary key default gen_random_uuid(),
  entered_name         text not null,
  rsvp_status          text not null check (rsvp_status in ('confirmed', 'declined')),
  dietary_restrictions text,
  plus_one_name        text,
  plus_one_dietary     text,
  linked_guest_id      uuid references guests(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- RLS: guests can only INSERT, admins (authenticated) can read/update
alter table rsvp_submissions enable row level security;

create policy "Guests can submit RSVP"
  on rsvp_submissions for insert to anon
  with check (true);

create policy "Admins can read all submissions"
  on rsvp_submissions for select to authenticated
  using (true);

create policy "Admins can update submissions"
  on rsvp_submissions for update to authenticated
  using (true);

create policy "Admins can delete submissions"
  on rsvp_submissions for delete to authenticated
  using (true);
