import { NextRequest, NextResponse } from "next/server"
import { checkFreeBusy, createCalendarEvent, deleteCalendarEvent, getCalendarStatus } from "@/lib/google/calendar"

export async function GET(req: NextRequest) {
  const profissional_id = req.nextUrl.searchParams.get("profissional_id")
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  const status = await getCalendarStatus(profissional_id)
  return NextResponse.json(status)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { profissional_id, action, ...params } = body

  if (!profissional_id) {
    return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })
  }

  try {
    switch (action) {
      case "check_freebusy": {
        const result = await checkFreeBusy(profissional_id, params.start, params.end)
        return NextResponse.json(result)
      }

      case "create_event": {
        const event = await createCalendarEvent(profissional_id, params)
        return NextResponse.json({ event })
      }

      case "delete_event": {
        await deleteCalendarEvent(profissional_id, params.google_event_id)
        return NextResponse.json({ success: true })
      }

      case "status": {
        const status = await getCalendarStatus(profissional_id)
        return NextResponse.json(status)
      }

      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
