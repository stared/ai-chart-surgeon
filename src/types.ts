export interface ChartFeedback {
  chartType: string;
  generalFeedback: string;
  aestheticsFeedback: string;
  accessibilityFeedback: string;
  roast: string;
  extractedData: string;
  plotCode: string;
}

export interface AnthropicResponse {
  chartFeedback: ChartFeedback;
}
