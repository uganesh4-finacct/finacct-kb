-- Track 3: POS Systems (Square, Toast, Clover, Tech Stack)
INSERT INTO public.training_tracks (slug, title, description, track_number, order_index, is_published)
VALUES (
  'pos',
  'POS Systems',
  'Square, Toast, Clover, and the restaurant software ecosystem',
  3,
  2,
  true
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    track_number = EXCLUDED.track_number,
    order_index = EXCLUDED.order_index;
