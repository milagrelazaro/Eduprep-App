/**
 * Dados dos editais de exames de admissão — UJC, UP-Maputo e UEM.
 * Estrutura hierárquica: Universidade → Escola/Faculdade → Curso → Disciplinas de exame.
 *
 * Cada curso tem `examSubjects`: as disciplinas que o candidato faz no exame de admissão.
 * As disciplinas individuais são extraídas automaticamente para filtrar exames.
 */

export interface Course {
  name: string;
  examSubjects: string[]; // disciplinas de exame (ex: ["Português", "História"])
}

export interface School {
  name: string;
  courses: Course[];
}

export interface University {
  name: string;
  shortName: string; // sigla usada nos exames (ex: "UJC", "UP", "UEM")
  schools: School[];
}

// ── UJC ──────────────────────────────────────────────────────────────────
const UJC: University = {
  name: 'Universidade Joaquim Chissano',
  shortName: 'UJC',
  schools: [
    {
      name: 'Escola Superior de Governação',
      courses: [
        { name: 'Licenciatura em Administração Pública (LAP)', examSubjects: ['Português', 'História'] },
      ],
    },
    {
      name: 'Escola Superior de Relações Internacionais',
      courses: [
        { name: 'Licenciatura em Relações Internacionais e Diplomacia (LRID)', examSubjects: ['Português', 'História'] },
      ],
    },
    {
      name: 'Faculdade de Ciências e Tecnologias',
      courses: [
        { name: 'Licenciatura em Engenharia de Tecnologias e de Sistemas de Informação (LETSI)', examSubjects: ['Física', 'Matemática'] },
        { name: 'Licenciatura em Engenharia de Alimentos (LEA)', examSubjects: ['Química', 'Matemática'] },
      ],
    },
    {
      name: 'Faculdade de Economia e Negócios',
      courses: [
        { name: 'Licenciatura em Estatística Aplicada', examSubjects: ['Português', 'Matemática'] },
        { name: 'Licenciatura em Gestão de Empresas (LGE)', examSubjects: ['Português', 'Matemática'] },
        { name: 'Licenciatura em Economia e Negócios (LEN)', examSubjects: ['Português', 'Matemática'] },
      ],
    },
  ],
};

