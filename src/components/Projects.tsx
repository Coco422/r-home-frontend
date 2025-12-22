import { ExternalLink, FolderOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Project {
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  tags: string[];
  link?: string;
}

const projects: Project[] = [
  {
    titleZh: '个人博客',
    titleEn: 'Personal Blog',
    descriptionZh: '我的技术博客，分享编程经验和技术见解。',
    descriptionEn: 'My tech blog where I share programming experiences and technical insights.',
    tags: ['Blog', 'Writing'],
    link: 'https://blog.anluoying.com',
  },
  {
    titleZh: '项目示例',
    titleEn: 'Sample Project',
    descriptionZh: '这是一个示例项目位置，可以替换为你的实际项目。',
    descriptionEn: 'This is a sample project placeholder that can be replaced with your actual project.',
    tags: ['Web', 'React'],
    link: undefined,
  },
];

const Projects = () => {
  const { language, t } = useLanguage();

  return (
    <section id="projects" className="section-padding">
      <div className="section-container">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-medium mb-2">{t('projects.subtitle')}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('projects.title')}</h2>
        </div>

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {projects.map((project, index) => (
            <Card key={index} className="glass-card hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FolderOpen className="h-10 w-10 text-primary" />
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
                <CardTitle className="text-xl">
                  {language === 'zh' ? project.titleZh : project.titleEn}
                </CardTitle>
                <CardDescription>
                  {language === 'zh' ? project.descriptionZh : project.descriptionEn}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {project.link && (
                  <Button asChild variant="ghost" size="sm" className="mt-4 -ml-3">
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      {t('projects.viewProject')} →
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming soon */}
        <p className="text-center text-muted-foreground mt-8">{t('projects.comingSoon')}</p>
      </div>
    </section>
  );
};

export default Projects;
