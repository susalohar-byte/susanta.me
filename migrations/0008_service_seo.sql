-- English Google description for each service (the card summary can be Bengali).
ALTER TABLE services ADD COLUMN seo_description TEXT NOT NULL DEFAULT '';
UPDATE services SET seo_description = 'Lead generation for local businesses in Purulia and West Bengal: landing pages, offers and ads that bring real enquiries every day, with every lead tracked.' WHERE slug = 'lead-generation' AND seo_description = '';
UPDATE services SET seo_description = 'WhatsApp Business automation for local businesses: 24/7 auto-replies, menus, bookings and follow-ups so no customer enquiry is missed.' WHERE slug = 'whatsapp' AND seo_description = '';
UPDATE services SET seo_description = 'Local business promotion in Purulia and West Bengal: offers, posters, social media creatives and local influencer collaborations that bring more walk-ins and enquiries.' WHERE slug = 'local-business-promotion' AND seo_description = '';
UPDATE services SET seo_description = 'Fast, mobile-first websites for local businesses that load in under 1.5 seconds and turn visitors into calls and WhatsApp enquiries.' WHERE slug = 'web-dev' AND seo_description = '';
UPDATE services SET seo_description = 'Facebook and Instagram ads for local businesses in Purulia and West Bengal, targeted to customers within 5–15 km, with creatives, tracking and weekly optimisation.' WHERE slug = 'meta-ads' AND seo_description = '';
