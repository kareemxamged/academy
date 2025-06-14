import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

/**
 * مكون الفوتر البسيط
 * Simple Footer Component
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.6 }}
      className="mt-12 pt-8 border-t border-gray-200 relative"
    >
      {/* تأثير خلفية ناعم - Soft background effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none"></div>
      <div className="text-center space-y-4 relative z-10">
        {/* حقوق النشر - Copyright */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="space-y-2"
        >
          <p className="text-gray-500 text-sm font-arabic">
            © {currentYear} أكاديمية ميمو للرسم. جميع الحقوق محفوظة
          </p>
          <p className="text-gray-400 text-xs flex items-center justify-center space-x-2 space-x-reverse">
            <span className="font-arabic">صُنع بـ</span>
            <Heart className="w-3 h-3 text-red-400" />
            <span className="font-arabic">لعشاق الفن والإبداع</span>
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
