import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="section-padding bg-secondary/30">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium mb-2">{t('about.subtitle')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('about.title')}</h2>
          </div>

          {/* Content */}
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>{t('about.description')}</p>
            <p>{t('about.paragraph2')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
