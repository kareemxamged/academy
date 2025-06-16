import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Clock, Eye, Filter, Search,
  ChevronRight, Palette, PenTool, Brush, Award,
  Users, Target, Lightbulb, Play, ExternalLink
} from 'lucide-react';
import { hoverAnimations } from '../lib/animations';
import { techniquesService } from '../lib/supabase';
import type { DrawingTechnique } from '../types/database';

interface DrawingTechniquesProps {
  // يمكن إضافة خصائص إضافية هنا إذا لزم الأمر
}

const DrawingTechniques: React.FC<DrawingTechniquesProps> = () => {
  const [techniques, setTechniques] = useState<DrawingTechnique[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<DrawingTechnique | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // تحميل البيانات من Supabase
  useEffect(() => {
    const loadTechniques = async () => {
      setLoading(true);
      try {
        const data = await techniquesService.getVisible();
        setTechniques(data);
      } catch (error) {
        console.error('خطأ في تحميل تقنيات الرسم:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTechniques();
  }, []);

  // الحصول على الفئات المتاحة
  const categories = ['الكل', ...Array.from(new Set(techniques.map(tech => tech.category)))];
  
  // مستويات الصعوبة
  const difficultyLevels = ['الكل', 'مبتدئ', 'متوسط', 'متقدم'];

  // فلترة التقنيات
  const filteredTechniques = techniques.filter(tech => {
    const matchesCategory = selectedCategory === 'الكل' || tech.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'الكل' || tech.difficulty_level === selectedDifficulty;
    const matchesSearch = searchQuery === '' || 
      tech.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // ترتيب التقنيات (المميزة أولاً)
  const sortedTechniques = [...filteredTechniques].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
  });

  const openTechniqueDetail = async (technique: DrawingTechnique) => {
    setSelectedTechnique(technique);
    setIsDetailOpen(true);
  };

  const closeTechniqueDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedTechnique(null), 300);
  };

  const getDifficultyColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'مبتدئ': 'bg-green-100 text-green-800',
      'متوسط': 'bg-yellow-100 text-yellow-800',
      'متقدم': 'bg-red-100 text-red-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'رسم تقليدي': <PenTool className="w-5 h-5" />,
      'رسم رقمي': <Palette className="w-5 h-5" />,
      'ألوان مائية': <Brush className="w-5 h-5" />,
    };
    return icons[category] || <BookOpen className="w-5 h-5" />;
  };

  // إذا كان التحميل جارياً
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600 font-arabic">جاري تحميل تقنيات الرسم...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* العنوان الرئيسي */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-arabic">
            تقنيات الرسم
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-arabic">
            اكتشف تقنيات الرسم المختلفة وتعلم من خبرات المحترفين
          </p>
        </motion.div>

        {/* شريط البحث والفلاتر */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/60"
        >
          {/* شريط البحث */}
          <div className="relative mb-6">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث في التقنيات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
            />
          </div>

          {/* الفلاتر */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* فلتر الفئات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                <Filter className="inline w-4 h-4 ml-1" />
                الفئة
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* فلتر مستوى الصعوبة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-arabic">
                <Target className="inline w-4 h-4 ml-1" />
                مستوى الصعوبة
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-arabic"
              >
                {difficultyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* شبكة التقنيات */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {sortedTechniques.map((technique, index) => (
              <motion.div
                key={technique.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative"
              >
                <motion.div
                  whileHover={hoverAnimations.cardHover}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full border border-white/60"
                  onClick={() => openTechniqueDetail(technique)}
                >
                  {/* شارة مميز */}
                  {technique.featured && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span className="font-arabic">مميز</span>
                      </div>
                    </div>
                  )}

                  {/* الصورة */}
                  {technique.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={technique.image_url}
                        alt={technique.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <ChevronRight className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  )}

                  {/* المحتوى */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {getCategoryIcon(technique.category)}
                      <span className="text-sm text-gray-600 font-arabic">{technique.category}</span>
                    </div>

                    <h3 className="font-bold text-xl text-gray-800 mb-3 font-arabic line-clamp-2">
                      {technique.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 font-arabic line-clamp-3">
                      {technique.description}
                    </p>

                    {/* معلومات إضافية */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span className="font-arabic">{technique.estimated_time}</span>
                        </div>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(technique.difficulty_level)}`}>
                          {technique.difficulty_level}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span>{technique.view_count} مشاهدة</span>
                        </div>
                        
                        {technique.video_url && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Play className="w-4 h-4" />
                            <span className="font-arabic">فيديو</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* رسالة عدم وجود نتائج */}
        {sortedTechniques.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <BookOpen className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2 font-arabic">
              لا توجد تقنيات متاحة
            </h3>
            <p className="text-gray-500 font-arabic">
              جرب تغيير معايير البحث أو الفلترة
            </p>
          </motion.div>
        )}
      </div>

      {/* نافذة تفاصيل التقنية */}
      <AnimatePresence>
        {isDetailOpen && selectedTechnique && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeTechniqueDetail}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl max-h-[90vh] bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden overflow-y-auto border border-white/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* زر الإغلاق */}
              <button
                onClick={closeTechniqueDetail}
                className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="p-8">
                {/* العنوان والمعلومات الأساسية */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    {getCategoryIcon(selectedTechnique.category)}
                    <span className="text-orange-600 font-medium font-arabic">{selectedTechnique.category}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedTechnique.difficulty_level)}`}>
                      {selectedTechnique.difficulty_level}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-800 mb-4 font-arabic">
                    {selectedTechnique.title}
                  </h1>

                  <p className="text-gray-600 text-lg mb-6 font-arabic">
                    {selectedTechnique.description}
                  </p>

                  {/* معلومات سريعة */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-orange-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-orange-600 mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium font-arabic">الوقت المقدر</span>
                      </div>
                      <p className="text-gray-800 font-arabic">{selectedTechnique.estimated_time}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Eye className="w-5 h-5" />
                        <span className="font-medium font-arabic">المشاهدات</span>
                      </div>
                      <p className="text-gray-800">{selectedTechnique.view_count} مشاهدة</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <Target className="w-5 h-5" />
                        <span className="font-medium font-arabic">المستوى</span>
                      </div>
                      <p className="text-gray-800 font-arabic">{selectedTechnique.difficulty_level}</p>
                    </div>
                  </div>
                </div>

                {/* المحتوى التفصيلي */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* العمود الأيسر */}
                  <div className="space-y-6">
                    {/* الأدوات المطلوبة */}
                    {selectedTechnique.tools_needed && selectedTechnique.tools_needed.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 font-arabic flex items-center gap-2">
                          <PenTool className="w-5 h-5 text-orange-600" />
                          الأدوات المطلوبة
                        </h3>
                        <ul className="space-y-2">
                          {selectedTechnique.tools_needed.map((tool, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-700 font-arabic">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              {tool}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* المتطلبات المسبقة */}
                    {selectedTechnique.prerequisites && selectedTechnique.prerequisites.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 font-arabic flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          المتطلبات المسبقة
                        </h3>
                        <ul className="space-y-2">
                          {selectedTechnique.prerequisites.map((req, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-700 font-arabic">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* العمود الأيمن */}
                  <div className="space-y-6">
                    {/* خطوات التطبيق */}
                    {selectedTechnique.steps && selectedTechnique.steps.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 font-arabic flex items-center gap-2">
                          <Users className="w-5 h-5 text-green-600" />
                          خطوات التطبيق
                        </h3>
                        <ol className="space-y-3">
                          {selectedTechnique.steps.map((step, index) => (
                            <li key={index} className="flex gap-3 text-gray-700 font-arabic">
                              <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* نصائح مهمة */}
                    {selectedTechnique.tips && selectedTechnique.tips.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 font-arabic flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          نصائح مهمة
                        </h3>
                        <ul className="space-y-2">
                          {selectedTechnique.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700 font-arabic">
                              <Lightbulb className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* المحتوى التفصيلي */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 font-arabic">
                    شرح مفصل
                  </h3>
                  <div className="prose prose-lg max-w-none font-arabic text-gray-700 leading-relaxed">
                    {selectedTechnique.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* رابط الفيديو */}
                {selectedTechnique.video_url && (
                  <div className="mt-8 text-center">
                    <a
                      href={selectedTechnique.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors duration-200 font-arabic"
                    >
                      <Play className="w-5 h-5" />
                      مشاهدة الفيديو التعليمي
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DrawingTechniques;
