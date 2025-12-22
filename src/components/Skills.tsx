import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

interface SkillCategory {
  nameZh: string;
  nameEn: string;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    nameZh: '前端开发',
    nameEn: 'Frontend',
    skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue'],
  },
  {
    nameZh: '后端开发',
    nameEn: 'Backend',
    skills: ['Node.js', 'Python', 'Java', 'SQL', 'REST API'],
  },
  {
    nameZh: '工具 & 其他',
    nameEn: 'Tools & Others',
    skills: ['Git', 'Docker', 'Linux', 'VS Code', 'Figma'],
  },
];

const Skills = () => {
  const { language, t } = useLanguage();

  return (
    <section id="skills" className="section-padding bg-secondary/30">
      <div className="section-container">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-medium mb-2">{t('skills.subtitle')}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('skills.title')}</h2>
        </div>

        {/* Skills grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {skillCategories.map((category, index) => (
            <div key={index} className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {language === 'zh' ? category.nameZh : category.nameEn}
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {category.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="px-3 py-1 text-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
