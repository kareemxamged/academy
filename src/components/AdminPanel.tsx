import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Save,
  RotateCcw,
  Eye,
  X,
  Home,
  Monitor,
  BookOpen,
  Users,
  MapPin,
  Share2,
  Image,
  PenTool
} from 'lucide-react';
import { saveSiteData, resetSiteData, getDataServiceStatus } from '../data/siteData';

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
import SectionsSettings from './admin/SectionsSettings';
import CoursesSettings from './admin/CoursesSettings';
import GallerySettings from './admin/GallerySettings';
import InstructorsManagement from './admin/InstructorsSettings';
import TechniquesSettings from './admin/TechniquesSettings';
import { GeneralSettings, SocialSettings, LocationSettings, PagesSettings } from './admin/AdminSettings';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  siteData: SiteData;
  onDataChange: (data: SiteData) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, siteData, onDataChange }) => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [localData, setLocalData] = useState<SiteData>(siteData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serviceStatus, setServiceStatus] = useState<any>(null);

  useEffect(() => {
    setLocalData(siteData);
  }, [siteData]);

  useEffect(() => {
    // الحصول على حالة الخدمة
    const fetchServiceStatus = async () => {
      const status = await getDataServiceStatus();
      setServiceStatus(status);
    };
    fetchServiceStatus();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      console.log('🔄 جاري حفظ البيانات في قاعدة البيانات...');
      const success = await saveSiteData(localData);
      if (success) {
        onDataChange(localData);
        setHasChanges(false);
        setSaveStatus('success');
        console.log('✅ تم حفظ البيانات بنجاح في قاعدة البيانات');

        // إخفاء رسالة النجاح بعد 3 ثوان
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        console.error('❌ فشل في حفظ البيانات');
        setTimeout(() => setSaveStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('❌ خطأ في الحفظ:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);

    try {
      console.log('🔄 جاري إعادة تعيين البيانات...');
      const defaultData = await resetSiteData();
      setLocalData(defaultData);
      onDataChange(defaultData);
      setHasChanges(false);
      setSaveStatus('success');
      console.log('✅ تم إعادة تعيين البيانات بنجاح');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('❌ خطأ في إعادة التعيين:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateData = (path: string, value: any) => {
    const newData = { ...localData };
    const keys = path.split('.');
    let current: any = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setLocalData(newData);
    setHasChanges(true);
  };

  const tabs = [
    { id: 'general', name: 'عام', icon: Home },
    { id: 'sections', name: 'الأقسام', icon: Monitor },
    { id: 'courses', name: 'الدورات', icon: BookOpen },
    { id: 'gallery', name: 'المعرض', icon: Image },
    { id: 'instructors', name: 'المدربون', icon: Users },
    { id: 'techniques', name: 'تقنيات الرسم', icon: PenTool },
    { id: 'social', name: 'التواصل', icon: Share2 },
    { id: 'location', name: 'الموقع', icon: MapPin },
    { id: 'pages', name: 'الصفحات', icon: Eye },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* رأس لوحة التحكم - Admin Panel Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold font-arabic">لوحة التحكم</h2>
                {serviceStatus && (
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <div className={`w-2 h-2 rounded-full ${
                      serviceStatus.firebaseEnabled ? 'bg-green-400' : 'bg-yellow-400'
                    }`}></div>
                    <span>
                      {serviceStatus.firebaseEnabled ? 'متصل بـ Firebase' : 'تخزين محلي'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* مؤشر حالة الاتصال بقاعدة البيانات */}
              {serviceStatus && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
                  serviceStatus.databaseConnected
                    ? 'bg-green-500/20 border-green-400/30'
                    : 'bg-red-500/20 border-red-400/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    serviceStatus.databaseConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm font-arabic">
                    {serviceStatus.databaseConnected ? 'متصل بقاعدة البيانات' : 'غير متصل'}
                  </span>
                </div>
              )}

              {/* مؤشر حالة الحفظ */}
              {saveStatus === 'success' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-lg border border-green-400/30"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-arabic">تم الحفظ في قاعدة البيانات</span>
                </motion.div>
              )}

              {saveStatus === 'error' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-lg border border-red-400/30"
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-sm font-arabic">خطأ في الحفظ</span>
                </motion.div>
              )}

              {hasChanges && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 rounded-lg transition-colors"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span className="font-arabic">{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-arabic">إعادة تعيين</span>
                  </button>
                </motion.div>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* الشريط الجانبي - Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-arabic">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* المحتوى الرئيسي - Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'general' && (
                <GeneralSettings data={localData.general} onUpdate={(field, value) => updateData(`general.${field}`, value)} />
              )}
              {activeTab === 'sections' && (
                <SectionsSettings data={localData.sections} onUpdate={(sections) => updateData('sections', sections)} />
              )}
              {activeTab === 'courses' && (
                <CoursesSettings />
              )}
              {activeTab === 'gallery' && (
                <GallerySettings onDataChange={onDataChange} />
              )}
              {activeTab === 'social' && (
                <SocialSettings data={localData.socialMedia} onUpdate={(social) => updateData('socialMedia', social)} />
              )}
              {activeTab === 'instructors' && (
                <InstructorsManagement onDataChange={onDataChange} />
              )}
              {activeTab === 'techniques' && (
                <TechniquesSettings />
              )}
              {activeTab === 'location' && (
                <LocationSettings data={localData.location} onUpdate={(field, value) => updateData(`location.${field}`, value)} />
              )}
              {activeTab === 'pages' && (
                <PagesSettings data={localData.pages} onUpdate={(field, value) => updateData(`pages.${field}`, value)} />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// سأضيف باقي المكونات في الملفات التالية
export default AdminPanel;
