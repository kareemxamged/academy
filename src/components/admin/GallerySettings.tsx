import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Image as ImageIcon,
  Save,
  X,
  Calendar,
  User,

} from 'lucide-react';
import { galleryService } from '../../lib/supabase';
import type { GalleryItem } from '../../types/database';
import { GalleryImageUpload } from '../ImageUpload';

interface GallerySettingsProps {
  onDataChange?: () => void; // دالة لإشعار المكون الأب بتغيير البيانات
}

const GallerySettings: React.FC<GallerySettingsProps> = ({ onDataChange }) => {
  const [data, setData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('الكل');

  const categories = ['الكل', 'رسم تقليدي', 'رسم رقمي', 'بورتريه', 'مناظر طبيعية', 'رسم كاريكاتير', 'فن تجريدي'];
  const levels = ['مبتدئ', 'متوسط', 'متقدم'];

  // تحميل البيانات من Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await galleryService.getAll();
      setData(items);
    } catch (error) {
      console.error('خطأ في تحميل بيانات المعرض:', error);
    } finally {
      setLoading(false);
    }
  };

  const newItemTemplate: Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'> = {
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    image_url: '',
    category: 'رسم تقليدي',
    category_en: 'Traditional Drawing',
    student_name: '',
    student_name_en: '',
    instructor: '',
    instructor_en: '',
    completion_date: new Date().toISOString().split('T')[0],
    featured: false,
    visible: true,
    skill_level: 'مبتدئ',
    skill_level_en: 'Beginner'
  };

  // فلترة البيانات
  const filteredData = data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'الكل' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddNew = () => {
    setEditingItem({ ...newItemTemplate, id: 0 } as GalleryItem);
    setIsAddingNew(true);
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem({ ...item });
    setIsAddingNew(false);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      if (isAddingNew) {
        const { id, created_at, updated_at, ...itemData } = editingItem;
        const newItem = await galleryService.create(itemData);
        if (newItem) {
          await loadData(); // إعادة تحميل البيانات
          onDataChange?.(); // إشعار المكون الأب بتغيير البيانات
        }
      } else {
        const updatedItem = await galleryService.update(editingItem.id, editingItem);
        if (updatedItem) {
          await loadData(); // إعادة تحميل البيانات
          onDataChange?.(); // إشعار المكون الأب بتغيير البيانات
        }
      }

      setEditingItem(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error('خطأ في حفظ العمل:', error);
      alert('حدث خطأ في حفظ العمل');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا العمل؟')) {
      try {
        const success = await galleryService.delete(id);
        if (success) {
          await loadData(); // إعادة تحميل البيانات
          onDataChange?.(); // إشعار المكون الأب بتغيير البيانات
        }
      } catch (error) {
        console.error('خطأ في حذف العمل:', error);
        alert('حدث خطأ في حذف العمل');
      }
    }
  };

  const toggleVisibility = async (id: number) => {
    try {
      const item = data.find(item => item.id === id);
      if (item) {
        await galleryService.update(id, { visible: !item.visible });
        await loadData(); // إعادة تحميل البيانات
        onDataChange?.(); // إشعار المكون الأب بتغيير البيانات
      }
    } catch (error) {
      console.error('خطأ في تغيير حالة الرؤية:', error);
    }
  };

  const toggleFeatured = async (id: number) => {
    try {
      const item = data.find(item => item.id === id);
      if (item) {
        await galleryService.update(id, { featured: !item.featured });
        await loadData(); // إعادة تحميل البيانات
        onDataChange?.(); // إشعار المكون الأب بتغيير البيانات
      }
    } catch (error) {
      console.error('خطأ في تغيير حالة التمييز:', error);
    }
  };

  const updateEditingItem = (field: keyof GalleryItem, value: any) => {
    if (!editingItem) return;
    setEditingItem({ ...editingItem, [field]: value });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'رسم تقليدي': 'bg-blue-100 text-blue-800',
      'رسم رقمي': 'bg-purple-100 text-purple-800',
      'بورتريه': 'bg-pink-100 text-pink-800',
      'مناظر طبيعية': 'bg-green-100 text-green-800',
      'رسم كاريكاتير': 'bg-orange-100 text-orange-800',
      'فن تجريدي': 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'مبتدئ': 'bg-green-100 text-green-800',
      'متوسط': 'bg-yellow-100 text-yellow-800',
      'متقدم': 'bg-red-100 text-red-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  // إذا كان التحميل جارياً
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-arabic">جاري تحميل بيانات المعرض...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800 font-arabic">إدارة معرض الأعمال</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-arabic">إضافة عمل جديد</span>
        </motion.button>
      </div>

      {/* أدوات البحث والفلترة */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">البحث</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالعنوان أو اسم الطالب..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">فلترة حسب الفئة</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* قائمة الأعمال */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredData.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* الصورة */}
              <div className="relative aspect-square">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* شارات الحالة */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.featured && (
                    <div className="bg-yellow-500 text-white p-1 rounded-full">
                      <Star className="w-4 h-4" />
                    </div>
                  )}
                  {!item.visible && (
                    <div className="bg-gray-500 text-white p-1 rounded-full">
                      <EyeOff className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* المعلومات */}
              <div className="p-4">
                <h4 className="font-bold text-lg text-gray-800 mb-2 font-arabic line-clamp-1">
                  {item.title || 'بدون عنوان'}
                </h4>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 font-arabic">{item.student_name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{item.completion_date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(item.skill_level)}`}>
                      {item.skill_level}
                    </span>
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => toggleVisibility(item.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.visible 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={item.visible ? 'إخفاء' : 'إظهار'}
                    >
                      {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => toggleFeatured(item.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.featured 
                          ? 'text-yellow-600 hover:bg-yellow-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={item.featured ? 'إلغاء التمييز' : 'تمييز'}
                    >
                      {item.featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* رسالة عدم وجود نتائج */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2 font-arabic">
            لا توجد أعمال
          </h3>
          <p className="text-gray-500 font-arabic">
            {searchTerm || filterCategory !== 'الكل' 
              ? 'لا توجد أعمال تطابق معايير البحث' 
              : 'لم يتم إضافة أي أعمال بعد'}
          </p>
        </div>
      )}

      {/* نموذج التعديل/الإضافة */}
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
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 font-arabic">
                    {isAddingNew ? 'إضافة عمل جديد' : 'تعديل العمل'}
                  </h3>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* العنوان */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">العنوان</label>
                      <input
                        type="text"
                        value={editingItem.title}
                        onChange={(e) => updateEditingItem('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="عنوان العمل"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">العنوان (إنجليزي)</label>
                      <input
                        type="text"
                        value={editingItem.title_en || ''}
                        onChange={(e) => updateEditingItem('title_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Title in English"
                      />
                    </div>
                  </div>

                  {/* الوصف */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الوصف</label>
                      <textarea
                        value={editingItem.description || ''}
                        onChange={(e) => updateEditingItem('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="وصف العمل"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الوصف (إنجليزي)</label>
                      <textarea
                        value={editingItem.description_en || ''}
                        onChange={(e) => updateEditingItem('description_en', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Description in English"
                      />
                    </div>
                  </div>

                  {/* رفع صورة العمل الفني */}
                  <div className="col-span-2">
                    <GalleryImageUpload
                      currentImage={editingItem.image_url}
                      onImageChange={(imageUrl) => updateEditingItem('image_url', imageUrl)}
                      itemId={editingItem.id}
                    />
                  </div>

                  {/* اسم الطالب */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">اسم الطالب</label>
                      <input
                        type="text"
                        value={editingItem.student_name}
                        onChange={(e) => updateEditingItem('student_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="اسم الطالب"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">اسم الطالب (إنجليزي)</label>
                      <input
                        type="text"
                        value={editingItem.student_name_en || ''}
                        onChange={(e) => updateEditingItem('student_name_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Student Name in English"
                      />
                    </div>
                  </div>

                  {/* اسم المدرب */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">اسم المدرب</label>
                      <input
                        type="text"
                        value={editingItem.instructor}
                        onChange={(e) => updateEditingItem('instructor', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="اسم المدرب"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">اسم المدرب (إنجليزي)</label>
                      <input
                        type="text"
                        value={editingItem.instructor_en || ''}
                        onChange={(e) => updateEditingItem('instructor_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Instructor Name in English"
                      />
                    </div>
                  </div>

                  {/* الفئة والمستوى والتاريخ */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الفئة</label>
                      <select
                        value={editingItem.category}
                        onChange={(e) => updateEditingItem('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.slice(1).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">المستوى</label>
                      <select
                        value={editingItem.skill_level}
                        onChange={(e) => updateEditingItem('skill_level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {levels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">التاريخ</label>
                      <input
                        type="date"
                        value={editingItem.completion_date}
                        onChange={(e) => updateEditingItem('completion_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* خيارات إضافية */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 font-arabic">
                      <input
                        type="checkbox"
                        checked={editingItem.visible}
                        onChange={(e) => updateEditingItem('visible', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span>إظهار في المعرض</span>
                    </label>

                    <label className="flex items-center gap-2 font-arabic">
                      <input
                        type="checkbox"
                        checked={editingItem.featured}
                        onChange={(e) => updateEditingItem('featured', e.target.checked)}
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <span>عمل مميز</span>
                    </label>
                  </div>
                </div>

                {/* أزرار الحفظ والإلغاء */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-arabic"
                  >
                    إلغاء
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span className="font-arabic">حفظ</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GallerySettings;