// ── UP-Maputo ────────────────────────────────────────────────────────────
const UP_MAPUTO: University = {
  name: 'Universidade Pedagógica de Maputo',
  shortName: 'UP',
  schools: [
    {
      name: 'Faculdade de Ciências da Linguagem, Comunicação e Artes (FCLCA)',
      courses: [
        { name: 'Lic. em Ensino de Língua Inglesa', examSubjects: ['Inglês', 'Português II'] },
        { name: 'Lic. em Ensino de Língua Francesa', examSubjects: ['Francês', 'Português II'] },
        { name: 'Lic. em Ensino de Língua Portuguesa', examSubjects: ['Português II', 'História'] },
        { name: 'Lic. em Design da Comunicação', examSubjects: ['Português II', 'História'] },
        { name: 'Lic. em Jornalismo', examSubjects: ['Português II', 'História'] },
        { name: 'Lic. em Artes Cénicas', examSubjects: ['Português II', 'História'] },
      ],
    },
    {
      name: 'Faculdade de Ciências Sociais e Filosofia (FCSF)',
      courses: [
        { name: 'Lic. em Antropologia e Desenvolvimento Comunitário', examSubjects: ['Português II', 'História'] },
        { name: 'Lic. em Direito', examSubjects: ['Português II', 'História'] },
        { name: 'Lic. em Ensino de Filosofia', examSubjects: ['Fundamentos de Filosofia', 'História'] },
        { name: 'Lic. em Serviço Social e Acção Humanitária', examSubjects: ['Português II', 'História'] },
        { name: 'Lic. em Ensino de História', examSubjects: ['Português II', 'História'] },
        { name: 'Lic. em Sociologia e Desenvolvimento de Instituições', examSubjects: ['Português II', 'História'] },
      ],
    },
    {
      name: 'Faculdade de Ciências da Terra e Ambiente (FCTA)',
      courses: [
        { name: 'Lic. em Ensino de Geografia', examSubjects: ['Geografia', 'História'] },
        { name: 'Lic. em Planeamento e Ordenamento Territorial', examSubjects: ['Geografia', 'Português II'] },
        { name: 'Lic. em Cartografia e Agrimensura', examSubjects: ['Matemática', 'Português II'] },
        { name: 'Lic. em Gestão Ambiental e Desenvolvimento Comunitário', examSubjects: ['Geografia', 'Português II'] },
        { name: 'Lic. em Património e Turismo', examSubjects: ['Geografia', 'História'] },
      ],
    },
    {
      name: 'Faculdade de Educação e Psicologia (FEP)',
      courses: [
        { name: 'Lic. em Gestão Pública e Educacional', examSubjects: ['Português I', 'Matemática'] },
        { name: 'Lic. em Educação e Assistência Social', examSubjects: ['Português I', 'História'] },
        { name: 'Lic. em Pedagogia', examSubjects: ['Português I', 'História'] },
        { name: 'Lic. em Educação e Desenvolvimento da Primeira Infância', examSubjects: ['Português I', 'Biologia'] },
        { name: 'Lic. em Psicologia Educacional', examSubjects: ['Português I', 'Biologia'] },
        { name: 'Lic. em Psicologia Clínica e da Saúde', examSubjects: ['Português I', 'Biologia'] },
        { name: 'Lic. em Psicologia Social e do Trabalho', examSubjects: ['Português I', 'Biologia'] },
        { name: 'Lic. em Administração e Gestão da Educação', examSubjects: ['Português I', 'História'] },
      ],
    },
    {
      name: 'Faculdade de Ciências Naturais e Matemática (FCNM)',
      courses: [
        { name: 'Lic. em Ensino de Biologia', examSubjects: ['Biologia', 'Química'] },
        { name: 'Lic. em Ensino de Matemática', examSubjects: ['Matemática', 'Física'] },
        { name: 'Lic. em Energias Renováveis', examSubjects: ['Física', 'Matemática'] },
        { name: 'Lic. em Estatística e Gestão de Informação', examSubjects: ['Português I', 'Matemática'] },
        { name: 'Lic. em Ensino de Química', examSubjects: ['Química', 'Biologia'] },
        { name: 'Lic. em Ensino de Física', examSubjects: ['Física', 'Matemática'] },
        { name: 'Lic. em Nutrição', examSubjects: ['Química', 'Biologia'] },
      ],
    },
    {
      name: 'Faculdade de Economia e Gestão (FEG)',
      courses: [
        { name: 'Lic. em Contabilidade e Auditoria', examSubjects: ['Matemática', 'Português'] },
        { name: 'Lic. em Economia', examSubjects: ['Matemática', 'Português I'] },
        { name: 'Lic. em Gestão de Empresas', examSubjects: ['Matemática', 'Português I'] },
        { name: 'Lic. em Gestão Financeira e Bancária', examSubjects: ['Matemática', 'Português I'] },
        { name: 'Lic. em Gestão de Recursos Humanos', examSubjects: ['Matemática', 'Português I'] },
        { name: 'Lic. em Marketing e Relações Públicas', examSubjects: ['Matemática', 'Português I'] },
      ],
    },
    {
      name: 'Faculdade de Engenharias e Tecnologias (FET)',
      courses: [
        { name: 'Lic. em Engenharia Eletrónica e de Telecomunicações', examSubjects: ['Matemática', 'Física'] },
        { name: 'Lic. em Engenharia de Construção Civil', examSubjects: ['Matemática', 'Física'] },
        { name: 'Lic. em Engenharia Agronómica', examSubjects: ['Matemática', 'Química'] },
        { name: 'Lic. em Extensão Agrária', examSubjects: ['Biologia', 'Química'] },
        { name: 'Lic. em Informática', examSubjects: ['Matemática', 'Física'] },
        { name: 'Lic. em Design e Multimídia', examSubjects: ['Português I', 'Aptidão em Desenho'] },
        { name: 'Lic. em Tecnologia de Alimentos', examSubjects: ['Química', 'Biologia'] },
        { name: 'Lic. em Informática Aplicada', examSubjects: ['Matemática', 'Física'] },
        { name: 'Lic. em Educação Visual e Geometria Descritiva', examSubjects: ['Educação Visual', 'Desenho Técnico'] },
      ],
    },
    {
      name: 'Faculdade de Educação Física e Desportos (FEFD)',
      courses: [
        { name: 'Lic. em Ensino de Educação Física e Desporto Escolar', examSubjects: ['Biologia', 'Aptidão Física'] },
        { name: 'Lic. em Actividade Física e Saúde', examSubjects: ['Biologia', 'Aptidão Física'] },
        { name: 'Lic. em Treino Desportivo', examSubjects: ['Biologia', 'Aptidão Física'] },
      ],
    },
  ],
};

