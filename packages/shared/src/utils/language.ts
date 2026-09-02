export interface LanguageMeta {
  name: string;
  extensions: string[];
  color: string;
  category: 'programming' | 'markup' | 'data' | 'config' | 'query';
  singleLineComments: string[];
  multiLineComments?: [string, string][];
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageMeta> = {
  typescript: {
    name: 'TypeScript',
    extensions: ['.ts', '.tsx', '.mts', '.cts'],
    color: '#3178C6',
    category: 'programming',
    singleLineComments: ['//'],
    multiLineComments: [['/*', '*/']],
  },
  javascript: {
    name: 'JavaScript',
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    color: '#F7DF1E',
    category: 'programming',
    singleLineComments: ['//'],
    multiLineComments: [['/*', '*/']],
  },
  python: {
    name: 'Python',
    extensions: ['.py', '.pyw', '.ipynb'],
    color: '#3776AB',
    category: 'programming',
    singleLineComments: ['#'],
    multiLineComments: [
      ['"""', '"""'],
      ["'''", "'''"],
    ],
  },
  java: {
    name: 'Java',
    extensions: ['.java'],
    color: '#B07219',
    category: 'programming',
    singleLineComments: ['//'],
    multiLineComments: [['/*', '*/']],
  },
  kotlin: {
    name: 'Kotlin',
    extensions: ['.kt', '.kts'],
    color: '#7F52FF',
    category: 'programming',
    singleLineComments: ['//'],
    multiLineComments: [['/*', '*/']],
  },
  go: {
    name: 'Go',
    extensions: ['.go'],
    color: '#00ADD8',
    category: 'programming',
    singleLineComments: ['//'],
    multiLineComments: [['/*', '*/']],
  },
  rust: {
    name: 'Rust',
    extensions: ['.rs'],
    color: '#DEA584',
    category: 'programming',
    singleLineComments: ['//'],
    multiLineComments: [['/*', '*/']],
  },
  csharp: {
    name: 'C#',
    extensions: ['.cs'],
    color: '#178600',
    category: 'programming',
    singleLineComments: ['//'],
    multiLineComments: [['/*', '*/']],
  },
  php: {
    name: 'PHP',
    extensions: ['.php', '.phtml'],
    color: '#4F5D95',
    category: 'programming',
    singleLineComments: ['//', '#'],
    multiLineComments: [['/*', '*/']],
  },
  ruby: {
    name: 'Ruby',
    extensions: ['.rb', '.rake'],
    color: '#701516',
    category: 'programming',
    singleLineComments: ['#'],
    multiLineComments: [['=begin', '=end']],
  },
  sql: {
    name: 'SQL',
    extensions: ['.sql', '.psql'],
    color: '#E38C00',
    category: 'query',
    singleLineComments: ['--'],
    multiLineComments: [['/*', '*/']],
  },
  html: {
    name: 'HTML',
    extensions: ['.html', '.htm'],
    color: '#E34F26',
    category: 'markup',
    singleLineComments: [],
    multiLineComments: [['<!--', '-->']],
  },
  css: {
    name: 'CSS',
    extensions: ['.css', '.scss', '.sass', '.less'],
    color: '#563D7C',
    category: 'markup',
    singleLineComments: ['//'],
    multiLineComments: [['/*', '*/']],
  },
  json: {
    name: 'JSON',
    extensions: ['.json'],
    color: '#292929',
    category: 'data',
    singleLineComments: [],
  },
  yaml: {
    name: 'YAML',
    extensions: ['.yaml', '.yml'],
    color: '#CB171E',
    category: 'data',
    singleLineComments: ['#'],
  },
  dockerfile: {
    name: 'Dockerfile',
    extensions: ['Dockerfile', '.dockerfile', 'dockerfile'],
    color: '#384D54',
    category: 'config',
    singleLineComments: ['#'],
  },
  terraform: {
    name: 'Terraform',
    extensions: ['.tf', '.tfvars'],
    color: '#5C4EE5',
    category: 'config',
    singleLineComments: ['#', '//'],
    multiLineComments: [['/*', '*/']],
  },
};

export function detectLanguageFromFilename(filename: string): LanguageMeta | null {
  const base = filename.split(/[/\\]/).pop() || '';
  if (base.toLowerCase() === 'dockerfile' || base.toLowerCase().startsWith('dockerfile.')) {
    return SUPPORTED_LANGUAGES.dockerfile;
  }

  const dotIdx = base.lastIndexOf('.');
  if (dotIdx === -1) return null;
  const ext = base.substring(dotIdx).toLowerCase();

  for (const lang of Object.values(SUPPORTED_LANGUAGES)) {
    if (lang.extensions.includes(ext)) {
      return lang;
    }
  }

  return null;
}
