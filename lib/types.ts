export interface ModelAnswer {
  modelId: string;
  modelDisplayName: string;
  contentHtml: string;
}

export interface Question {
  id: string;
  text: string;
  answers: ModelAnswer[];
} 