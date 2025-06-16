import React from 'react';
import { motion } from 'framer-motion';
import {
  Facebook, Instagram, Twitter, Youtube, MessageCircle, ArrowRight,
  Linkedin, Phone, Mail, Globe, Camera, Music,
  Send, Video, MapPin, Clock, MessageSquare, Image, AtSign
} from 'lucide-react';
import { getCustomIcon } from './icons/SocialIcons';
import { hoverAnimations, tapAnimations, cssTransitions } from '../lib/animations';

/**
 * دالة لتحويل اسم الأيقونة إلى مكون
 * Function to convert icon name to component
 */
const getIconComponent = (iconName: string, className?: string) => {
  // أولاً نتحقق من الأيقونات المخصصة
  const customIcon = getCustomIcon(iconName, { className, size: 20 });
  if (customIcon) return customIcon;

  // ثم نتحقق من أيقونات lucide-react
  const icons: { [key: string]: any } = {
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    MessageCircle, // واتساب (احتياطي) وريديت
    Linkedin,
    Phone, // للمكالمات
    Mail, // للإيميل
    Globe, // للمواقع الإلكترونية
    Camera, // لسناب شات (احتياطي)
    Music, // لتيك توك (احتياطي)
    Send, // لتيليجرام (احتياطي)
    Video, // لفايبر أو سكايب
    MapPin, // للمواقع
    Clock, // للمواعيد
    MessageSquare, // لديسكورد
    Image, // لبينتريست
    AtSign // لثريدز
  };

  const IconComponent = icons[iconName] || MessageCircle;
  return <IconComponent className={className} size={20} />;
};

/**
 * خصائص مكون وسائل التواصل الاجتماعي
 * Social Links Component Props
 */
interface SocialLinksProps {
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
}

/**
 * مكون روابط وسائل التواصل الاجتماعي
 * Social Links Component
 */
const SocialLinks: React.FC<SocialLinksProps> = ({ socialMedia }) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.0, duration: 0.6 }}
      className="mb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="text-center mb-4 relative"
      >
        <h3 className="text-lg font-semibold text-gray-700 font-arabic relative inline-block">
          وسائل التواصل الاجتماعي
          {/* خط تحت العنوان - Underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full"
          ></motion.div>
        </h3>
      </motion.div>

      <div className="space-y-3">
        {socialMedia.map((link, index) => {
          return (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
              whileHover={hoverAnimations.cardHover}
              whileTap={tapAnimations.cardTap}
              className={`w-full bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 shadow-lg hover:shadow-xl border border-white/50 hover:border-white/70 group block relative overflow-hidden ${cssTransitions.smooth}`}
            >
              {/* تأثير الخلفية المتحركة - Animated background effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]`}></div>

              {/* تأثير الإضاءة - Glow effect */}
              <div className={`absolute inset-0 rounded-2xl ${link.iconBg} opacity-0 group-hover:opacity-10 ${cssTransitions.fast}`}></div>

              <div className="relative flex items-center justify-between">
                <div className="flex items-center flex-row-reverse gap-4 md:gap-6">
                  {/* النص - Text */}
                  <div className="text-right">
                    <h4 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 font-arabic group-hover:text-gray-900 transition-colors duration-150 ease-out">
                      {link.name}
                    </h4>
                    <p className="text-sm md:text-base lg:text-lg text-gray-500 group-hover:text-gray-600 transition-colors duration-150 ease-out">
                      {link.nameEn}
                    </p>
                  </div>

                  {/* الأيقونة - Icon */}
                  <div className={`p-3 md:p-4 lg:p-5 rounded-xl ${link.iconBg} group-hover:scale-105 group-hover:rotate-2 transition-all duration-200 ease-out shadow-sm group-hover:shadow-md`}>
                    {getIconComponent(link.icon, `w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 ${link.iconColor} group-hover:scale-105 transition-transform duration-200 ease-out`)}
                  </div>
                </div>

                {/* سهم - Arrow */}
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 group-hover:scale-105 transition-all duration-200 ease-out" />
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.section>
  );
};

export default SocialLinks;
