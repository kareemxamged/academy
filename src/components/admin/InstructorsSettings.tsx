import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,

  Save,
  X,
  User,
  Award,
  Users
} from 'lucide-react';
import { instructorsService } from '../../lib/supabase';
import type { Instructor } from '../../types/database';
import { InstructorImageUpload } from '../ImageUpload';

interface InstructorsSettingsProps {
  onDataChange?: () => void; // دالة لإشعار المكون الأب بتغيير البيانات
}

const InstructorsSettings: React.FC<InstructorsSettingsProps> = ({ onDataChange }) => {
  const [data, setData] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Instructor | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');


  // تحميل البيانات من Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const instructors = await instructorsService.getAll();
      setData(instructors);
    } catch (error) {
      console.error('خطأ في تحميل بيانات المدربين:', error);
    } finally {
      setLoading(false);
    }
  };

  const newItemTemplate: Omit<Instructor, 'id' | 'created_at' | 'updated_at'> = {
    name: '',
    name_en: '',
    title: '',
    title_en: '',
    image_url: '',
    profile_url: '',
    experience: '',
    experience_en: '',
    specialties: [],
    specialties_en: [],
    rating: 0,
    students_count: 0,
    description: '',
    description_en: '',
    visible: true
  };

  const handleAddNew = () => {
    setEditingItem({ ...newItemTemplate, id: 0 } as Instructor);
    setIsAddingNew(true);
  };

  const handleEdit = (item: Instructor) => {
    setEditingItem({ ...item });
    setIsAddingNew(false);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    // التحقق من صحة البيانات
    if (!editingItem.name.trim()) {
      alert('يرجى إدخال اسم المدرب');
      return;
    }
    if (!editingItem.title.trim()) {
      alert('يرجى إدخال المسمى الوظيفي');
      return;
    }

    try {
      if (isAddingNew) {
        const { id, created_at, updated_at, ...itemData } = editingItem;
        const newItem = await instructorsService.create(itemData);
        if (newItem) {
          await loadData();
          onDataChange?.(); // إشعار المكون الأب بتغيير البيانات
          alert('تم إضافة المدرب بنجاح');
        } else {
          alert('فشل في إضافة المدرب');
          return;
        }
      } else {
        const updatedItem = await instructorsService.update(editingItem.id, editingItem);
        if (updatedItem) {
          await loadData();
          onDataChange?.(); // إشعار المكون الأب بتغيير البيانات
          alert('تم تحديث بيانات المدرب بنجاح');
        } else {
          alert('فشل في تحديث بيانات المدرب');
          return;
        }
      }

      setEditingItem(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error('خطأ في حفظ المدرب:', error);
      alert('حدث خطأ في حفظ المدرب. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDelete = async (id: number) => {
    const instructor = data.find(item => item.id === id);
    if (!instructor) return;

    if (confirm(`هل أنت متأكد من حذف المدرب "${instructor.name}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) {
      try {
        const success = await instructorsService.delete(id);
        if (success) {
          await loadData();
          onDataChange?.(); // إشعار المكون الأب بتغيير البيانات
          alert('تم حذف المدرب بنجاح');
        } else {
          alert('فشل في حذف المدرب');
        }
      } catch (error) {
        console.error('خطأ في حذف المدرب:', error);
        alert('حدث خطأ في حذف المدرب. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const toggleVisibility = async (id: number) => {
    try {
      const item = data.find(item => item.id === id);
      if (item) {
        const success = await instructorsService.update(id, { visible: !item.visible });
        if (success) {
          await loadData();
          onDataChange?.(); // إشعار المكون الأب بتغيير البيانات
          const status = !item.visible ? 'مرئي' : 'مخفي';
          console.log(`تم تغيير حالة المدرب "${item.name}" إلى ${status}`);
        } else {
          alert('فشل في تغيير حالة الرؤية');
        }
      }
    } catch (error) {
      console.error('خطأ في تغيير حالة الرؤية:', error);
      alert('حدث خطأ في تغيير حالة الرؤية');
    }
  };



  const updateEditingItem = (field: keyof Instructor, value: any) => {
    if (!editingItem) return;
    setEditingItem({ ...editingItem, [field]: value });
  };

  const updateSpecialties = (value: string, isEnglish: boolean = false) => {
    if (!editingItem) return;
    const specialties = value.split(',').map(s => s.trim()).filter(s => s);
    if (isEnglish) {
      setEditingItem({ ...editingItem, specialties_en: specialties });
    } else {
      setEditingItem({ ...editingItem, specialties: specialties });
    }
  };

  // فلترة البيانات
  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.name_en && item.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // إذا كان التحميل جارياً
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-arabic">جاري تحميل بيانات المدربين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800 font-arabic">إدارة المدربين</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-arabic">إضافة مدرب جديد</span>
        </motion.button>
      </div>

      {/* شريط البحث */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <input
          type="text"
          placeholder="البحث في المدربين..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-arabic"
        />
      </div>

      {/* قائمة المدربين */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredData.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white rounded-lg shadow-md overflow-hidden border"
            >
              {/* صورة المدرب */}
              <div className="relative aspect-square">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* شارة الرؤية */}
                <div className="absolute top-2 right-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleVisibility(item.id)}
                    className={`p-2 rounded-full ${
                      item.visible 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>

              {/* معلومات المدرب */}
              <div className="p-4">
                <h4 className="text-lg font-bold text-gray-800 mb-1 font-arabic">
                  {item.name}
                </h4>
                <p className="text-blue-600 text-sm mb-2 font-arabic">
                  {item.title}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-700">{item.rating}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 font-arabic">{item.students_count} طالب</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 font-arabic">{item.experience}</span>
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="font-arabic">تعديل</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* رسالة عدم وجود مدربين */}
      {filteredData.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2 font-arabic">
            لا يوجد مدربين
          </h3>
          <p className="text-gray-500 font-arabic">
            {searchTerm
              ? 'لا يوجد مدربين يطابقون معايير البحث'
              : 'لم يتم إضافة أي مدربين بعد'}
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 font-arabic">
                  {isAddingNew ? 'إضافة مدرب جديد' : 'تعديل المدرب'}
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* رفع صورة المدرب */}
                <div className="flex justify-center">
                  <InstructorImageUpload
                    currentImage={editingItem.image_url}
                    onImageChange={(imageUrl) => updateEditingItem('image_url', imageUrl)}
                    instructorId={editingItem.id}
                  />
                </div>

                {/* الاسم */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الاسم</label>
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => updateEditingItem('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="اسم المدرب"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الاسم (إنجليزي)</label>
                    <input
                      type="text"
                      value={editingItem.name_en || ''}
                      onChange={(e) => updateEditingItem('name_en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Instructor Name in English"
                    />
                  </div>
                </div>

                {/* المسمى الوظيفي */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">المسمى الوظيفي</label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => updateEditingItem('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="مدرب رسم محترف"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">المسمى الوظيفي (إنجليزي)</label>
                    <input
                      type="text"
                      value={editingItem.title_en || ''}
                      onChange={(e) => updateEditingItem('title_en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Professional Drawing Instructor"
                    />
                  </div>
                </div>

                {/* رابط الملف الشخصي */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">رابط الملف الشخصي</label>
                  <input
                    type="url"
                    value={editingItem.profile_url || ''}
                    onChange={(e) => updateEditingItem('profile_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/profile"
                  />
                </div>

                {/* الخبرة */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الخبرة</label>
                    <input
                      type="text"
                      value={editingItem.experience || ''}
                      onChange={(e) => updateEditingItem('experience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="10 سنوات خبرة في تعليم الرسم"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الخبرة (إنجليزي)</label>
                    <input
                      type="text"
                      value={editingItem.experience_en || ''}
                      onChange={(e) => updateEditingItem('experience_en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="10 years experience in teaching drawing"
                    />
                  </div>
                </div>

                {/* التخصصات */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">التخصصات (مفصولة بفاصلة)</label>
                    <input
                      type="text"
                      value={editingItem.specialties?.join(', ') || ''}
                      onChange={(e) => updateSpecialties(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="رسم تقليدي, بورتريه, رسم بالقلم الرصاص"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">التخصصات (إنجليزي)</label>
                    <input
                      type="text"
                      value={editingItem.specialties_en?.join(', ') || ''}
                      onChange={(e) => updateSpecialties(e.target.value, true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Traditional Drawing, Portrait, Pencil Drawing"
                    />
                  </div>
                </div>

                {/* التقييم وعدد الطلاب */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">التقييم (من 5)</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={editingItem.rating}
                      onChange={(e) => updateEditingItem('rating', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">عدد الطلاب</label>
                    <input
                      type="number"
                      min="0"
                      value={editingItem.students_count}
                      onChange={(e) => updateEditingItem('students_count', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="وصف تفصيلي عن المدرب وخبراته"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الوصف (إنجليزي)</label>
                    <textarea
                      value={editingItem.description_en || ''}
                      onChange={(e) => updateEditingItem('description_en', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Detailed description about the instructor and experience"
                    />
                  </div>
                </div>

                {/* إعدادات الرؤية */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.visible}
                      onChange={(e) => updateEditingItem('visible', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 font-arabic">مرئي في الموقع</span>
                  </label>
                </div>

                {/* أزرار الحفظ والإلغاء */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    <span className="font-arabic">حفظ</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditingItem(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-arabic"
                  >
                    إلغاء
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

export default InstructorsSettings;
