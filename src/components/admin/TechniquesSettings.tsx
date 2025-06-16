import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Eye, EyeOff, Save, X, 
  BookOpen, Clock, Star, Lightbulb
} from 'lucide-react';
import { techniquesService } from '../../lib/supabase';
import type { DrawingTechnique } from '../../types/database';
import ImageUpload from '../ImageUpload';

interface TechniquesSettingsProps {
  // يمكن إضافة خصائص إضافية هنا إذا لزم الأمر
}

const TechniquesSettings: React.FC<TechniquesSettingsProps> = () => {
  const [techniques, setTechniques] = useState<DrawingTechnique[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<DrawingTechnique | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  // نموذج التقنية الجديدة
  const [newTechnique, setNewTechnique] = useState<Partial<DrawingTechnique>>({
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    content: '',
    content_en: '',
    difficulty_level: 'مبتدئ',
    difficulty_level_en: 'Beginner',
    category: 'رسم تقليدي',
    category_en: 'Traditional Drawing',
    tools_needed: [],
    tools_needed_en: [],
    steps: [],
    steps_en: [],
    tips: [],
    tips_en: [],
    image_url: '',
    video_url: '',
    estimated_time: '',
    estimated_time_en: '',
    prerequisites: [],
    prerequisites_en: [],
    featured: false,
    visible: true
  });

  // تحميل البيانات
  useEffect(() => {
    loadData();
  }, []);

  // تحديث المشاهدات بقيم وهمية عالية
  const updateFakeViewCounts = async () => {
    if (!confirm('هل أنت متأكد من تحديث المشاهدات بقيم وهمية عالية لجميع التقنيات؟')) {
      return;
    }

    try {
      const success = await techniquesService.updateViewCountsWithFakeData();
      if (success) {
        alert('تم تحديث المشاهدات بنجاح!');
        await loadData(); // إعادة تحميل البيانات لإظهار التحديثات
      } else {
        alert('فشل في تحديث المشاهدات');
      }
    } catch (error) {
      console.error('خطأ في تحديث المشاهدات:', error);
      alert('حدث خطأ في تحديث المشاهدات');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await techniquesService.getAll();
      setTechniques(data);
    } catch (error) {
      console.error('خطأ في تحميل تقنيات الرسم:', error);
    } finally {
      setLoading(false);
    }
  };

  // إضافة تقنية جديدة
  const handleAdd = async () => {
    if (!newTechnique.title || !newTechnique.content) {
      alert('يرجى ملء العنوان والمحتوى على الأقل');
      return;
    }

    try {
      const result = await techniquesService.create(newTechnique as Omit<DrawingTechnique, 'id' | 'created_at' | 'updated_at' | 'view_count'>);
      if (result) {
        await loadData();
        setIsAddingNew(false);
        resetNewTechnique();
      }
    } catch (error) {
      console.error('خطأ في إضافة التقنية:', error);
      alert('حدث خطأ في إضافة التقنية');
    }
  };

  // تحديث تقنية
  const handleUpdate = async (id: number, updates: Partial<DrawingTechnique>) => {
    try {
      const result = await techniquesService.update(id, updates);
      if (result) {
        await loadData();
        setEditingItem(null);
      }
    } catch (error) {
      console.error('خطأ في تحديث التقنية:', error);
      alert('حدث خطأ في تحديث التقنية');
    }
  };

  // حذف تقنية
  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه التقنية؟')) {
      try {
        const success = await techniquesService.delete(id);
        if (success) {
          await loadData();
        }
      } catch (error) {
        console.error('خطأ في حذف التقنية:', error);
        alert('حدث خطأ في حذف التقنية');
      }
    }
  };

  // تبديل الرؤية
  const toggleVisibility = async (id: number) => {
    try {
      const item = techniques.find(item => item.id === id);
      if (item) {
        await handleUpdate(id, { visible: !item.visible });
      }
    } catch (error) {
      console.error('خطأ في تغيير حالة الرؤية:', error);
    }
  };

  // تبديل التمييز
  const toggleFeatured = async (id: number) => {
    try {
      const item = techniques.find(item => item.id === id);
      if (item) {
        await handleUpdate(id, { featured: !item.featured });
      }
    } catch (error) {
      console.error('خطأ في تغيير حالة التمييز:', error);
    }
  };

  // إعادة تعيين النموذج
  const resetNewTechnique = () => {
    setNewTechnique({
      title: '',
      title_en: '',
      description: '',
      description_en: '',
      content: '',
      content_en: '',
      difficulty_level: 'مبتدئ',
      difficulty_level_en: 'Beginner',
      category: 'رسم تقليدي',
      category_en: 'Traditional Drawing',
      tools_needed: [],
      tools_needed_en: [],
      steps: [],
      steps_en: [],
      tips: [],
      tips_en: [],
      image_url: '',
      video_url: '',
      estimated_time: '',
      estimated_time_en: '',
      prerequisites: [],
      prerequisites_en: [],
      featured: false,
      visible: true
    });
  };

  // فلترة البيانات - في لوحة التحكم نعرض جميع العناصر (مرئية ومخفية)
  const categories = ['الكل', ...Array.from(new Set(techniques.map(tech => tech.category)))];

  const filteredData = techniques.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || item.category === selectedCategory;
    // في لوحة التحكم نعرض جميع العناصر بغض النظر عن حالة الرؤية
    return matchesSearch && matchesCategory;
  });



  const getDifficultyColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'مبتدئ': 'bg-green-100 text-green-800',
      'متوسط': 'bg-yellow-100 text-yellow-800',
      'متقدم': 'bg-red-100 text-red-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="mr-3 text-gray-600 font-arabic">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* العنوان والإحصائيات */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-arabic flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-orange-600" />
            إدارة تقنيات الرسم
          </h2>
          <p className="text-gray-600 font-arabic mt-1">
            إجمالي التقنيات: {techniques.length} | المرئية: {techniques.filter(t => t.visible).length}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={updateFakeViewCounts}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-arabic"
          >
            <Eye className="w-4 h-4" />
            تحديث المشاهدات
          </button>

          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-arabic"
          >
            <Plus className="w-4 h-4" />
            إضافة تقنية جديدة
          </button>
        </div>
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="البحث في التقنيات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* قائمة التقنيات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredData.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                !item.visible ? 'opacity-60 border-gray-300 bg-gray-50' : 'border-gray-200'
              }`}
            >
              {/* رأس البطاقة */}
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 font-arabic line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-arabic mt-1">
                      {item.category}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    {!item.visible && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                        مخفي
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty_level)}`}>
                      {item.difficulty_level}
                    </span>
                  </div>
                </div>
              </div>

              {/* محتوى البطاقة */}
              <div className="p-4">
                <p className="text-gray-600 text-sm font-arabic line-clamp-2 mb-3">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-arabic">{item.estimated_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{item.view_count}</span>
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(item.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.visible 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={item.visible ? 'إخفاء' : 'إظهار'}
                    >
                      {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => toggleFeatured(item.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.featured 
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={item.featured ? 'إلغاء التمييز' : 'تمييز'}
                    >
                      <Star className={`w-4 h-4 ${item.featured ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="تعديل"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* رسالة عدم وجود نتائج */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 font-arabic">
            لا توجد تقنيات
          </h3>
          <p className="text-gray-500 font-arabic">
            {searchTerm || selectedCategory !== 'الكل' 
              ? 'جرب تغيير معايير البحث' 
              : 'ابدأ بإضافة تقنية جديدة'
            }
          </p>
        </div>
      )}

      {/* نموذج إضافة تقنية جديدة */}
      <AnimatePresence>
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 font-arabic">إضافة تقنية جديدة</h3>
                  <button
                    onClick={() => {
                      setIsAddingNew(false);
                      resetNewTechnique();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* العمود الأيسر */}
                  <div className="space-y-4">
                    {/* العنوان */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        العنوان *
                      </label>
                      <input
                        type="text"
                        value={newTechnique.title}
                        onChange={(e) => setNewTechnique({...newTechnique, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                        placeholder="عنوان التقنية"
                      />
                    </div>

                    {/* العنوان بالإنجليزية */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title (English)
                      </label>
                      <input
                        type="text"
                        value={newTechnique.title_en}
                        onChange={(e) => setNewTechnique({...newTechnique, title_en: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Technique title"
                      />
                    </div>

                    {/* الوصف */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        الوصف
                      </label>
                      <textarea
                        value={newTechnique.description}
                        onChange={(e) => setNewTechnique({...newTechnique, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                        placeholder="وصف مختصر للتقنية"
                      />
                    </div>

                    {/* الفئة */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        الفئة
                      </label>
                      <select
                        value={newTechnique.category}
                        onChange={(e) => setNewTechnique({...newTechnique, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                      >
                        <option value="رسم تقليدي">رسم تقليدي</option>
                        <option value="رسم رقمي">رسم رقمي</option>
                        <option value="ألوان مائية">ألوان مائية</option>
                        <option value="ألوان زيتية">ألوان زيتية</option>
                        <option value="رسم بالفحم">رسم بالفحم</option>
                        <option value="رسم بالباستيل">رسم بالباستيل</option>
                      </select>
                    </div>

                    {/* مستوى الصعوبة */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        مستوى الصعوبة
                      </label>
                      <select
                        value={newTechnique.difficulty_level}
                        onChange={(e) => setNewTechnique({...newTechnique, difficulty_level: e.target.value as 'مبتدئ' | 'متوسط' | 'متقدم'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                      >
                        <option value="مبتدئ">مبتدئ</option>
                        <option value="متوسط">متوسط</option>
                        <option value="متقدم">متقدم</option>
                      </select>
                    </div>

                    {/* الوقت المقدر */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        الوقت المقدر
                      </label>
                      <input
                        type="text"
                        value={newTechnique.estimated_time}
                        onChange={(e) => setNewTechnique({...newTechnique, estimated_time: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                        placeholder="مثال: 30-45 دقيقة"
                      />
                    </div>

                    {/* رفع صورة التقنية */}
                    <div>
                      <ImageUpload
                        currentImage={newTechnique.image_url}
                        onImageChange={(imageUrl) => setNewTechnique({...newTechnique, image_url: imageUrl})}
                        type="technique"
                        size="lg"
                        shape="rectangle"
                        label="صورة التقنية"
                        placeholder="انقر لرفع صورة التقنية"
                      />
                    </div>

                    {/* رابط الفيديو */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        رابط الفيديو التعليمي
                      </label>
                      <input
                        type="url"
                        value={newTechnique.video_url}
                        onChange={(e) => setNewTechnique({...newTechnique, video_url: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>

                  {/* العمود الأيمن */}
                  <div className="space-y-4">
                    {/* المحتوى التفصيلي */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        المحتوى التفصيلي *
                      </label>
                      <textarea
                        value={newTechnique.content}
                        onChange={(e) => setNewTechnique({...newTechnique, content: e.target.value})}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                        placeholder="شرح مفصل للتقنية..."
                      />
                    </div>

                    {/* الأدوات المطلوبة */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        الأدوات المطلوبة
                      </label>
                      <div className="space-y-2">
                        {newTechnique.tools_needed?.map((tool, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={tool}
                              onChange={(e) => {
                                const updated = [...(newTechnique.tools_needed || [])];
                                updated[index] = e.target.value;
                                setNewTechnique({...newTechnique, tools_needed: updated});
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                            />
                            <button
                              onClick={() => {
                                const updated = newTechnique.tools_needed?.filter((_, i) => i !== index) || [];
                                setNewTechnique({...newTechnique, tools_needed: updated});
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updated = [...(newTechnique.tools_needed || []), ''];
                            setNewTechnique({...newTechnique, tools_needed: updated});
                          }}
                          className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors font-arabic"
                        >
                          + إضافة أداة
                        </button>
                      </div>
                    </div>

                    {/* خطوات التطبيق */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        خطوات التطبيق
                      </label>
                      <div className="space-y-2">
                        {newTechnique.steps?.map((step, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={step}
                              onChange={(e) => {
                                const updated = [...(newTechnique.steps || [])];
                                updated[index] = e.target.value;
                                setNewTechnique({...newTechnique, steps: updated});
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                            />
                            <button
                              onClick={() => {
                                const updated = newTechnique.steps?.filter((_, i) => i !== index) || [];
                                setNewTechnique({...newTechnique, steps: updated});
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updated = [...(newTechnique.steps || []), ''];
                            setNewTechnique({...newTechnique, steps: updated});
                          }}
                          className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors font-arabic"
                        >
                          + إضافة خطوة
                        </button>
                      </div>
                    </div>

                    {/* نصائح مهمة */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        نصائح مهمة
                      </label>
                      <div className="space-y-2">
                        {newTechnique.tips?.map((tip, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            <input
                              type="text"
                              value={tip}
                              onChange={(e) => {
                                const updated = [...(newTechnique.tips || [])];
                                updated[index] = e.target.value;
                                setNewTechnique({...newTechnique, tips: updated});
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                            />
                            <button
                              onClick={() => {
                                const updated = newTechnique.tips?.filter((_, i) => i !== index) || [];
                                setNewTechnique({...newTechnique, tips: updated});
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updated = [...(newTechnique.tips || []), ''];
                            setNewTechnique({...newTechnique, tips: updated});
                          }}
                          className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-yellow-500 hover:text-yellow-600 transition-colors font-arabic"
                        >
                          + إضافة نصيحة
                        </button>
                      </div>
                    </div>

                    {/* خيارات إضافية */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 font-arabic">
                        <input
                          type="checkbox"
                          checked={newTechnique.featured}
                          onChange={(e) => setNewTechnique({...newTechnique, featured: e.target.checked})}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        تقنية مميزة
                      </label>

                      <label className="flex items-center gap-2 font-arabic">
                        <input
                          type="checkbox"
                          checked={newTechnique.visible}
                          onChange={(e) => setNewTechnique({...newTechnique, visible: e.target.checked})}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        مرئية للجمهور
                      </label>
                    </div>
                  </div>
                </div>

                {/* أزرار الحفظ والإلغاء */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => {
                      setIsAddingNew(false);
                      resetNewTechnique();
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-arabic"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-arabic flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    حفظ التقنية
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نموذج تعديل التقنية */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 font-arabic">تعديل التقنية</h3>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* العمود الأيسر */}
                  <div className="space-y-4">
                    {/* العنوان */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        العنوان *
                      </label>
                      <input
                        type="text"
                        value={editingItem.title}
                        onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                        placeholder="عنوان التقنية"
                      />
                    </div>

                    {/* العنوان بالإنجليزية */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title (English)
                      </label>
                      <input
                        type="text"
                        value={editingItem.title_en || ''}
                        onChange={(e) => setEditingItem({...editingItem, title_en: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Technique title"
                      />
                    </div>

                    {/* الوصف */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        الوصف
                      </label>
                      <textarea
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                        placeholder="وصف مختصر للتقنية"
                      />
                    </div>

                    {/* الفئة */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        الفئة
                      </label>
                      <select
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                      >
                        <option value="رسم تقليدي">رسم تقليدي</option>
                        <option value="رسم رقمي">رسم رقمي</option>
                        <option value="ألوان مائية">ألوان مائية</option>
                        <option value="ألوان زيتية">ألوان زيتية</option>
                        <option value="رسم بالفحم">رسم بالفحم</option>
                        <option value="رسم بالباستيل">رسم بالباستيل</option>
                      </select>
                    </div>

                    {/* مستوى الصعوبة */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        مستوى الصعوبة
                      </label>
                      <select
                        value={editingItem.difficulty_level}
                        onChange={(e) => setEditingItem({...editingItem, difficulty_level: e.target.value as 'مبتدئ' | 'متوسط' | 'متقدم'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                      >
                        <option value="مبتدئ">مبتدئ</option>
                        <option value="متوسط">متوسط</option>
                        <option value="متقدم">متقدم</option>
                      </select>
                    </div>

                    {/* الوقت المقدر */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        الوقت المقدر
                      </label>
                      <input
                        type="text"
                        value={editingItem.estimated_time || ''}
                        onChange={(e) => setEditingItem({...editingItem, estimated_time: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                        placeholder="مثال: 30-45 دقيقة"
                      />
                    </div>

                    {/* رفع صورة التقنية */}
                    <div>
                      <ImageUpload
                        currentImage={editingItem.image_url}
                        onImageChange={(imageUrl) => setEditingItem({...editingItem, image_url: imageUrl})}
                        type="technique"
                        itemId={editingItem.id}
                        size="lg"
                        shape="rectangle"
                        label="صورة التقنية"
                        placeholder="انقر لرفع صورة التقنية"
                      />
                    </div>

                    {/* رابط الفيديو */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        رابط الفيديو التعليمي
                      </label>
                      <input
                        type="url"
                        value={editingItem.video_url || ''}
                        onChange={(e) => setEditingItem({...editingItem, video_url: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>

                  {/* العمود الأيمن */}
                  <div className="space-y-4">
                    {/* المحتوى التفصيلي */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        المحتوى التفصيلي *
                      </label>
                      <textarea
                        value={editingItem.content}
                        onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                        placeholder="شرح مفصل للتقنية..."
                      />
                    </div>

                    {/* الأدوات المطلوبة */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        الأدوات المطلوبة
                      </label>
                      <div className="space-y-2">
                        {editingItem.tools_needed?.map((tool, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={tool}
                              onChange={(e) => {
                                const updated = [...(editingItem.tools_needed || [])];
                                updated[index] = e.target.value;
                                setEditingItem({...editingItem, tools_needed: updated});
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                            />
                            <button
                              onClick={() => {
                                const updated = editingItem.tools_needed?.filter((_, i) => i !== index) || [];
                                setEditingItem({...editingItem, tools_needed: updated});
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updated = [...(editingItem.tools_needed || []), ''];
                            setEditingItem({...editingItem, tools_needed: updated});
                          }}
                          className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors font-arabic"
                        >
                          + إضافة أداة
                        </button>
                      </div>
                    </div>

                    {/* خطوات التطبيق */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        خطوات التطبيق
                      </label>
                      <div className="space-y-2">
                        {editingItem.steps?.map((step, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              value={step}
                              onChange={(e) => {
                                const updated = [...(editingItem.steps || [])];
                                updated[index] = e.target.value;
                                setEditingItem({...editingItem, steps: updated});
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                            />
                            <button
                              onClick={() => {
                                const updated = editingItem.steps?.filter((_, i) => i !== index) || [];
                                setEditingItem({...editingItem, steps: updated});
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updated = [...(editingItem.steps || []), ''];
                            setEditingItem({...editingItem, steps: updated});
                          }}
                          className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors font-arabic"
                        >
                          + إضافة خطوة
                        </button>
                      </div>
                    </div>

                    {/* نصائح مهمة */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                        نصائح مهمة
                      </label>
                      <div className="space-y-2">
                        {editingItem.tips?.map((tip, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            <input
                              type="text"
                              value={tip}
                              onChange={(e) => {
                                const updated = [...(editingItem.tips || [])];
                                updated[index] = e.target.value;
                                setEditingItem({...editingItem, tips: updated});
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
                            />
                            <button
                              onClick={() => {
                                const updated = editingItem.tips?.filter((_, i) => i !== index) || [];
                                setEditingItem({...editingItem, tips: updated});
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updated = [...(editingItem.tips || []), ''];
                            setEditingItem({...editingItem, tips: updated});
                          }}
                          className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-yellow-500 hover:text-yellow-600 transition-colors font-arabic"
                        >
                          + إضافة نصيحة
                        </button>
                      </div>
                    </div>

                    {/* خيارات إضافية */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 font-arabic">
                        <input
                          type="checkbox"
                          checked={editingItem.featured}
                          onChange={(e) => setEditingItem({...editingItem, featured: e.target.checked})}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        تقنية مميزة
                      </label>

                      <label className="flex items-center gap-2 font-arabic">
                        <input
                          type="checkbox"
                          checked={editingItem.visible}
                          onChange={(e) => setEditingItem({...editingItem, visible: e.target.checked})}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        مرئية للجمهور
                      </label>
                    </div>
                  </div>
                </div>

                {/* أزرار الحفظ والإلغاء */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-arabic"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => handleUpdate(editingItem.id, editingItem)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-arabic flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechniquesSettings;
