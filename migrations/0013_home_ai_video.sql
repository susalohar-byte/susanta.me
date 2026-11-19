-- Homepage services: show AI Video instead of Websites & Apps (both stay on /services).
UPDATE services SET show_on_home = 0 WHERE slug = 'web-dev';
UPDATE services SET show_on_home = 1 WHERE slug = 'ai-video';
