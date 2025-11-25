import { AnalysisResult } from '../types';

// --- LOCAL INFERENCE ENGINE SIMULATION ---
// Since the model is deployed locally, we simulate the inference delay and response structure.
// In a production local setup, this would fetch from http://localhost:8000/v1/chat/completions

const MOCK_DELAY_MS = 2500;

/**
 * Simulates the Qwen3Guard local safety check.
 */
const checkSafetyWithLocalGuard = async (content: string, stage: 'input' | 'output'): Promise<void> => {
  console.log(`🛡️ [Local Qwen3Guard] Auditing ${stage} (Length: ${content.length})...`);
  // Simulate local GPU inference time for guard model
  await new Promise(resolve => setTimeout(resolve, 300)); 
  console.log(`🛡️ [Local Qwen3Guard] ${stage} verified safe.`);
};

export const analyzeData = async (
  dataContent: string, 
  fileName: string, 
  language: string = "Simplified Chinese",
  modelIdentity: string = "DeepResearch-8B"
): Promise<AnalysisResult> => {
  try {
    // 1. Local Security Check
    await checkSafetyWithLocalGuard(dataContent, 'input');

    console.log(`🚀 [Local Inference] Loading model ${modelIdentity} into VRAM...`);
    console.log(`📊 [Local Inference] Processing ${fileName}...`);

    // Simulate Inference Delay
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

    // Generate a realistic mock response based on the "Local" analysis
    const mockResponse: AnalysisResult = {
      summary: language === "Simplified Chinese" 
        ? `基于本地部署的 ${modelIdentity} 模型分析，该数据集包含 ${fileName} 的关键业务指标。数据整体呈现波动上升趋势，但在特定周期内存在明显的离群值。模型识别出三个核心增长点与潜在的风险区域。`
        : `Based on the locally deployed ${modelIdentity} model analysis, this dataset contains key business metrics from ${fileName}. The data shows an overall fluctuating upward trend, but with significant outliers in specific cycles. The model identified three core growth points and potential risk areas.`,
      keyInsights: language === "Simplified Chinese" 
        ? [
            "核心指标在Q3季度实现了24.5%的环比增长，显示出强劲的业务韧性。",
            "异常检测算法在第450-500行数据中发现了非典型的分布模式，建议进一步人工复核。",
            "用户留存率与活跃度之间存在0.82的强正相关性，表明产品粘性策略正在生效。"
          ]
        : [
            "Core metrics achieved a 24.5% QoQ growth in Q3, demonstrating strong business resilience.",
            "Anomaly detection algorithms found atypical distribution patterns in rows 450-500.",
            "There is a strong positive correlation (0.82) between user retention and activity."
          ],
      sentiment: "positive",
      charts: [
        {
          title: language === "Simplified Chinese" ? "季度趋势分析 (本地渲染)" : "Quarterly Trend Analysis (Local Render)",
          type: "area",
          xAxisKey: "month",
          seriesKeys: ["value", "forecast"],
          description: language === "Simplified Chinese" ? "历史数据与模型本地预测值的对比" : "Comparison of historical data and local model forecasts",
          data: [
            { month: 'Jan', value: 4000, forecast: 4100 },
            { month: 'Feb', value: 3000, forecast: 3200 },
            { month: 'Mar', value: 2000, forecast: 2400 },
            { month: 'Apr', value: 2780, forecast: 2900 },
            { month: 'May', value: 1890, forecast: 2100 },
            { month: 'Jun', value: 2390, forecast: 2500 },
            { month: 'Jul', value: 3490, forecast: 3600 },
          ]
        },
        {
          title: language === "Simplified Chinese" ? "核心指标构成" : "Core Metric Composition",
          type: "pie",
          xAxisKey: "name",
          seriesKeys: ["value"],
          description: language === "Simplified Chinese" ? "各业务板块的贡献占比" : "Contribution share of business segments",
          data: [
            { name: 'Segment A', value: 400 },
            { name: 'Segment B', value: 300 },
            { name: 'Segment C', value: 300 },
            { name: 'Segment D', value: 200 },
          ]
        }
      ],
      rawAnalysis: language === "Simplified Chinese" 
        ? `### 深度分析报告 (${modelIdentity})
        
**数据质量评估**
本地模型扫描了所有输入数据，完整性评分为 98.5%。仅发现少量缺失值，已自动使用均值填充策略进行预处理。

**趋势预测**
基于 Transformer 架构的时间序列预测显示，未来三个周期内业务将保持稳定增长。置信区间为 95%。

**相关性矩阵**
- 变量 A 与 变量 B: **高度相关 (0.92)**
- 变量 C 与 变量 D: **负相关 (-0.45)**

**建议**
1. **优化资源配置**: 针对 Segment A 增加 15% 的计算资源投入。
2. **风险控制**: 监控 Q4 季度的波动性，预置熔断机制。

*(分析由本地 GPU 集群生成，耗时 2.4s)*`
        : `### Deep Analysis Report (${modelIdentity})

**Data Quality Assessment**
The local model scanned all input data, yielding a completeness score of 98.5%. Only minor missing values were found and automatically imputed using mean strategy.

**Trend Prediction**
Transformer-based time series forecasting indicates stable growth over the next three cycles with a 95% confidence interval.

**Recommendations**
1. **Optimize Allocation**: Increase compute resources for Segment A by 15%.
2. **Risk Control**: Monitor volatility in Q4.

*(Analysis generated by Local GPU Cluster in 2.4s)*`
    };

    // 2. Security Check: OUTPUT
    await checkSafetyWithLocalGuard(JSON.stringify(mockResponse), 'output');

    return mockResponse;
  } catch (error) {
    console.error("Local Inference failed:", error);
    throw error;
  }
};

/**
 * Simulates a streaming response from a local LLM.
 */
export const streamChatResponse = async function* (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  contextData: string,
  language: string = "Simplified Chinese",
  modelIdentity: string = "DeepResearch-8B"
) {
  // 1. Security Check: INPUT
  await checkSafetyWithLocalGuard(message, 'input');

  // Realistic mock responses based on common queries
  const mockResponses = language === "Simplified Chinese" 
    ? [
        `收到，正在调用本地 ${modelIdentity} 内核...`,
        `根据您上传的数据，我注意到几个有趣的模式。`,
        `首先，数据中的峰值出现在周末，这可能与用户的使用习惯有关。`,
        `其次，尽管整体趋势向好，但在某些细分领域存在下滑迹象。`,
        `如果您需要更具体的统计测试（如 T-test 或 ANOVA），请告诉我。`,
        `(Response generated locally via localhost:8000)`
      ]
    : [
        `Received. Invoking local ${modelIdentity} kernel...`,
        `Based on your uploaded data, I've noticed several interesting patterns.`,
        `First, the peaks in data occur on weekends, which likely correlates with user usage habits.`,
        `Second, despite the positive overall trend, there are signs of decline in specific sub-segments.`,
        `Let me know if you need specific statistical tests like T-test or ANOVA.`,
        `(Response generated locally via localhost:8000)`
      ];

  for (const part of mockResponses) {
    // Simulate token generation delay
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 300));
    
    // Yield the chunk (simulate token stream)
    yield { text: part + " " };
  }

  // 2. Security Check: OUTPUT
  await checkSafetyWithLocalGuard("Stream complete", 'output');
};