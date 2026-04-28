import type { ProjectCardProps } from "./ProjectCard";

export const allProjects: ProjectCardProps[] = [
  {
    id: 1,
    title: "Biblioteca Comunitária Sementes do Saber",
    description: "Projeto de criação de uma biblioteca comunitária com programas de incentivo à leitura e reforço",
    type: "Política Cultural",
    targetAmount: 50000,
    progressPercent: 65,
    location: "São Paulo, SP",
  },
  {
    id: 2,
    title: "Reciclagem Comunitária",
    description: "Implementação de um centro de reciclagem gerido pela comunidade, gerando renda e inclusão",
    type: "Lei Rouanet",
    targetAmount: 120000,
    progressPercent: 25,
    location: "Belo Horizonte, MG",
  },
  {
    id: 3,
    title: "Esporte e Cidadania",
    description: "Programa esportivo multidisciplinar para jovens em situação de risco social",
    type: "Lei do Esporte",
    targetAmount: 90000,
    progressPercent: 55,
    location: "Rio de Janeiro, RJ",
  },
  {
    id: 4,
    title: "Arte e Transformação",
    description: "Oficinas de arte e cultura para crianças e adolescentes, desenvolvendo habilidades",
    type: "Lei Rouanet",
    targetAmount: 60000,
    progressPercent: 70,
    location: "Salvador, BA",
  },
];

export const suggestedProjects: ProjectCardProps[] = [
  {
    id: 101,
    title: "Saúde em Movimento",
    description: "Unidade móvel de saúde para atendimento médico e odontológico em comunidades rurais",
    type: "Saúde",
    targetAmount: 75000,
    progressPercent: 40,
    location: "Recife, PE",
  },
  {
    id: 102,
    title: "Tecnologia Inclusiva",
    description: "Laboratório de tecnologia adaptativa para pessoas com deficiência, oferecendo formação",
    type: "Inclusão",
    targetAmount: 85000,
    progressPercent: 80,
    location: "Porto Alegre, RS",
  },
];

export default { allProjects, suggestedProjects };
