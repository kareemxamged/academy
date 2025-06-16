import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import SocialLinks from './components/SocialLinks';
import SocialIcons from './components/SocialIcons';
import SectionLinks from './components/SectionLinks';
import Courses from './components/Courses';
import Gallery from './components/Gallery';
import Instructors from './components/Instructors';
import LocationMap from './components/LocationMap';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import AdminButton from './components/AdminButton';
import { loadSiteData, defaultSiteData } from './data/siteData';
import { hoverAnimations, tapAnimations, cssTransitions } from './lib/animations';
import { instructorsService, coursesService, galleryService, techniquesService } from './lib/supabase';
import DrawingTechniques from './components/DrawingTechniques';
// import { FloatingWhatsAppButton } from './components/WhatsAppButton'; // معلق لأن الزر العائم مخفي

// تعريف نوع البيانات محلياً
interface SiteData {
  general: {
    siteName: string;
    siteNameEn: string;
    description: string;
    descriptionEn: string;
    logo: string;
    showLogo: boolean;
    whatsappNumber: string;
  };
  sections: {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    url: string;
    iconColor: string;
    iconBg: string;
    visible: boolean;
  }[];
  socialMedia: {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    url: string;
    iconColor: string;
    iconBg: string;
    visible: boolean;
  }[];
  courses: {
    id: number;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    duration: string;
    durationEn: string;
    level: string;
    levelEn: string;
    price: number;
    currency: string;
    showPrice: boolean;
    image: string;
    features: string[];
    featuresEn: string[];
    instructor: string;
    instructorEn: string;
    category: string;
    categoryEn: string;
    enrollmentUrl: string;
    visible: boolean;
    featured: boolean;
  }[];

  gallery: {
    id: number;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    image: string;
    category: string;
    categoryEn: string;
    studentName: string;
    studentNameEn: string;
    instructor: string;
    instructorEn: string;
    date: string;
    featured: boolean;
    visible: boolean;
    level: 'مبتدئ' | 'متوسط' | 'متقدم';
    levelEn: 'Beginner' | 'Intermediate' | 'Advanced';
  }[];
  instructors: {
    id: number;
    name: string;
    nameEn: string;
    title: string;
    titleEn: string;
    image: string;
    profileUrl: string;
    experience: string;
    experienceEn: string;
    specialties: string[];
    specialtiesEn: string[];
    rating: number;
    studentsCount: number;
    description: string;
    descriptionEn: string;
    visible: boolean;
  }[];
  location: {
    visible: boolean;
    name: string;
    nameEn: string;
    address: string;
    addressEn: string;
    phone: string;
    workingHours: string;
    workingHoursEn: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    mapsUrl: string;
  };
  pages: {
    showInstructors: boolean;
    showGallery: boolean;
    showSocialMedia: boolean;
    socialMediaStyle: 'icons' | 'cards';
    showLocation: boolean;
    showFooter: boolean;
  };
}

/**
 * المكون الرئيسي للتطبيق - أكاديمية الفن للرسم
 * Main App Component - Art Academy for Drawing
 */
