import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Settings,
  Globe
} from 'lucide-react';
import { settingsService } from '../../lib/supabase';
import { getCustomIcon } from '../icons/SocialIcons';

interface SocialMediaItem {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  url: string;
  iconColor: string;
  iconBg: string;
  visible: boolean;
}

interface SocialMediaSettingsProps {
  onDataChange?: () => void;
}

// دالة لعرض الأيقونة الصحيحة
const getIconComponent = (iconName: string, className?: string) => {
  // أولاً نتحقق من الأيقونات المخصصة
  const customIcon = getCustomIcon(iconName, { className, size: 24 });
  if (customIcon) return customIcon;

  // إذا لم توجد أيقونة مخصصة، نستخدم Globe كافتراضي
  return <Globe className={className || 'w-6 h-6'} />;
};

/**
 * مكون إدارة وسائل التواصل الاجتماعي المحسن
 * Enhanced Social Media Management Component
 */
const SocialMediaSettings: React.FC<SocialMediaSettingsProps> = ({ onDataChange }) => {
  const [socialMedia, setSocialMedia] = useState<SocialMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<SocialMediaItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // تحميل البيانات من قاعدة البيانات
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.get('socialMedia');
      if (data && Array.isArray(data)) {
        setSocialMedia(data);
      }
    } catch (error) {
      console.error('خطأ في تحميل وسائل التواصل:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // حفظ البيانات في قاعدة البيانات
  const saveData = async (newData: SocialMediaItem[]) => {
    try {
      const success = await settingsService.update('socialMedia', newData);
      if (success) {
        setSocialMedia(newData);
        onDataChange?.();
        console.log('✅ تم حفظ وسائل التواصل بنجاح');
        return true;
      } else {
        console.error('❌ فشل في حفظ وسائل التواصل');
        return false;
      }
    } catch (error) {
      console.error('❌ خطأ في حفظ وسائل التواصل:', error);
      return false;
    }
  };

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    loadData();
  }, []);

  // تبديل حالة الرؤية
  const toggleVisibility = async (id: string) => {
    const updatedData = socialMedia.map(item =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    
    const success = await saveData(updatedData);
    if (success) {
      const item = socialMedia.find(s => s.id === id);
      const status = item?.visible ? 'مخفي' : 'مرئي';
      console.log(`تم تغيير حالة "${item?.name}" إلى ${status}`);
    }
  };

  // بدء تعديل عنصر
  const startEdit = (item: SocialMediaItem) => {
    setEditingItem({ ...item });
    setIsAddingNew(false);
  };

  // إلغاء التعديل
  const cancelEdit = () => {
    setEditingItem(null);
    setIsAddingNew(false);
  };

  // حفظ التعديل
  const saveEdit = async () => {
    if (!editingItem) return;

    if (isAddingNew) {
      // إضافة عنصر جديد
      const newData = [...socialMedia, editingItem];
      const success = await saveData(newData);
      if (success) {
        alert('تم إضافة المنصة بنجاح');
      }
    } else {
      // تحديث عنصر موجود
      const updatedData = socialMedia.map(item =>
        item.id === editingItem.id ? editingItem : item
      );
      const success = await saveData(updatedData);
      if (success) {
        alert('تم تحديث المنصة بنجاح');
      }
    }

    setEditingItem(null);
    setIsAddingNew(false);
  };

  // حذف عنصر
  const deleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المنصة؟')) return;

    const updatedData = socialMedia.filter(item => item.id !== id);
    const success = await saveData(updatedData);
    if (success) {
      alert('تم حذف المنصة بنجاح');
    }
  };

  // إضافة منصة جديدة
  const addNewPlatform = () => {
    const newItem: SocialMediaItem = {
      id: `platform_${Date.now()}`,
      name: 'منصة جديدة',
      nameEn: 'New Platform',
      icon: 'Globe',
      url: 'https://example.com',
      iconColor: 'text-white',
      iconBg: 'bg-blue-600',
      visible: false
    };
    setEditingItem(newItem);
    setIsAddingNew(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="mr-3 font-arabic">جاري تحميل وسائل التواصل...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* العنوان والأزرار */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-800 font-arabic">
            إدارة وسائل التواصل الاجتماعي
          </h2>
        </div>
        
        <button
          onClick={addNewPlatform}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-arabic"
        >
          <Plus className="w-4 h-4" />
          إضافة منصة جديدة
        </button>
      </div>

      {/* قائمة المنصات */}
      <div className="grid gap-4">
        {socialMedia.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              {/* معلومات المنصة */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                  {getIconComponent(item.icon, `w-6 h-6 ${item.iconColor}`)}
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-800 font-arabic">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.nameEn}</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{item.url}</p>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(item.url, '_blank')}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  title="فتح الرابط"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => startEdit(item)}
                  className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
                  title="تعديل"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => toggleVisibility(item.id)}
                  className={`p-2 transition-colors ${
                    item.visible 
                      ? 'text-green-600 hover:text-green-700' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={item.visible ? 'إخفاء' : 'إظهار'}
                >
                  {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* نافذة التعديل */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold font-arabic">
                {isAddingNew ? 'إضافة منصة جديدة' : 'تعديل المنصة'}
              </h3>
              <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">
                  الاسم بالعربية
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">
                  الاسم بالإنجليزية
                </label>
                <input
                  type="text"
                  value={editingItem.nameEn}
                  onChange={(e) => setEditingItem({ ...editingItem, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">
                  الرابط
                </label>
                <input
                  type="url"
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={saveEdit}
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors font-arabic"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  حفظ
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-arabic"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaSettings;
