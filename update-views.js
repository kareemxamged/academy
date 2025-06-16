// سكريبت لتحديث المشاهدات بقيم وهمية عالية
// Script to update view counts with high fake data

import { createClient } from '@supabase/supabase-js';

// إعدادات Supabase
const supabaseUrl = 'https://kzixgswpocyykczxwrli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aXhnc3dwb2N5eWtjenh3cmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjUwNTgsImV4cCI6MjA2NTYwMTA1OH0.3pmP_NEB0RRfYQti3rIg9JST4XWXpl9OOihhZqgOWlY';

// إنشاء عميل Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateViewCounts() {
  try {
    console.log('🔄 بدء تحديث المشاهدات...');
    
    // جلب جميع التقنيات
    const { data: techniques, error: fetchError } = await supabase
      .from('drawing_techniques')
      .select('id, title, view_count');

    if (fetchError) {
      console.error('❌ خطأ في جلب التقنيات:', fetchError);
      return;
    }

    if (!techniques || techniques.length === 0) {
      console.log('⚠️ لا توجد تقنيات لتحديث المشاهدات');
      return;
    }

    console.log(`📊 تم العثور على ${techniques.length} تقنية`);

    // تحديث كل تقنية بعدد مشاهدات وهمي عالي
    for (const technique of techniques) {
      // توليد رقم عشوائي بين 100 و 500
      const fakeViewCount = Math.floor(Math.random() * 401) + 100;
      
      const { error } = await supabase
        .from('drawing_techniques')
        .update({
          view_count: fakeViewCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', technique.id);

      if (error) {
        console.error(`❌ خطأ في تحديث التقنية "${technique.title}":`, error);
      } else {
        console.log(`✅ تم تحديث "${technique.title}" - المشاهدات: ${technique.view_count} → ${fakeViewCount}`);
      }
    }

    console.log('🎉 تم الانتهاء من تحديث جميع المشاهدات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ عام في تحديث المشاهدات:', error);
  }
}

// تشغيل السكريبت
updateViewCounts();