function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'courses' | 'gallery' | 'instructors' | 'techniques' | 'contact'>('home');
  const [siteData, setSiteData] = useState<SiteData>(defaultSiteData);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [dynamicInstructors, setDynamicInstructors] = useState<any[]>([]);
  const [dynamicCourses, setDynamicCourses] = useState<any[]>([]);
  const [dynamicGallery, setDynamicGallery] = useState<any[]>([]);
  const [dynamicTechniques, setDynamicTechniques] = useState<any[]>([]);
  const [isLoadingDynamic, setIsLoadingDynamic] = useState(true);

  // تحميل البيانات الثابتة عند بدء التطبيق
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 جاري تحميل إعدادات الموقع...');
        const loadedData = await loadSiteData();
        setSiteData(loadedData);
        console.log('✅ تم تحميل إعدادات الموقع بنجاح');
      } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
        setSiteData(defaultSiteData);
      }
    };

    loadData();
  }, []);

  // تحميل البيانات الديناميكية من Supabase
  useEffect(() => {
    loadDynamicData();
  }, []);

  // إعداد الاشتراك في التحديثات المباشرة للمدربين
  useEffect(() => {
    const subscription = instructorsService.subscribeToChanges((payload) => {
      console.log('🔄 تحديث مباشر في المدربين:', payload);
      // إعادة تحميل بيانات المدربين عند حدوث تغيير
      loadInstructorsData();
    });

    // تنظيف الاشتراك عند إلغاء تحميل المكون
    return () => {
      instructorsService.unsubscribeFromChanges(subscription);
    };
  }, []);

  // تحديث دوري إضافي كل 30 ثانية للتأكد من التزامن
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 تحديث دوري لبيانات المدربين...');
      loadInstructorsData();
    }, 30000); // كل 30 ثانية

    return () => clearInterval(interval);
  }, []);

  // إعادة تحميل البيانات عند التركيز على النافذة
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 إعادة تحميل البيانات عند التركيز على النافذة...');
      loadInstructorsData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // تسجيل البيانات النهائية للمدربين (بدون dependency على safeSiteData لتجنب infinite loop)
  useEffect(() => {
    const finalInstructors = !isLoadingDynamic ? dynamicInstructors : (siteData.instructors || []);
    console.log('🏠 App.tsx - البيانات النهائية للمدربين:', finalInstructors);
    console.log('📊 App.tsx - عدد المدربين النهائي:', finalInstructors.length);
    console.log('⏳ App.tsx - حالة التحميل:', isLoadingDynamic);
    console.log('💾 App.tsx - المدربين الديناميكيين:', dynamicInstructors);
  }, [isLoadingDynamic, dynamicInstructors.length]); // استخدام length بدلاً من المصفوفة كاملة

  // دالة تحويل بيانات المدربين من قاعدة البيانات إلى تنسيق العرض
  const transformInstructorData = (instructor: any) => ({
    id: instructor.id,
    name: instructor.name,
    nameEn: instructor.name_en || instructor.name,
    title: instructor.title,
    titleEn: instructor.title_en || instructor.title,
    image: instructor.image_url || '',
    profileUrl: instructor.profile_url || '',
    experience: instructor.experience || '',
    experienceEn: instructor.experience_en || instructor.experience || '',
    specialties: instructor.specialties || [],
    specialtiesEn: instructor.specialties_en || instructor.specialties || [],
    rating: instructor.rating || 0,
    studentsCount: instructor.students_count || 0,
    description: instructor.description || '',
    descriptionEn: instructor.description_en || instructor.description || '',
    visible: instructor.visible
  });

  // دالة تحويل بيانات الدورات من قاعدة البيانات إلى تنسيق العرض
  const transformCourseData = (course: any) => ({
    id: course.id,
    title: course.title,
    titleEn: course.title_en || course.title,
    description: course.description || '',
    descriptionEn: course.description_en || course.description || '',
    image: '', // إزالة الاعتماد على صورة الدورة
    duration: course.duration,
    durationEn: course.duration_en || course.duration,
    level: course.level_name, // تصحيح: استخدام level_name بدلاً من level
    levelEn: course.level_name_en || course.level_name,
    price: course.price || 0,
    currency: course.currency || 'ريال سعودي',
    showPrice: course.show_price !== false, // تصحيح: استخدام show_price
    instructor: course.instructor,
    instructorEn: course.instructor_en || course.instructor,
    features: course.features || [],
    featuresEn: course.features_en || course.features || [],
    category: course.category,
    categoryEn: course.category_en || course.category,
    enrollmentUrl: '#enroll-course', // قيمة ثابتة لتفعيل الواتساب
    featured: course.featured || false,
    visible: course.visible !== false
  });

  // دالة تحويل بيانات المعرض من قاعدة البيانات إلى تنسيق العرض
  const transformGalleryData = (item: any) => ({
    id: item.id,
    title: item.title,
    titleEn: item.title_en || item.title,
    description: item.description,
    descriptionEn: item.description_en || item.description,
    image: item.image_url || '',
    category: item.category,
    categoryEn: item.category_en || item.category,
    studentName: item.student_name,
    studentNameEn: item.student_name_en || item.student_name,
    instructor: item.instructor,
    instructorEn: item.instructor_en || item.instructor,
    date: item.completion_date,
    featured: item.featured || false,
    visible: item.visible,
    level: item.level,
    levelEn: item.level_en || item.level
  });

  // دالة تحويل بيانات التقنيات من قاعدة البيانات إلى تنسيق العرض
  const transformTechniqueData = (technique: any) => ({
    id: technique.id,
    title: technique.title,
    titleEn: technique.title_en || technique.title,
    description: technique.description,
    descriptionEn: technique.description_en || technique.description,
    content: technique.content,
    contentEn: technique.content_en || technique.content,
    difficulty_level: technique.difficulty_level,
    difficulty_level_en: technique.difficulty_level_en || technique.difficulty_level,
    category: technique.category,
    categoryEn: technique.category_en || technique.category,
    tools_needed: technique.tools_needed || [],
    tools_needed_en: technique.tools_needed_en || technique.tools_needed || [],
    steps: technique.steps || [],
    steps_en: technique.steps_en || technique.steps || [],
    tips: technique.tips || [],
    tips_en: technique.tips_en || technique.tips || [],
    image_url: technique.image_url || '',
    video_url: technique.video_url || '',
    estimated_time: technique.estimated_time || '',
    estimated_time_en: technique.estimated_time_en || technique.estimated_time || '',
    prerequisites: technique.prerequisites || [],
    prerequisites_en: technique.prerequisites_en || technique.prerequisites || [],
    related_techniques: technique.related_techniques || [],
    featured: technique.featured || false,
    visible: technique.visible,
    view_count: technique.view_count || 0,
    created_at: technique.created_at,
    updated_at: technique.updated_at
  });

  // دالة منفصلة لتحميل بيانات المدربين فقط
  const loadInstructorsData = async () => {
    try {
      console.log('🔄 إعادة تحميل بيانات المدربين...');
      const instructorsData = await instructorsService.getVisible();
      console.log('📊 بيانات المدربين من قاعدة البيانات:', instructorsData);
      const transformedInstructors = instructorsData.map(transformInstructorData);
      console.log('🔄 بيانات المدربين بعد التحويل:', transformedInstructors);
      setDynamicInstructors(transformedInstructors);
      console.log('✅ تم تحديث بيانات المدربين بنجاح - العدد:', transformedInstructors.length);
    } catch (error) {
      console.error('❌ خطأ في تحميل بيانات المدربين:', error);
    }
  };



  const loadDynamicData = async () => {
    setIsLoadingDynamic(true);
    try {
      // تحميل المدربين من Supabase وتحويلهم
      const instructorsData = await instructorsService.getVisible();
      const transformedInstructors = instructorsData.map(transformInstructorData);
      setDynamicInstructors(transformedInstructors);

      // تحميل الدورات من Supabase وتحويلها
      const coursesData = await coursesService.getVisible();
      const transformedCourses = coursesData.map(transformCourseData);
      setDynamicCourses(transformedCourses);

      // تحميل المعرض من Supabase وتحويله
      const galleryData = await galleryService.getVisible();
      const transformedGallery = galleryData.map(transformGalleryData);
      setDynamicGallery(transformedGallery);

      // تحميل التقنيات من Supabase وتحويلها
      const techniquesData = await techniquesService.getVisible();
      const transformedTechniques = techniquesData.map(transformTechniqueData);
      setDynamicTechniques(transformedTechniques);
    } catch (error) {
      console.error('خطأ في تحميل البيانات الديناميكية:', error);
    } finally {
      setIsLoadingDynamic(false);
    }
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page as 'home' | 'courses' | 'gallery' | 'instructors' | 'techniques' | 'contact');
  };

  const handleDataChange = (newData: SiteData) => {
    // تحديث البيانات المحلية فقط بدون إعادة تحميل
    setSiteData(newData);

    // لا نحتاج لإعادة تحميل البيانات هنا لأن ذلك يسبب إعادة رسم المكونات
    // البيانات محدثة بالفعل في newData
  };

  // فحص إذا كانت البيانات محملة
  if (!siteData || !siteData.general || isLoadingDynamic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-arabic">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // التأكد من وجود البيانات الأساسية ودمج البيانات الديناميكية
  const safeSiteData = {
    ...siteData,
    courses: dynamicCourses.length > 0 ? dynamicCourses : (siteData.courses || []),
    // استخدام البيانات من قاعدة البيانات دائماً للمدربين، حتى لو كانت فارغة
    instructors: !isLoadingDynamic ? dynamicInstructors : (siteData.instructors || []),
    gallery: dynamicGallery.length > 0 ? dynamicGallery : (siteData.gallery || []),
    techniques: dynamicTechniques.length > 0 ? dynamicTechniques : [],
    sections: siteData.sections || [],
    socialMedia: siteData.socialMedia || []
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* خلفية فنية متحركة - Artistic animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* تدرج أساسي - Base gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-100/60 via-purple-100/40 to-red-100/60"></div>

        {/* دوائر متحركة - Animated circles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-yellow-300/50 to-orange-300/40 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-red-300/50 to-pink-300/40 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-blue-200/20 rounded-full blur-3xl"
        />

        {/* عناصر فنية إضافية - Additional artistic elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-yellow-300/20 to-orange-300/15 rounded-full blur-2xl"
        />

        <motion.div
          animate={{
            y: [0, 15, 0],
            x: [0, -8, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute bottom-40 right-16 w-24 h-24 bg-gradient-to-br from-red-300/25 to-pink-300/20 rounded-full blur-2xl"
        />

        <motion.div
          animate={{
            y: [0, -10, 0],
            x: [0, 12, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute top-1/3 left-16 w-20 h-20 bg-gradient-to-br from-blue-300/30 to-purple-300/25 rounded-full blur-xl"
        />

        {/* نقاط متحركة صغيرة - Small floating dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8
            }}
            className={`absolute w-2 h-2 rounded-full blur-sm`}
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 3) * 20}%`,
              background: i % 3 === 0
                ? 'linear-gradient(45deg, #fbbf24, #f59e0b)'
                : i % 3 === 1
                ? 'linear-gradient(45deg, #ef4444, #dc2626)'
                : 'linear-gradient(45deg, #8b5cf6, #7c3aed)'
            }}
          />
        ))}

        {/* خطوط متحركة ناعمة - Soft animated lines */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 right-1/4 w-32 h-32 opacity-10"
        >
          <div className="w-full h-full border-2 border-dashed border-yellow-400 rounded-full"></div>
        </motion.div>

        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 left-1/4 w-24 h-24 opacity-10"
        >
          <div className="w-full h-full border-2 border-dashed border-red-400 rounded-full"></div>
        </motion.div>
      </div>

      {/* المحتوى الرئيسي - Main content */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
          {/* الهيدر - Header */}
          <Header siteData={safeSiteData.general} />

          {/* وسائل التواصل الاجتماعي - Social Media */}
          {safeSiteData.pages.showSocialMedia && (
            <>
              {safeSiteData.pages.socialMediaStyle === 'icons' ? (
                <SocialIcons socialMedia={safeSiteData.socialMedia.filter(s => s.visible)} />
              ) : (
                <SocialLinks socialMedia={safeSiteData.socialMedia.filter(s => s.visible)} />
              )}
            </>
          )}

          {/* المحتوى الديناميكي - Dynamic Content */}
          {currentPage === 'home' && (
            <>
              {/* روابط أقسام الأكاديمية - Academy sections links */}
              <SectionLinks
                onPageChange={handlePageChange}
                sections={safeSiteData.sections.filter(s => s.visible)}
              />

              {/* موقع الأكاديمية - Academy Location */}
              {safeSiteData.pages.showLocation && safeSiteData.location.visible && (
                <LocationMap locationData={safeSiteData.location} />
              )}
            </>
          )}

          {currentPage === 'courses' && (
            <>
              {/* زر العودة - Back Button */}
              <motion.button
                onClick={() => setCurrentPage('home')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={hoverAnimations.buttonHover}
                whileTap={tapAnimations.buttonTap}
                className={`mb-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg text-gray-700 hover:text-gray-900 group ${cssTransitions.smooth}`}
              >
                <motion.div
                  whileHover={{ x: -2 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  ←
                </motion.div>
                <span className="font-arabic">العودة للرئيسية</span>
              </motion.button>

              {/* صفحة الدورات - Courses Page */}
              <Courses
                courses={safeSiteData.courses.filter(c => c.visible)}
                whatsappNumber={safeSiteData.general.whatsappNumber}
              />
            </>
          )}

          {currentPage === 'gallery' && safeSiteData.pages.showGallery && (
            <>
              {/* زر العودة - Back Button */}
              <motion.button
                onClick={() => setCurrentPage('home')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={hoverAnimations.buttonHover}
                whileTap={tapAnimations.buttonTap}
                className={`mb-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg text-gray-700 hover:text-gray-900 group ${cssTransitions.smooth}`}
              >
                <motion.div
                  whileHover={{ x: -2 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  ←
                </motion.div>
                <span className="font-arabic">العودة للرئيسية</span>
              </motion.button>

              {/* صفحة معرض الأعمال - Gallery Page */}
              <Gallery />
            </>
          )}

          {currentPage === 'instructors' && safeSiteData.pages.showInstructors && (
            <>
              {/* زر العودة - Back Button */}
              <motion.button
                onClick={() => setCurrentPage('home')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={hoverAnimations.buttonHover}
                whileTap={tapAnimations.buttonTap}
                className={`mb-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg text-gray-700 hover:text-gray-900 group ${cssTransitions.smooth}`}
              >
                <motion.div
                  whileHover={{ x: -2 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  ←
                </motion.div>
                <span className="font-arabic">العودة للرئيسية</span>
              </motion.button>

              {/* صفحة المدربين - Instructors Page */}
              <Instructors
                instructors={safeSiteData.instructors.filter(i => i.visible !== false)}
                whatsappNumber={safeSiteData.general.whatsappNumber}
              />
            </>
          )}

          {currentPage === 'techniques' && (
            <>
              {/* زر العودة - Back Button */}
              <motion.button
                onClick={() => setCurrentPage('home')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={hoverAnimations.buttonHover}
                whileTap={tapAnimations.buttonTap}
                className={`mb-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg text-gray-700 hover:text-gray-900 group ${cssTransitions.smooth}`}
              >
                <motion.div
                  whileHover={{ x: -2 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  ←
                </motion.div>
                <span className="font-arabic">العودة للرئيسية</span>
              </motion.button>

              {/* صفحة تقنيات الرسم - Drawing Techniques Page */}
              <DrawingTechniques />
            </>
          )}

          {/* الفوتر - Footer */}
          {safeSiteData.pages.showFooter && <Footer siteName={safeSiteData.general.siteName} />}
        </div>

        {/* زر لوحة التحكم - Admin Button */}
        <AdminButton onOpenAdmin={() => setIsAdminOpen(true)} />

        {/* زر الواتساب العائم - Floating WhatsApp Button */}
        {/* تم إخفاء زر الواتساب العائم بناءً على طلب المستخدم */}
        {/* <FloatingWhatsAppButton
          phoneNumber={safeSiteData.general.whatsappNumber}
          message="مرحباً، أريد الاستفسار عن دورات الرسم في أكاديمية ميمو"
        /> */}

        {/* لوحة التحكم - Admin Panel */}
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => {
            setIsAdminOpen(false);
            // لا نحتاج لإعادة تحميل البيانات عند الإغلاق
            // البيانات محدثة بالفعل من خلال عمليات الحفظ
          }}
          siteData={safeSiteData}
          onDataChange={handleDataChange}
        />
      </div>

      {/* تأثيرات بصرية إضافية - Additional visual effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* نقاط متحركة - Animated dots */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
