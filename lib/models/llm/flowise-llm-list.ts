import { LLM } from "@/types"

const FLOWISE_PLATFORM_LINK = "https://flow.syntifai.work/docs/overview"

const FlowiseModel: LLM = {
  modelId: "flowise",
  modelName: "Flowise Model",
  provider: "flowise",
  hostedId: "flowise",
  platformLink: FLOWISE_PLATFORM_LINK,
  imageInput: false,
  pricing: {
    currency: "USD",
    unit: "1M tokens",
    inputCost: 0.1,
    outputCost: 0.1
  }
}

export const FLOWISE_LLM_LIST: LLM[] = [FlowiseModel];