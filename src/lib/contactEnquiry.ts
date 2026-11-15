export class ContactEnquiryError extends Error {}

export function buildContactEnquiry(data: FormData) {
  const text = (field: string) => {
    const value = data.get(field)
    return typeof value === 'string' ? value.trim() : ''
  }
  const name = text('name')
  const email = text('email')
  const message = text('message')
  if (!name || name.length > 100 || /[\r\n]/.test(name)) {
    throw new ContactEnquiryError('Enter a name of up to 100 characters on one line.')
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ContactEnquiryError('Enter a valid email address.')
  }
  if (!message || message.length > 5000) {
    throw new ContactEnquiryError('Enter a message of up to 5000 characters.')
  }
  const isCommission = text('enquiryType') === 'commission'
  const details = isCommission ? [
    ['Service', 'service'],
    ['Performers', 'ensemble'],
    ['Instrumentation', 'instrumentation'],
    ['Approximate duration', 'duration'],
    ['Deadline or performance date', 'deadline'],
    ['Budget', 'budget'],
  ].map(([label, field]) => {
    const value = text(field)
    if (value.length > 500) throw new ContactEnquiryError(`${label} must be 500 characters or fewer.`)
    return `${label}: ${value || 'Not specified'}`
  }).join('\n') : ''

  return {
    name,
    email,
    subject: `${isCommission ? 'Music commission enquiry' : 'Contact message'} from ${name}`,
    message: isCommission ? `${details}\n\n${message}` : message,
  }
}
