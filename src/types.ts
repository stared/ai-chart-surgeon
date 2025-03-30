export interface ChartFeedback {
  strengths: string;
  weaknesses: string;
  suggestions: string;
  roast: string;
  plotCode: string;
}

export interface AnthropicResponse {
  chartFeedback: ChartFeedback;
}
