import { AccessLevel, UserRole } from '../types';
import {
  EDITAL_UNIVERSITIES,
  getAllSubjectsByUniversity,
  getAllSubjectsBySchool,
  getExamSubjectsByCourse,
  normalizeSubject,
} from './editalData';

export interface AccessPackage {
  id: string;
  name: string;
  description: string;
  accessLevel: AccessLevel;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

/**
 * Os 3 pacotes de acesso:
 * 1. course — só as disciplinas do curso/escola/universidade que o estudante escolheu
 * 2. school — todas as disciplinas de todas as escolas da universidade escolhida
 * 3. all — todas as escolas, cursos e disciplinas de todas as universidades
 */
export const ACCESS_PACKAGES: AccessPackage[] = [
  {
    id: 'course',
    name: 'Pacote Curso',
    description: 'Acesso apenas às disciplinas do teu curso e escola escolhidos',
    accessLevel: 'course',
    price: 300,
    duration: '1 mês',
    features: [
      'Apenas as disciplinas do teu curso',
      'Exames da tua universidade e escola',
      'Simulados personalizados',
      'Histórico de progresso',
    ],
  },
  {
    id: 'school',
    name: 'Pacote Escola',
    description: 'Acesso a todos os cursos e disciplinas da tua universidade',
    accessLevel: 'school',
    price: 600,
    duration: '1 mês',
    features: [
      'Todos os cursos da tua universidade',
      'Todas as disciplinas disponíveis',
      'Simulados de todas as escolas',
      'Suporte prioritário',
    ],
    popular: true,
  },
  {
    id: 'all',
    name: 'Pacote Completo',
    description: 'Acesso a todas as universidades, escolas, cursos e disciplinas',
    accessLevel: 'all',
    price: 1000,
    duration: '1 mês',
    features: [
      'Todas as universidades (UJC, UP, UEM)',
      'Todos os cursos e disciplinas',
      'Simulados ilimitados',
      'Suporte 24/7',
    ],
  },
];

/**
 * Determina se um exame (por disciplina) está dentro do acesso do utilizador.
 *
 * @param examSubject disciplina do exame (ex: "Português", "Matemática")
 * @param user dados do utilizador (intendedInstitution, intendedSchool, intendedCourse, accessLevel)
 */
export function canAccessExam(
  examSubject: string,
  user: {
    role?: UserRole;
    intendedInstitution?: string;
    intendedSchool?: string;
    intendedCourse?: string;
    competingDisciplines?: string[];
    accessLevel?: AccessLevel;
  }
): boolean {
  // Admin e promotores têm acesso total a todos os exames
  if (user.role === UserRole.ADMIN || user.role === UserRole.PROMOTER) return true;

  // Sem pacote = sem acesso (ou acesso limitado às disciplinas configuradas)
  const level = user.accessLevel || 'course';

  // Pacote completo: acesso a tudo
  if (level === 'all') return true;

  // Pacote escola: todas as disciplinas da universidade escolhida
  if (level === 'school') {
    if (!user.intendedInstitution) return false;
    const uni = EDITAL_UNIVERSITIES.find(
      u => u.name === user.intendedInstitution || u.shortName === user.intendedInstitution
    );
    if (!uni) return false;
    const subjects = getAllSubjectsByUniversity(uni.name);
    return subjects.some(s => normalizeSubject(s) === normalizeSubject(examSubject));
  }

  // Pacote curso: apenas as disciplinas do curso escolhido
  if (level === 'course') {
    if (!user.intendedInstitution || !user.intendedSchool || !user.intendedCourse) return false;
    const subjects = getExamSubjectsByCourse(
      user.intendedInstitution,
      user.intendedSchool,
      user.intendedCourse
    );
    return subjects.some(s => normalizeSubject(s) === normalizeSubject(examSubject));
  }

  return false;
}

/**
 * Filtra uma lista de exames com base no acesso do utilizador.
 * Cada exame tem `subject` (disciplina) e opcionalmente `institution`.
 */
export function filterExamsByAccess(
  exams: any[],
  user: {
    role?: UserRole;
    intendedInstitution?: string;
    intendedSchool?: string;
    intendedCourse?: string;
    competingDisciplines?: string[];
    accessLevel?: AccessLevel;
  }
): any[] {
  return exams.filter((exam): exam is any => {
    if (!exam) return false;
    // Se o exame tem instituição, verificar se corresponde à universidade do utilizador
    if (exam.institution && user.intendedInstitution) {
      const uni = EDITAL_UNIVERSITIES.find(
        u => u.name === user.intendedInstitution || u.shortName === user.intendedInstitution
      );
      if (uni) {
        const examInst = exam.institution.toLowerCase();
        const uniName = uni.name.toLowerCase();
        const uniShort = uni.shortName.toLowerCase();
        // Se a instituição do exame não corresponde à universidade, bloquear
        if (!examInst.includes(uniShort) && !examInst.includes(uniName.split(' ')[0].toLowerCase())) {
          // Para pacote 'all', permitir tudo
          if ((user.accessLevel || 'course') !== 'all') return false;
        }
      }
    }

    // Verificar acesso pela disciplina
    if (exam.subject) {
      return canAccessExam(exam.subject, user);
    }

    // Se não tem disciplina, permitir (exames gerais)
    return true;
  });
}

/** Descrição do nível de acesso para exibir ao utilizador */
export function getAccessLevelDescription(level?: AccessLevel): string {
  switch (level) {
    case 'course': return 'Acesso ao teu curso';
    case 'school': return 'Acesso à tua universidade';
    case 'all': return 'Acesso completo';
    default: return 'Sem pacote ativo';
  }
}
