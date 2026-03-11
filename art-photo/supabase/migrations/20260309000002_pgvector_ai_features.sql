-- ============================================================================
-- Art Photo Studio - pgvector & AI Features Migration
-- ⚠️ يجب تفعيل pgvector من Supabase Dashboard أولاً:
--    Database > Extensions > بحث عن "vector" > Enable
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- متجهات تفضيلات المستخدم (User Preference Embeddings)
CREATE TABLE user_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    embedding extensions.vector(1536),
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- متجهات المنتجات والخدمات (Item Embeddings)
CREATE TABLE item_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    embedding extensions.vector(1536),
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);

-- فهارس pgvector للبحث بالتشابه (Cosine Similarity)
CREATE INDEX idx_user_embeddings ON user_embeddings USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_item_embeddings ON item_embeddings USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);

-- تفعيل RLS
ALTER TABLE user_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_embeddings ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "user_embeddings_select_own" ON user_embeddings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_embeddings_admin_all" ON user_embeddings
    FOR ALL USING (auth_has_role('admin'));

CREATE POLICY "item_embeddings_select_public" ON item_embeddings
    FOR SELECT USING (TRUE);

CREATE POLICY "item_embeddings_admin_write" ON item_embeddings
    FOR ALL USING (auth_has_role('admin'));

-- دالة: جلب التوصيات الذكية بناءً على pgvector (FR-C7, SR4)
CREATE OR REPLACE FUNCTION get_ai_recommendations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_embedding extensions.vector(1536);
    v_results JSONB;
BEGIN
    SELECT embedding INTO v_user_embedding
    FROM user_embeddings
    WHERE user_id = p_user_id;

    IF v_user_embedding IS NULL THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'entity_type', 'product', 'entity_id', p.id,
            'name', p.name, 'price', p.price, 'image', p.cover_image_url
        )), '[]'::JSONB)
        INTO v_results
        FROM products p
        WHERE p.is_active = TRUE
        ORDER BY p.created_at DESC
        LIMIT p_limit;

        RETURN jsonb_build_object('recommendations', v_results, 'source', 'popular');
    END IF;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'entity_type', ie.entity_type,
        'entity_id', ie.entity_id,
        'similarity', 1 - (ie.embedding <=> v_user_embedding),
        'metadata', ie.metadata
    )), '[]'::JSONB)
    INTO v_results
    FROM item_embeddings ie
    ORDER BY ie.embedding <=> v_user_embedding
    LIMIT p_limit;

    RETURN jsonb_build_object('recommendations', v_results, 'source', 'ai_similarity');
END;
$$;
