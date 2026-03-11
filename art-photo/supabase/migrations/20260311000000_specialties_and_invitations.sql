CREATE TABLE specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "specialties_select_public" ON specialties
    FOR SELECT USING (TRUE);

CREATE POLICY "specialties_admin_write" ON specialties
    FOR ALL USING (auth_has_role('admin'));

INSERT INTO specialties (name, description) VALUES
    ('تصوير زفاف', 'تصوير حفلات الزفاف والأعراس'),
    ('تصوير بورتريه', 'تصوير شخصي واحترافي'),
    ('تصوير منتجات', 'تصوير منتجات تجارية للمتاجر'),
    ('تصوير مناسبات', 'تصوير المناسبات والفعاليات'),
    ('تصوير أطفال', 'تصوير الأطفال وحديثي الولادة'),
    ('تصوير عقارات', 'تصوير العقارات والمباني'),
    ('تصوير أزياء', 'تصوير الأزياء والموضة'),
    ('تصوير طعام', 'تصوير الأطعمة والمشروبات'),
    ('تصوير طبيعة', 'تصوير المناظر الطبيعية'),
    ('تصوير عام', 'تصوير متنوع وعام');

ALTER TABLE photographers ADD COLUMN IF NOT EXISTS specialty_id UUID REFERENCES specialties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_photographers_specialty ON photographers (specialty_id);

CREATE TABLE photographer_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    specialty_id UUID REFERENCES specialties(id) ON DELETE SET NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE photographer_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations_admin_all" ON photographer_invitations
    FOR ALL USING (auth_has_role('admin'));

CREATE INDEX idx_invitations_token ON photographer_invitations (token);
CREATE INDEX idx_invitations_email ON photographer_invitations (email);
