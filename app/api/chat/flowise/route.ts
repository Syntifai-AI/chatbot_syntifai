import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { Database } from "@/supabase/types"
import NodeCache from "node-cache"

export const runtime = "edge"

interface FlowiseApiResponse {
  text: string
}

const cache = new NodeCache({ stdTTL: 600 })

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile: Database["public"]["Tables"]["profiles"]["Row"] =
      await getServerProfile()

    checkApiKey(profile.flowise_api_key, "Flowise")

    const cacheKey = `${profile.flowise_api_key}-${messages.map(m => m.content).join("-")}`
    const cachedResponse = cache.get<FlowiseApiResponse>(cacheKey)

    if (cachedResponse) {
      console.log("Cache hit for key:", cacheKey)
      const stream = await simulateStreaming(cachedResponse.text)
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        }
      })
    }

    console.log("Cache miss for key:", cacheKey)
    const response = await fetch(
      "https://flow.syntifai.work/api/v1/prediction/7d08042d-df78-412e-a6f6-f1bea4bd5164",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${profile.flowise_api_key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: messages.map(m => m.content).join(" "),
          overrideConfig: {
            sessionId: "123",
            returnSourceDocuments: true
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Flowise server responded with ${response.status}`)
    }

    const data: FlowiseApiResponse = await response.json()
    cache.set(cacheKey, data)

    const stream = await simulateStreaming(data.text)

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      }
    })
  } catch (error: any) {
    console.error("Error in POST /api/chat/flowise:", error)

    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Flowise API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Flowise API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}

async function simulateStreaming(fullText: string) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      let position = 0
      const chunkSize = 100 // Aumentei o tamanho do chunk para melhorar a performance
      const delay = 50 // Reduzi o tempo de delay entre chunks

      function push() {
        if (position >= fullText.length) {
          controller.close()
          return
        }

        const chunk = fullText.slice(position, position + chunkSize)
        controller.enqueue(encoder.encode(chunk))
        position += chunkSize

        setTimeout(push, delay)
      }

      push()
    }
  })

  return stream
}
