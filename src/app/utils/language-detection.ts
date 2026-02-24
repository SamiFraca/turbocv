/**
 * Language Detection and Translation Utilities
 * 
 * Detects the language of CV content and provides translations for template headings
 */

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

/**
 * Detects the language of the CV text using simple keyword matching
 */
export function detectCVLanguage(cvText: string): SupportedLanguage {
  const text = cvText.toLowerCase();
  
  // Spanish indicators
  const spanishKeywords = ['experiencia', 'educación', 'habilidades', 'idiomas', 'formación', 'perfil profesional', 'logros'];
  const spanishCount = spanishKeywords.filter(keyword => text.includes(keyword)).length;
  
  // French indicators
  const frenchKeywords = ['expérience', 'éducation', 'compétences', 'langues', 'formation', 'profil professionnel'];
  const frenchCount = frenchKeywords.filter(keyword => text.includes(keyword)).length;
  
  // German indicators
  const germanKeywords = ['erfahrung', 'ausbildung', 'fähigkeiten', 'sprachen', 'berufserfahrung'];
  const germanCount = germanKeywords.filter(keyword => text.includes(keyword)).length;
  
  // Italian indicators
  const italianKeywords = ['esperienza', 'istruzione', 'competenze', 'lingue', 'formazione'];
  const italianCount = italianKeywords.filter(keyword => text.includes(keyword)).length;
  
  // Portuguese indicators
  const portugueseKeywords = ['experiência', 'educação', 'habilidades', 'idiomas', 'formação'];
  const portugueseCount = portugueseKeywords.filter(keyword => text.includes(keyword)).length;
  
  // Determine language based on highest count
  const counts = {
    es: spanishCount,
    fr: frenchCount,
    de: germanCount,
    it: italianCount,
    pt: portugueseCount,
  };
  
  const maxCount = Math.max(...Object.values(counts));
  
  // If we found strong indicators (at least 2 keywords), use that language
  if (maxCount >= 2) {
    const detectedLang = Object.entries(counts).find(([_, count]) => count === maxCount)?.[0] as SupportedLanguage;
    if (detectedLang) return detectedLang;
  }
  
  // Default to English
  return 'en';
}

/**
 * Template heading translations
 */
export const TEMPLATE_HEADINGS: Record<SupportedLanguage, {
  professionalSummary: string;
  keyAccomplishments: string;
  experience: string;
  education: string;
  skills: string;
  toolsTechnologies: string;
  languages: string;
  certifications: string;
}> = {
  en: {
    professionalSummary: 'PROFESSIONAL SUMMARY',
    keyAccomplishments: 'KEY ACCOMPLISHMENTS',
    experience: 'EXPERIENCE',
    education: 'EDUCATION',
    skills: 'SKILLS',
    toolsTechnologies: 'TOOLS & TECHNOLOGIES',
    languages: 'LANGUAGES',
    certifications: 'CERTIFICATIONS',
  },
  es: {
    professionalSummary: 'PERFIL PROFESIONAL',
    keyAccomplishments: 'LOGROS CLAVE',
    experience: 'EXPERIENCIA',
    education: 'EDUCACIÓN',
    skills: 'HABILIDADES',
    toolsTechnologies: 'HERRAMIENTAS Y TECNOLOGÍAS',
    languages: 'IDIOMAS',
    certifications: 'CERTIFICACIONES',
  },
  fr: {
    professionalSummary: 'PROFIL PROFESSIONNEL',
    keyAccomplishments: 'RÉALISATIONS CLÉS',
    experience: 'EXPÉRIENCE',
    education: 'FORMATION',
    skills: 'COMPÉTENCES',
    toolsTechnologies: 'OUTILS ET TECHNOLOGIES',
    languages: 'LANGUES',
    certifications: 'CERTIFICATIONS',
  },
  de: {
    professionalSummary: 'BERUFSPROFIL',
    keyAccomplishments: 'WICHTIGSTE ERFOLGE',
    experience: 'BERUFSERFAHRUNG',
    education: 'AUSBILDUNG',
    skills: 'FÄHIGKEITEN',
    toolsTechnologies: 'WERKZEUGE UND TECHNOLOGIEN',
    languages: 'SPRACHEN',
    certifications: 'ZERTIFIZIERUNGEN',
  },
  it: {
    professionalSummary: 'PROFILO PROFESSIONALE',
    keyAccomplishments: 'RISULTATI CHIAVE',
    experience: 'ESPERIENZA',
    education: 'ISTRUZIONE',
    skills: 'COMPETENZE',
    toolsTechnologies: 'STRUMENTI E TECNOLOGIE',
    languages: 'LINGUE',
    certifications: 'CERTIFICAZIONI',
  },
  pt: {
    professionalSummary: 'PERFIL PROFISSIONAL',
    keyAccomplishments: 'CONQUISTAS PRINCIPAIS',
    experience: 'EXPERIÊNCIA',
    education: 'EDUCAÇÃO',
    skills: 'HABILIDADES',
    toolsTechnologies: 'FERRAMENTAS E TECNOLOGIAS',
    languages: 'IDIOMAS',
    certifications: 'CERTIFICAÇÕES',
  },
};

/**
 * Gets the headings for a specific language
 */
export function getTemplateHeadings(language: SupportedLanguage) {
  return TEMPLATE_HEADINGS[language];
}