// ── UEM ──────────────────────────────────────────────────────────────────
const UEM: University = {
  name: 'Universidade Eduardo Mondlane',
  shortName: 'UEM',
  schools: [
    {
      name: 'Faculdade de Agronomia e Engenharia Florestal',
      courses: [
        { name: 'Agro-economia e Extensão Agrária / Engenharia Agronómica / Engenharia Florestal', examSubjects: ['Matemática III', 'Química II'] },
      ],
    },
    {
      name: 'Faculdade de Arquitectura e Planeamento Físico',
      courses: [
        { name: 'Arquitectura e Planeamento Físico', examSubjects: ['Matemática III', 'Desenho'] },
      ],
    },
    {
      name: 'Faculdade de Ciências',
      courses: [
        { name: 'Biologia Aplicada / Biologia e Saúde / Biologia Marinha Aquática e Costeira / Ecologia e Conservação', examSubjects: ['Biologia I', 'Química I'] },
        { name: 'Geo-ciências de Petróleo e Gás / Geofísica Aplicada / Geologia Urbana e Ambiental / Hidrogeologia / Física / Meteorologia', examSubjects: ['Matemática I', 'Física I'] },
        { name: 'Geologia e Pesquisa Mineral / Química Ambiental / Química Industrial', examSubjects: ['Matemática III', 'Química II'] },
        { name: 'Ciências de Informação Geográfica / Estatística / Informática', examSubjects: ['Matemática II', 'Português II'] },
        { name: 'Matemática', examSubjects: ['Matemática II', 'Português II'] },
      ],
    },
    {
      name: 'Faculdade de Direito',
      courses: [
        { name: 'Direito', examSubjects: ['Português I', 'História I'] },
      ],
    },
    {
      name: 'Faculdade de Economia',
      courses: [
        { name: 'Economia / Gestão / Contabilidade e Finanças', examSubjects: ['Matemática II', 'Português II'] },
      ],
    },
    {
      name: 'Faculdade de Educação',
      courses: [
        { name: 'Organização e Gestão da Educação / L. de Sinais de Moçambique', examSubjects: ['Português I', 'História I'] },
        { name: 'Desenvolvimento e Educação de Infância / Educação Ambiental / Psicologias', examSubjects: ['Português III', 'Biologia II'] },
        { name: 'Ciência da Educação', examSubjects: ['Biologia II', 'Geografia I'] },
      ],
    },
    {
      name: 'Faculdade de Engenharia',
      courses: [
        { name: 'Engenharias (Ambiente, Civil, Eléctrica, Electrónica, Informática, Mecânica, Química, Petróleo e Gás, Telecomunicações)', examSubjects: ['Matemática I', 'Física I'] },
      ],
    },
    {
      name: 'Faculdade de Letras e Ciências Sociais (FLCS)',
      courses: [
        { name: 'Administração Pública / Ciência Política / Ensino de Português', examSubjects: ['Português I', 'História I'] },
        { name: 'História / Linguística / Literatura Moçambicana', examSubjects: ['Português I', 'História I'] },
        { name: 'Serviço Social / Sociologia', examSubjects: ['Português I', 'História I'] },
        { name: 'Antropologia', examSubjects: ['Português I', 'História I'] },
        { name: 'Arqueologia e Gestão do Património Cultural / Geografia', examSubjects: ['História II', 'Geografia I'] },
        { name: 'Ensino de Francês / Tradução Português-Francês', examSubjects: ['Francês', 'Português II'] },
        { name: 'Ensino de Inglês / Tradução Português-Inglês / Língua, Cultura e Literatura Chinesa', examSubjects: ['Português III', 'Inglês'] },
        { name: 'Ensino de Línguas Bantu', examSubjects: ['Português III', 'Inquérito Sociolinguístico'] },
      ],
    },
    {
      name: 'Faculdade de Medicina & Faculdade de Veterinária',
      courses: [
        { name: 'Medicina / Ciência e Tecnologia de Alimentos / Ciência e Tecnologia Animal / Medicina Veterinária', examSubjects: ['Biologia I', 'Química I'] },
      ],
    },
    {
      name: 'Escola de Comunicação e Artes (ECA)',
      courses: [
        { name: 'Ciência da Informação / Jornalismo / Marketing e Relações Públicas', examSubjects: ['Português I', 'História I'] },
        { name: 'Música / Teatro', examSubjects: ['Provas Práticas'] },
      ],
    },
    {
      name: 'Escola Superior de Ciências do Desporto',
      courses: [
        { name: 'Ciências do Desporto', examSubjects: ['Português III', 'Biologia II', 'Aptidão Física'] },
      ],
    },
    {
      name: 'Escola Superior de Ciências Marinhas e Costeiras',
      courses: [
        { name: 'Oceanografia', examSubjects: ['Matemática I', 'Física I'] },
        { name: 'Geologia Marinha', examSubjects: ['Matemática III', 'Química II'] },
        { name: 'Biologia Marinha / Química Marinha', examSubjects: ['Biologia I', 'Química I'] },
      ],
    },
    {
      name: 'Escola Superior de Desenvolvimento Rural (Vilankulo)',
      courses: [
        { name: 'Cursos da área agrária e engenharia rural', examSubjects: ['Matemática', 'Português', 'Física', 'Química'] },
      ],
    },
    {
      name: 'Escola Superior de Hotelaria e Turismo de Inhambane',
      courses: [
        { name: 'Gestão Hoteleira', examSubjects: ['Matemática II', 'Português II'] },
        { name: 'Animação Turística / Informação Turística / Ecoturismo', examSubjects: ['Português III', 'Geografia I'] },
      ],
    },
    {
      name: 'Escola Superior de Negócios e Empreendedorismo de Chibuto',
      courses: [
        { name: 'Finanças / Gestão de Empresas / Gestão Comercial / Agro-Négoços', examSubjects: ['Matemática II', 'Português II'] },
        { name: 'Agricultura Comercial', examSubjects: ['Matemática III', 'Química II'] },
      ],
    },
  ],
};

