import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  zh: {
    // Navigation
    'nav.about': '关于我',
    'nav.projects': '项目',
    'nav.skills': '技能',
    'nav.contact': '联系',
    
    // Hero
    'hero.greeting': '你好，我是',
    'hero.name': '安落樱',
    'hero.tagline': '热爱技术，探索创新',
    'hero.description': '欢迎来到我的个人门户。在这里你可以了解我、查看我的项目，以及找到更多关于我的信息。',
    'hero.blog': '访问博客',
    'hero.contact': '联系我',
    
    // About
    'about.title': '关于我',
    'about.subtitle': '了解更多',
    'about.description': '我是一名热爱技术的开发者，专注于创建有意义的数字体验。我相信技术可以让世界变得更美好，并致力于通过我的工作来实现这一目标。',
    'about.paragraph2': '在编程之外，我喜欢探索新技术、阅读和分享知识。我相信持续学习是成长的关键。',
    
    // Projects
    'projects.title': '项目展示',
    'projects.subtitle': '我的作品',
    'projects.viewProject': '查看项目',
    'projects.comingSoon': '更多项目即将推出...',
    
    // Skills
    'skills.title': '技能',
    'skills.subtitle': '我的专长',
    
    // Contact
    'contact.title': '联系方式',
    'contact.subtitle': '保持联系',
    'contact.description': '如果你有任何问题或想要合作，欢迎通过以下方式联系我。',
    'contact.email': '发送邮件',
    
    // Footer
    'footer.rights': '保留所有权利',
    'footer.builtWith': '用心打造',
  },
  en: {
    // Navigation
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.skills': 'Skills',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.greeting': "Hi, I'm",
    'hero.name': 'Anluoying',
    'hero.tagline': 'Passionate about technology and innovation',
    'hero.description': 'Welcome to my personal portal. Here you can learn about me, explore my projects, and find ways to connect.',
    'hero.blog': 'Visit Blog',
    'hero.contact': 'Contact Me',
    
    // About
    'about.title': 'About Me',
    'about.subtitle': 'Learn More',
    'about.description': "I'm a developer passionate about technology, focused on creating meaningful digital experiences. I believe technology can make the world a better place and strive to achieve this through my work.",
    'about.paragraph2': 'Outside of coding, I enjoy exploring new technologies, reading, and sharing knowledge. I believe continuous learning is key to growth.',
    
    // Projects
    'projects.title': 'Projects',
    'projects.subtitle': 'My Work',
    'projects.viewProject': 'View Project',
    'projects.comingSoon': 'More projects coming soon...',
    
    // Skills
    'skills.title': 'Skills',
    'skills.subtitle': 'My Expertise',
    
    // Contact
    'contact.title': 'Contact',
    'contact.subtitle': 'Get in Touch',
    'contact.description': "If you have any questions or would like to collaborate, feel free to reach out through the channels below.",
    'contact.email': 'Send Email',
    
    // Footer
    'footer.rights': 'All rights reserved',
    'footer.builtWith': 'Built with care',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'zh' || saved === 'en') return saved;
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['zh']] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
