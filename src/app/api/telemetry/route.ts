import { NextRequest } from 'next/server'

// Deterministic synthetic telemetry — same minute = same sequence for all clients
const EVENTS = [
  'BUILD_COMPLETED', 'DEPLOY_TRIGGERED', 'CACHE_HIT', 'REQUEST_SERVED',
  'AGENT_TICK', 'SCRAPER_CYCLE', 'LLM_INFERENCE', 'EMBED_COMPUTED',
  'WEBHOOK_FIRED', 'DB_QUERY', 'CDN_PURGE', 'HEALTH_CHECK',
]
const REGIONS = ['EU-WEST', 'US-EAST', 'APAC', 'US-WEST', 'EU-CENTRAL']

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 43758.5453123
  return x - Math.floor(x)
}

function generateEvent(tick: number, minuteSeed: number) {
  const s1 = seededRand(minuteSeed + tick * 7.3)
  const s2 = seededRand(minuteSeed + tick * 13.1)
  const s3 = seededRand(minuteSeed + tick * 3.7)
  return {
    id:        tick,
    type:      EVENTS[Math.floor(s1 * EVENTS.length)],
    region:    REGIONS[Math.floor(s2 * REGIONS.length)],
    latencyMs: Math.floor(s3 * 280 + 4),
    ts:        Date.now(),
  }
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()
  let tick = 0

  const stream = new ReadableStream({
    start(controller) {
      const minuteSeed = Math.floor(Date.now() / 60000)

      const interval = setInterval(() => {
        // Emit 1-3 events per tick to simulate 8–24/sec burst
        const count = 1 + Math.floor(seededRand(minuteSeed + tick) * 3)
        for (let i = 0; i < count; i++) {
          const event = generateEvent(tick * 10 + i, minuteSeed)
          const data = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(data))
        }
        tick++
      }, 120) // ~8-24 events/sec

      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