export const EDITAL_UNIVERSITIES: University[] = [UJC, UP_MAPUTO, UEM];

// ── Helpers ──────────────────────────────────────────────────────────────

/** Lista de universidades (para seletores) */
export const getUniversities = () => EDITAL_UNIVERSITIES.map(u => ({ name: u.name, shortName: u.shortName }));

/** Lista de escolas de uma universidade */
export const getSchoolsByUniversity = (universityName: string): School[] => {
  const uni = EDITAL_UNIVERSITIES.find(u => u.name === universityName || u.shortName === universityName);
  return uni ? uni.schools : [];
};

/** Lista de cursos de uma escola */
export const getCoursesBySchool = (universityName: string, schoolName: string): Course[] => {
  const schools = getSchoolsByUniversity(universityName);
  const school = schools.find(s => s.name === schoolName);
  return school ? school.courses : [];
};

/** Disciplinas de exame de um curso */
export const getExamSubjectsByCourse = (universityName: string, schoolName: string, courseName: string): string[] => {
  const courses = getCoursesBySchool(universityName, schoolName);
  const course = courses.find(c => c.name === courseName);
  return course ? course.examSubjects : [];
};

/** Todas as disciplinas únicas de uma universidade (para pacote "escola inteira") */
export const getAllSubjectsByUniversity = (universityName: string): string[] => {
  const schools = getSchoolsByUniversity(universityName);
  const subjects = new Set<string>();
  schools.forEach(s => s.courses.forEach(c => c.examSubjects.forEach(sub => subjects.add(sub))));
  return Array.from(subjects);
};

/** Todas as disciplinas únicas de uma escola */
export const getAllSubjectsBySchool = (universityName: string, schoolName: string): string[] => {
  const courses = getCoursesBySchool(universityName, schoolName);
  const subjects = new Set<string>();
  courses.forEach(c => c.examSubjects.forEach(sub => subjects.add(sub)));
  return Array.from(subjects);
};

/** Normalizar nome de disciplina para comparação (remove acentos, espaços extras) */
export const normalizeSubject = (s: string): string =>
  s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
