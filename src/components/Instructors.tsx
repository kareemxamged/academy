import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Star, Award, Users, Clock, CheckCircle } from 'lucide-react';
import { hoverAnimations, tapAnimations, cssTransitions } from '../lib/animations';
import { InstructorWhatsAppButton } from './WhatsAppButton';

/**
 * خصائص مكون المدربين
 * Instructors Component Props
 */
interface InstructorsProps {
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
  whatsappNumber?: string;
}

/**
 * مكون صفحة المدربين
 * Instructors Page Component
 */
const Instructors: React.FC<InstructorsProps> = ({ instructors, whatsappNumber }) => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [previousInstructorsCount, setPreviousInstructorsCount] = useState(instructors.length);

  // تسجيل البيانات المستلمة لمراقبة المشكلة (استخدام length لتجنب infinite loop)
  useEffect(() => {
    console.log('👥 مكون المدربين - عدد المدربين المستلمين:', instructors.length);
    if (instructors.length > 0) {
      console.log('👥 مكون المدربين - أول مدرب:', instructors[0]);
    }
  }, [instructors.length]);

  // مراقبة تغييرات في عدد المدربين لإظهار إشعار التحديث
  useEffect(() => {
    if (instructors.length !== previousInstructorsCount && previousInstructorsCount > 0) {
      console.log('🔄 تغيير في عدد المدربين:', { من: previousInstructorsCount, إلى: instructors.length });
      setShowUpdateNotification(true);
      const timer = setTimeout(() => {
        setShowUpdateNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
    setPreviousInstructorsCount(instructors.length);
  }, [instructors.length, previousInstructorsCount]);

  const handleVisitProfile = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="mb-8"
      id="instructors"
    >
      {/* إشعار التحديث - Update Notification */}
      <AnimatePresence>
        {showUpdateNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-arabic">تم تحديث قائمة المدربين</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* عنوان القسم - Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center mb-6 relative"
      >
        <h2 className="text-2xl font-bold text-gray-800 font-arabic relative inline-block">
          فريق المدربين
          {/* خط تحت العنوان - Underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
          ></motion.div>
        </h2>
        <p className="text-gray-600 mt-2 text-sm">
          تعرف على نخبة من أفضل المدربين المحترفين
        </p>
      </motion.div>

      {/* قائمة المدربين - Instructors List */}
      <div className="space-y-4">
        {instructors.map((instructor, index) => (
          <motion.div
            key={instructor.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
            className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl border border-white/60 hover:border-green-200 group relative overflow-hidden ${cssTransitions.smooth}`}
          >
            {/* تأثير الخلفية المتحركة - Animated background effect */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-green-100/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-400 ease-out`}></div>

            {/* تأثير الإضاءة - Glow effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-green-100/30 to-blue-100/20 opacity-0 group-hover:opacity-100 ${cssTransitions.fast}`}></div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* صورة المدرب - Instructor Image */}
              <motion.div
                whileHover={hoverAnimations.imageHover}
                className="flex-shrink-0 mx-auto md:mx-0"
              >
                <div className={`w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:border-green-200 ${cssTransitions.colors}`}>
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className={`w-full h-full object-cover group-hover:scale-105 ${cssTransitions.transform}`}
                  />
                </div>
              </motion.div>

              {/* معلومات المدرب - Instructor Info */}
              <div className="flex-1 min-w-0 text-center md:text-right">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    {/* الاسم والمنصب - Name and Title */}
                    <h3 className={`text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 font-arabic group-hover:text-gray-900 mb-2 ${cssTransitions.colors}`}>
                      {instructor.name}
                    </h3>
                    <p className={`text-base md:text-lg text-gray-600 group-hover:text-gray-700 mb-4 ${cssTransitions.colors}`}>
                      {instructor.title}
                    </p>

                    {/* الإحصائيات - Statistics */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm md:text-base text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-current" />
                        <span className="font-medium">{instructor.rating}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="font-medium">{instructor.studentsCount} طالب</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="font-medium">{instructor.experience}</span>
                      </div>
                    </div>

                    {/* التخصصات - Specialties */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                      {instructor.specialties.slice(0, 4).map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-2 bg-green-100 text-green-700 text-sm md:text-base rounded-full font-arabic font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                      {instructor.specialties.length > 4 && (
                        <span className="px-3 py-2 bg-gray-100 text-gray-600 text-sm md:text-base rounded-full font-medium">
                          +{instructor.specialties.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* أزرار التفاعل - Action Buttons */}
                  <div className="flex flex-col gap-3 mx-auto md:mx-0">
                    {/* زر زيارة الملف الشخصي - Visit Profile Button */}
                    <motion.button
                      onClick={() => handleVisitProfile(instructor.profileUrl)}
                      whileHover={hoverAnimations.buttonHover}
                      whileTap={tapAnimations.buttonTap}
                      className={`flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-base md:text-lg font-medium rounded-xl hover:from-green-600 hover:to-blue-600 shadow-md hover:shadow-lg group/btn ${cssTransitions.smooth}`}
                    >
                      <span className="font-arabic">زيارة الملف الشخصي</span>
                      <ExternalLink className={`w-5 h-5 md:w-6 md:h-6 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 ${cssTransitions.transform}`} />
                    </motion.button>

                    {/* زر التواصل عبر الواتساب - WhatsApp Contact Button */}
                    {whatsappNumber && (
                      <InstructorWhatsAppButton
                        phoneNumber={whatsappNumber}
                        instructorName={instructor.name}
                        className="w-full justify-center"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* الوصف - Description */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
              className="mt-6 pt-6 border-t border-gray-100"
            >
              <p className="text-base md:text-lg text-gray-600 leading-relaxed font-arabic text-center md:text-right">
                {instructor.description}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* رسالة تشجيعية - Encouraging Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-6 text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Award className="w-5 h-5 text-green-600" />
          <h4 className="text-lg font-semibold text-gray-800 font-arabic">
            انضم إلى رحلة التعلم
          </h4>
        </div>
        <p className="text-sm text-gray-600 font-arabic">
          تعلم من أفضل المدربين واكتشف موهبتك الفنية معنا
        </p>
      </motion.div>
    </motion.section>
  );
};

export default Instructors;
