import toast from 'react-hot-toast'

type ActionResult = {
  status: number
  message?: string
}

export function notifyActionResult(
  result: ActionResult,
  messages: { success: string; error: string },
) {
  if (result.status >= 200 && result.status < 300) toast.success(messages.success)
  else toast.error(result.message ?? messages.error)
}
