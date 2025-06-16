import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Edit3, Trash2, Plus, Save, X } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  url: string;
  iconColor: string;
  iconBg: string;
  visible: boolean;
}

interface SectionsSettingsProps {
  data: Section[];
  onUpdate: (sections: Section[]) => void;
}

const SectionsSettings: React.FC<SectionsSettingsProps> = ({ data, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection, setNewSection] = useState<Partial<Section>>({
    name: '',
    nameEn: '',
    icon: 'BookOpen',
    url: '#',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    visible: true,
  });

  const iconOptions = [
    'BookOpen', 'Users', 'Image', 'PenTool', 'Award', 'Calendar',
    'Star', 'Heart', 'Music', 'Camera', 'Palette', 'Brush'
  ];

  const colorOptions = [
    { color: 'text-blue-600', bg: 'bg-blue-100', name: 'أزرق' },
    { color: 'text-green-600', bg: 'bg-green-100', name: 'أخضر' },
    { color: 'text-purple-600', bg: 'bg-purple-100', name: 'بنفسجي' },
    { color: 'text-orange-600', bg: 'bg-orange-100', name: 'برتقالي' },
    { color: 'text-red-600', bg: 'bg-red-100', name: 'أحمر' },
    { color: 'text-yellow-600', bg: 'bg-yellow-100', name: 'أصفر' },
    { color: 'text-pink-600', bg: 'bg-pink-100', name: 'وردي' },
    { color: 'text-indigo-600', bg: 'bg-indigo-100', name: 'نيلي' },
  ];

  const toggleVisibility = (id: string) => {
    const updated = data.map(section =>
      section.id === id ? { ...section, visible: !section.visible } : section
    );
    onUpdate(updated);
  };

  const deleteSection = (id: string) => {
    const updated = data.filter(section => section.id !== id);
    onUpdate(updated);
  };

  const updateSection = (id: string, field: string, value: any) => {
    const updated = data.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    );
    onUpdate(updated);
  };

  const addSection = () => {
    if (newSection.name && newSection.nameEn) {
      const section: Section = {
        id: Date.now().toString(),
        name: newSection.name!,
        nameEn: newSection.nameEn!,
        icon: newSection.icon!,
        url: newSection.url!,
        iconColor: newSection.iconColor!,
        iconBg: newSection.iconBg!,
        visible: newSection.visible!,
      };
      onUpdate([...data, section]);
      setNewSection({
        name: '',
        nameEn: '',
        icon: 'BookOpen',
        url: '#',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        visible: true,
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 font-arabic">إدارة الأقسام</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="font-arabic">إضافة قسم</span>
        </button>
      </div>

      {/* نموذج إضافة قسم جديد */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 p-6 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold font-arabic">إضافة قسم جديد</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">اسم القسم</label>
              <input
                type="text"
                value={newSection.name}
                onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">اسم القسم (إنجليزي)</label>
              <input
                type="text"
                value={newSection.nameEn}
                onChange={(e) => setNewSection({ ...newSection, nameEn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الرابط</label>
              <input
                type="text"
                value={newSection.url}
                onChange={(e) => setNewSection({ ...newSection, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الأيقونة</label>
              <select
                value={newSection.icon}
                onChange={(e) => setNewSection({ ...newSection, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">اللون</label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map(option => (
                  <button
                    key={option.color}
                    onClick={() => setNewSection({ 
                      ...newSection, 
                      iconColor: option.color, 
                      iconBg: option.bg 
                    })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      newSection.iconColor === option.color 
                        ? 'border-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${option.bg}`}
                  >
                    <span className="text-sm font-arabic">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={addSection}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span className="font-arabic">حفظ</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* قائمة الأقسام */}
      <div className="space-y-4">
        {data.map((section) => (
          <motion.div
            key={section.id}
            layout
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            {editingId === section.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">اسم القسم</label>
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">اسم القسم (إنجليزي)</label>
                    <input
                      type="text"
                      value={section.nameEn}
                      onChange={(e) => updateSection(section.id, 'nameEn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الرابط</label>
                    <input
                      type="text"
                      value={section.url}
                      onChange={(e) => updateSection(section.id, 'url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-arabic mb-1">الأيقونة</label>
                    <select
                      value={section.icon}
                      onChange={(e) => updateSection(section.id, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span className="font-arabic">حفظ</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${section.iconBg}`}>
                    <div className={`w-5 h-5 ${section.iconColor}`}>📄</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 font-arabic">{section.name}</h4>
                    <p className="text-sm text-gray-600">{section.nameEn}</p>
                    <p className="text-xs text-gray-500">{section.url}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVisibility(section.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      section.visible 
                        ? 'text-green-600 hover:bg-green-100' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => setEditingId(section.id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SectionsSettings;
