import { Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-muted-foreground text-sm">
            © {currentYear} 安落滢. {t("footer.rights")}.
          </p>

          {/* Built with */}
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            {t("footer.builtWith")} <Heart className="h-4 w-4 text-destructive fill-destructive" />
          </p>

          {/* Quick links */}
          <div className="flex items-center gap-4">
            <a
              href="https://blog.anluoying.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Blog
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
