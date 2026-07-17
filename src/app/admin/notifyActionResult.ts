import toast from 'react-hot-toast'

type ActionResult = {
  status: number
}

export function notifyActionResult(
  result: ActionResult,
  messages: { success: string; error: string },
) {
  if (result.status === 201) toast.success(messages.success)
  else toast.error(messages.error)
}
