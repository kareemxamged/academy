import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Star,
  Clock,
  DollarSign,
  User,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { coursesService } from '../../lib/supabase';
import type { Course } from '../../types/database';

interface CoursesSettingsProps {
  // لا نحتاج props بعد الآن - سنحمل البيانات من قاعدة البيانات مباشرة
}

const CoursesSettings: React.FC<CoursesSettingsProps> = () => {
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // تحميل البيانات من قاعدة البيانات
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const courses = await coursesService.getAll();
      setData(courses);
      console.log('✅ تم تحميل الدورات من قاعدة البيانات:', courses.length);
    } catch (error) {
      console.error('❌ خطأ في تحميل الدورات:', error);
    } finally {
      setLoading(false);
    }
  };

  // دورة فارغة للإضافة الجديدة
  const getEmptyCourse = (): Course => ({
    id: 0, // سيتم تعيينه من قاعدة البيانات
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    duration: '',
    duration_en: '',
    level_name: 'مبتدئ',
    level_name_en: 'Beginner',
    price: 0,
    currency: 'ريال سعودي',
    show_price: true,
    image_url: '',
    features: [''],
    features_en: [''],
    instructor: '',
    instructor_en: '',
    category: 'رسم تقليدي',
    category_en: 'Traditional Drawing',
    enrollment_url: '',
    visible: true,
    featured: false
  });

  const handleAddNew = () => {
    setEditingCourse(getEmptyCourse());
    setIsAddingNew(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse({ ...course });
    setIsAddingNew(false);
  };

  const handleSave = async () => {
    if (!editingCourse) return;

    try {
      if (isAddingNew) {
        console.log('🔄 جاري إضافة دورة جديدة...');
        const { id, created_at, updated_at, ...courseData } = editingCourse;

        // التأكد من أن الحقول المطلوبة موجودة
        const courseToCreate = {
          ...courseData,
          description: courseData.description || '',
          visible: courseData.visible ?? true,
          featured: courseData.featured ?? false,
          show_price: courseData.show_price ?? true
        };

        const newCourse = await coursesService.create(courseToCreate);
        if (newCourse) {
          console.log('✅ تم إضافة الدورة بنجاح');
          await loadData(); // إعادة تحميل البيانات
        }
      } else {
        console.log('🔄 جاري تحديث الدورة...');
        const updatedCourse = await coursesService.update(editingCourse.id, editingCourse);
        if (updatedCourse) {
          console.log('✅ تم تحديث الدورة بنجاح');
          await loadData(); // إعادة تحميل البيانات
        }
      }

      setEditingCourse(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error('❌ خطأ في حفظ الدورة:', error);
      alert('حدث خطأ في حفظ الدورة');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
      try {
        console.log('🔄 جاري حذف الدورة...');
        const success = await coursesService.delete(id);
        if (success) {
          console.log('✅ تم حذف الدورة بنجاح');
          await loadData(); // إعادة تحميل البيانات
        }
      } catch (error) {
        console.error('❌ خطأ في حذف الدورة:', error);
        alert('حدث خطأ في حذف الدورة');
      }
    }
  };

  const toggleVisibility = async (id: number) => {
    try {
      const course = data.find(c => c.id === id);
      if (course) {
        console.log('🔄 جاري تغيير حالة الرؤية...');
        const updated = await coursesService.update(id, { visible: !course.visible });
        if (updated) {
          console.log('✅ تم تغيير حالة الرؤية بنجاح');
          await loadData(); // إعادة تحميل البيانات
        }
      }
    } catch (error) {
      console.error('❌ خطأ في تغيير حالة الرؤية:', error);
    }
  };

  const toggleFeatured = async (id: number) => {
    try {
      const course = data.find(c => c.id === id);
      if (course) {
        console.log('🔄 جاري تغيير حالة المميز...');
        const updated = await coursesService.update(id, { featured: !course.featured });
        if (updated) {
          console.log('✅ تم تغيير حالة المميز بنجاح');
          await loadData(); // إعادة تحميل البيانات
        }
      }
    } catch (error) {
      console.error('❌ خطأ في تغيير حالة المميز:', error);
    }
  };

  const updateEditingCourse = (field: string, value: any) => {
    if (!editingCourse) return;
    setEditingCourse({ ...editingCourse, [field]: value });
  };

  const updateFeatures = (index: number, value: string, isEnglish = false) => {
    if (!editingCourse) return;
    const field = isEnglish ? 'features_en' : 'features';
    const currentFeatures = editingCourse[field] || [];
    const newFeatures = [...currentFeatures];
    newFeatures[index] = value;
    setEditingCourse({ ...editingCourse, [field]: newFeatures });
  };

  const addFeature = (isEnglish = false) => {
    if (!editingCourse) return;
    const field = isEnglish ? 'features_en' : 'features';
    const currentFeatures = editingCourse[field] || [];
    setEditingCourse({
      ...editingCourse,
      [field]: [...currentFeatures, '']
    });
  };

  const removeFeature = (index: number, isEnglish = false) => {
    if (!editingCourse) return;
    const field = isEnglish ? 'features_en' : 'features';
    const currentFeatures = editingCourse[field] || [];
    const newFeatures = currentFeatures.filter((_, i) => i !== index);
    setEditingCourse({ ...editingCourse, [field]: newFeatures });
  };

  const filteredCourses = data.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.title_en && course.title_en.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'مبتدئ': return 'bg-green-100 text-green-700';
      case 'متوسط': return 'bg-yellow-100 text-yellow-700';
      case 'متقدم': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'رسم تقليدي': return 'bg-blue-100 text-blue-700';
      case 'رسم رقمي': return 'bg-purple-100 text-purple-700';
      case 'بورتريه': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس القسم */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 font-arabic flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            إدارة الدورات التدريبية
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
          </h3>
          <p className="text-gray-600 font-arabic">
            إضافة وتعديل وإدارة الدورات المعروضة | متصل بقاعدة البيانات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="إعادة تحميل البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleAddNew}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span className="font-arabic">إضافة دورة جديدة</span>
          </button>
        </div>
      </div>

      {/* شريط البحث */}
      <div className="relative">
        <input
          type="text"
          placeholder="البحث في الدورات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-arabic"
        />
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-arabic text-blue-800">إجمالي الدورات</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{data.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="font-arabic text-green-800">الدورات المرئية</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{data.filter(c => c.visible).length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <span className="font-arabic text-yellow-800">الدورات المميزة</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{data.filter(c => c.featured).length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="font-arabic text-purple-800">متوسط السعر</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {data.length > 0 ? Math.round(data.reduce((sum, c) => sum + (c.price || 0), 0) / data.length) : 0}
          </p>
        </div>
      </div>

      {/* قائمة الدورات */}
      <div className="space-y-4">
        {filteredCourses.map((course) => (
          <motion.div
            key={course.id}
            layout
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-800 font-arabic">
                    {course.title}
                  </h4>
                  {course.featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      مميز
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(course.level_name)}`}>
                    {course.level_name}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(course.category)}`}>
                    {course.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{course.price || 0} {course.currency || 'ريال'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{course.instructor}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFeatured(course.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    course.featured 
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={course.featured ? 'إلغاء التمييز' : 'جعل مميز'}
                >
                  <Star className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => toggleVisibility(course.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    course.visible 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                  title={course.visible ? 'إخفاء' : 'إظهار'}
                >
                  {course.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => handleEdit(course)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-arabic">
              {searchTerm ? 'لا توجد دورات تطابق البحث' : 'لا توجد دورات مضافة بعد'}
            </p>
          </div>
        )}
      </div>

      {/* نموذج التعديل/الإضافة */}
      <AnimatePresence>
        {editingCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingCourse(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* رأس النموذج */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold font-arabic">
                  {isAddingNew ? 'إضافة دورة جديدة' : 'تعديل الدورة'}
                </h3>
                <button
                  onClick={() => setEditingCourse(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* محتوى النموذج */}
              <div className="p-6 space-y-6">
                {/* معلومات أساسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">
                      عنوان الدورة
                    </label>
                    <input
                      type="text"
                      value={editingCourse.title}
                      onChange={(e) => updateEditingCourse('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل عنوان الدورة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">
                      عنوان الدورة (إنجليزي)
                    </label>
                    <input
                      type="text"
                      value={editingCourse.title_en || ''}
                      onChange={(e) => updateEditingCourse('title_en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course title in English"
                    />
                  </div>
                </div>

                {/* الوصف */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">
                      وصف الدورة
                    </label>
                    <textarea
                      value={editingCourse.description}
                      onChange={(e) => updateEditingCourse('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل وصف الدورة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">
                      وصف الدورة (إنجليزي)
                    </label>
                    <textarea
                      value={editingCourse.description_en || ''}
                      onChange={(e) => updateEditingCourse('description_en', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course description in English"
                    />
                  </div>
                </div>

                {/* تفاصيل الدورة */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">
                      المدة
                    </label>
                    <input
                      type="text"
                      value={editingCourse.duration}
                      onChange={(e) => updateEditingCourse('duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثال: 4 أسابيع"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">
                      المستوى
                    </label>
                    <select
                      value={editingCourse.level_name}
                      onChange={(e) => updateEditingCourse('level_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="مبتدئ">مبتدئ</option>
                      <option value="متوسط">متوسط</option>
                      <option value="متقدم">متقدم</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">
                      الفئة
                    </label>
                    <select
                      value={editingCourse.category}
                      onChange={(e) => updateEditingCourse('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="رسم تقليدي">رسم تقليدي</option>
                      <option value="رسم رقمي">رسم رقمي</option>
                      <option value="بورتريه">بورتريه</option>
                    </select>
                  </div>
                </div>

                {/* السعر والمدرب */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">
                      السعر
                    </label>
                    <input
                      type="number"
                      value={editingCourse.price}
                      onChange={(e) => updateEditingCourse('price', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">
                      المدرب
                    </label>
                    <input
                      type="text"
                      value={editingCourse.instructor}
                      onChange={(e) => updateEditingCourse('instructor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="اسم المدرب"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">
                      رابط التسجيل
                    </label>
                    <input
                      type="text"
                      value={editingCourse.enrollment_url || ''}
                      onChange={(e) => updateEditingCourse('enrollment_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="#enroll-course"
                    />
                  </div>
                </div>

                {/* المميزات */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-arabic mb-2">
                    مميزات الدورة
                  </label>
                  <div className="space-y-2">
                    {(editingCourse.features || []).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeatures(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="أدخل ميزة الدورة"
                        />
                        <button
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addFeature()}
                      className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="font-arabic">إضافة ميزة</span>
                    </button>
                  </div>
                </div>

                {/* خيارات إضافية */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 font-arabic">
                    <input
                      type="checkbox"
                      checked={editingCourse.visible}
                      onChange={(e) => updateEditingCourse('visible', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>إظهار الدورة</span>
                  </label>

                  <label className="flex items-center gap-2 font-arabic">
                    <input
                      type="checkbox"
                      checked={editingCourse.featured}
                      onChange={(e) => updateEditingCourse('featured', e.target.checked)}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span>دورة مميزة</span>
                  </label>

                  <label className="flex items-center gap-2 font-arabic">
                    <input
                      type="checkbox"
                      checked={editingCourse.show_price || false}
                      onChange={(e) => updateEditingCourse('show_price', e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span>إظهار السعر</span>
                  </label>
                </div>

                {/* أزرار الحفظ */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setEditingCourse(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-arabic"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-arabic"
                  >
                    <Save className="w-4 h-4" />
                    {isAddingNew ? 'إضافة الدورة' : 'حفظ التغييرات'}
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

export default CoursesSettings;
