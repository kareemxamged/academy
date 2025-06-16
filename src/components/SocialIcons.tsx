import React from 'react';
import { motion } from 'framer-motion';
import {
  Facebook, Instagram, Twitter, Youtube, MessageCircle,
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
 * خصائص مكون أيقونات وسائل التواصل
 * Social Icons Component Props
 */
interface SocialIconsProps {
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
 * مكون أيقونات وسائل التواصل الاجتماعي البسيط
 * Simple Social Media Icons Component
 */
const SocialIcons: React.FC<SocialIconsProps> = ({ socialMedia }) => {
  if (!socialMedia || socialMedia.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="flex justify-center items-center gap-4 mb-8 md:mb-10 lg:mb-12"
    >
      {socialMedia.map((social, index) => {
        return (
          <motion.a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.7 + index * 0.1,
              duration: 0.4,
              type: "spring",
              stiffness: 300
            }}
            whileHover={hoverAnimations.socialIconHover}
            whileTap={tapAnimations.buttonTap}
            className={`
              relative group
              w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
              ${social.iconBg}
              rounded-full
              flex items-center justify-center
              shadow-lg hover:shadow-xl
              border-2 border-white/50 hover:border-white/80
              ${cssTransitions.smooth}
              backdrop-blur-sm
              overflow-hidden
            `}
            title={social.name}
          >
            {/* تأثير الخلفية المتحركة */}
            <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 ${cssTransitions.fast}`}></div>

            {/* تأثير الإضاءة */}
            <div className={`absolute inset-0 ${social.iconBg} opacity-0 group-hover:opacity-30 blur-sm ${cssTransitions.fast}`}></div>

            {/* الأيقونة */}
            {getIconComponent(social.icon, `
              relative z-10
              w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8
              ${social.iconColor}
              group-hover:scale-105
              ${cssTransitions.transform}
            `)}

            {/* تأثير النبضة */}
            <div className={`
              absolute inset-0
              ${social.iconBg}
              rounded-full
              opacity-0 group-hover:opacity-20
              animate-ping
              group-hover:animate-pulse
            `}></div>
          </motion.a>
        );
      })}
    </motion.div>
  );
};

export default SocialIcons;
