# Sprint S4-3 Review — محرك المتجهات باستخدام Gemini Embeddings

## التاريخ: 2026-03-10

## الهدف
إعداد محرك المتجهات باستخدام Gemini text-embedding-004 وتخزينها في pgvector وإعداد البحث بالتشابه.

## المُنجزات

### Server Actions
- `generateEmbedding(text)` — توليد متجه 1536-dimensional عبر text-embedding-004 REST API
- `generateItemEmbeddings` — توليد متجهات لجميع الخدمات والمنتجات والباقات النشطة (admin only)
- `generateUserEmbedding(userId)` — توليد متجه تفضيلات المستخدم من التقييمات + الحجوزات + المشتريات
- `searchSimilarItems(query)` — بحث بالتشابه عبر match_items_by_embedding RPC

### صفحات الإدارة
- `/admin/embeddings` — صفحة إدارة المتجهات
- `EmbeddingsManager` — زر توليد متجهات العناصر مع عرض النتيجة

## المتطلبات المُغطاة
- **SR4**: دمج تقنيات الذكاء الاصطناعي
- **FR-C7**: محرك التوصيات (الجزء الأول: البنية التحتية)

## القرارات التقنية
- text-embedding-004 مع outputDimensionality: 1536 للتوافق مع pgvector(1536)
- REST API مباشر بدلاً من SDK لأن embedding model غير متاح في generateContent
- نص التمثيل: `{name}. {description}. السعر: {price} ريال` + الفئة للمنتجات
- Upsert مع onConflict: `entity_type,entity_id` لتجنب التكرار
- تمثيل المستخدم يجمع: التقييمات (rating + comment + service + specialty) + الحجوزات (service + package) + المشتريات (product + category)
- جداول pgvector: `user_embeddings` (UNIQUE user_id) + `item_embeddings` (UNIQUE entity_type,entity_id)
- IVFFlat index مع cosine_ops لأداء بحث عالي

## حالة البناء
- TypeScript: 0 أخطاء
- Build: ✅ نجح
