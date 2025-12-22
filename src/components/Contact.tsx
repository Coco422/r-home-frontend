import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface SocialLink {
  icon: React.ElementType;
  label: string;
  href: string;
  placeholder?: boolean;
}

const socialLinks: SocialLink[] = [
  {
    icon: Github,
    label: 'GitHub',
    href: '#',
    placeholder: true,
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: '#',
    placeholder: true,
  },
  {
    icon: Twitter,
    label: 'Twitter',
    href: '#',
    placeholder: true,
  },
];

const Contact = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="section-padding">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center">
          {/* Section header */}
          <div className="mb-8">
            <p className="text-primary text-sm font-medium mb-2">{t('contact.subtitle')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('contact.title')}</h2>
            <p className="text-muted-foreground">{t('contact.description')}</p>
          </div>

          {/* Email button */}
          <Button asChild size="lg" className="mb-8 gap-2">
            <a href="mailto:contact@anluoying.com">
              <Mail className="h-5 w-5" />
              {t('contact.email')}
            </a>
          </Button>

          {/* Social links */}
          <div className="flex justify-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-full border border-border hover:border-primary hover:text-primary transition-colors ${
                  link.placeholder ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={(e) => link.placeholder && e.preventDefault()}
                title={link.placeholder ? `${link.label} (待添加)` : link.label}
              >
                <link.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
