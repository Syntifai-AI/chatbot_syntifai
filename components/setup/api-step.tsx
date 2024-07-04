import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FC } from "react"
import { Button } from "../ui/button"

interface APIStepProps {
  openaiAPIKey: string
  openaiOrgID: string
  azureOpenaiAPIKey: string
  azureOpenaiEndpoint: string
  azureOpenai4OID: string
  azureOpenaiEmbeddingsID: string
  anthropicAPIKey: string
  googleGeminiAPIKey: string
  mistralAPIKey: string
  groqAPIKey: string
  perplexityAPIKey: string
  useAzureOpenai: boolean
  openrouterAPIKey: string
  flowiseAPIKey: string // Adiciona esta linha
  onOpenrouterAPIKeyChange: (value: string) => void
  onOpenaiAPIKeyChange: (value: string) => void
  onOpenaiOrgIDChange: (value: string) => void
  onAzureOpenaiAPIKeyChange: (value: string) => void
  onAzureOpenaiEndpointChange: (value: string) => void
  onAzureOpenai4OIDChange: (value: string) => void
  onAzureOpenaiEmbeddingsIDChange: (value: string) => void
  onAnthropicAPIKeyChange: (value: string) => void
  onGoogleGeminiAPIKeyChange: (value: string) => void
  onMistralAPIKeyChange: (value: string) => void
  onGroqAPIKeyChange: (value: string) => void
  onPerplexityAPIKeyChange: (value: string) => void
  onFlowiseAPIKeyChange: (value: string) => void // Adiciona esta linha
  onUseAzureOpenaiChange: (value: boolean) => void
}

export const APIStep: FC<APIStepProps> = ({
  openaiAPIKey,
  openaiOrgID,
  azureOpenaiAPIKey,
  azureOpenaiEndpoint,
  azureOpenai4OID,
  azureOpenaiEmbeddingsID,
  anthropicAPIKey,
  googleGeminiAPIKey,
  mistralAPIKey,
  groqAPIKey,
  perplexityAPIKey,
  openrouterAPIKey,
  flowiseAPIKey, // Adiciona esta linha
  useAzureOpenai,
  onOpenaiAPIKeyChange,
  onOpenaiOrgIDChange,
  onAzureOpenaiAPIKeyChange,
  onAzureOpenaiEndpointChange,
  onAzureOpenai4OIDChange,
  onAzureOpenaiEmbeddingsIDChange,
  onAnthropicAPIKeyChange,
  onGoogleGeminiAPIKeyChange,
  onMistralAPIKeyChange,
  onGroqAPIKeyChange,
  onPerplexityAPIKeyChange,
  onFlowiseAPIKeyChange, // Adiciona esta linha
  onUseAzureOpenaiChange,
  onOpenrouterAPIKeyChange
}) => {
  return (
    <>
      <div className="mt-5 space-y-2">
        <Label className="flex items-center">
          <div>
            {useAzureOpenai ? "Azure OpenAI API Key" : "OpenAI API Key"}
          </div>

          <Button
            className="ml-3 h-[18px] w-[150px] text-[11px]"
            onClick={() => onUseAzureOpenaiChange(!useAzureOpenai)}
          >
            {useAzureOpenai
              ? "Switch To Standard OpenAI"
              : "Switch To Azure OpenAI"}
          </Button>
        </Label>

        <Input
          placeholder={
            useAzureOpenai ? "Azure OpenAI API Key" : "OpenAI API Key"
          }
          type="password"
          value={useAzureOpenai ? azureOpenaiAPIKey : openaiAPIKey}
          onChange={e =>
            useAzureOpenai
              ? onAzureOpenaiAPIKeyChange(e.target.value)
              : onOpenaiAPIKeyChange(e.target.value)
          }
        />
      </div>

      <div className="ml-8 space-y-3">
        {useAzureOpenai ? (
          <>
            <div className="space-y-1">
              <Label>Azure OpenAI Endpoint</Label>

              <Input
                placeholder="https://your-endpoint.openai.azure.com"
                type="password"
                value={azureOpenaiEndpoint}
                onChange={e => onAzureOpenaiEndpointChange(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Azure OpenAI GPT-4 O ID</Label>

              <Input
                placeholder="Azure OpenAI GPT-4 O ID"
                type="password"
                value={azureOpenai4OID}
                onChange={e => onAzureOpenai4OIDChange(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Azure OpenAI Embeddings ID</Label>

              <Input
                placeholder="Azure OpenAI Embeddings ID"
                type="password"
                value={azureOpenaiEmbeddingsID}
                onChange={e => onAzureOpenaiEmbeddingsIDChange(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <Label>OpenAI Organization ID</Label>

              <Input
                placeholder="OpenAI Organization ID (optional)"
                type="password"
                value={openaiOrgID}
                onChange={e => onOpenaiOrgIDChange(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <div className="space-y-1">
        <Label>Anthropic API Key</Label>

        <Input
          placeholder="Anthropic API Key"
          type="password"
          value={anthropicAPIKey}
          onChange={e => onAnthropicAPIKeyChange(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label>Google Gemini API Key</Label>

        <Input
          placeholder="Google Gemini API Key"
          type="password"
          value={googleGeminiAPIKey}
          onChange={e => onGoogleGeminiAPIKeyChange(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label>Mistral API Key</Label>

        <Input
          placeholder="Mistral API Key"
          type="password"
          value={mistralAPIKey}
          onChange={e => onMistralAPIKeyChange(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label>Groq API Key</Label>

        <Input
          placeholder="Groq API Key"
          type="password"
          value={groqAPIKey}
          onChange={e => onGroqAPIKeyChange(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label>Perplexity API Key</Label>

        <Input
          placeholder="Perplexity API Key"
          type="password"
          value={perplexityAPIKey}
          onChange={e => onPerplexityAPIKeyChange(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label>OpenRouter API Key</Label>

        <Input
          placeholder="OpenRouter API Key"
          type="password"
          value={openrouterAPIKey}
          onChange={e => onOpenrouterAPIKeyChange(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label>Flowise API Key</Label> {/* Adiciona esta linha */}
        <Input
          placeholder="Flowise API Key"
          type="password"
          value={flowiseAPIKey}
          onChange={e => onFlowiseAPIKeyChange(e.target.value)}
        />
      </div>
    </>
  )
}
