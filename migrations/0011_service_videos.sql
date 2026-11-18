-- Sample videos on service pages (JSON list of { title, url, poster }), editable in /admin.
ALTER TABLE services ADD COLUMN videos TEXT NOT NULL DEFAULT '[]';
UPDATE services SET videos = '[{"title":"Nokia kaise haar gaya? — 1-min Hindi explainer Reel","url":"/assets/videos/nokia-kaise-haar-gaya.mp4","poster":"/assets/videos/nokia-kaise-haar-gaya.jpg"}]' WHERE slug = 'ai-video';
