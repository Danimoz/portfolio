import test from 'node:test'
import assert from 'node:assert/strict'
import { buildContactEnquiry } from '../src/lib/contactEnquiry.ts'

test('a commission enquiry delivers the requested music and performance details together', () => {
  const form = new FormData()
  form.set('name', 'Ada Performer')
  form.set('email', 'ada@example.com')
  form.set('message', 'A new work for our anniversary concert.')
  form.set('enquiryType', 'commission')
  form.set('service', 'Original composition')
  form.set('ensemble', 'Orchestra')
  form.set('instrumentation', 'Chamber orchestra with solo flute')
  form.set('duration', '8–10 minutes')
  form.set('deadline', 'September 2027')
  form.set('budget', 'Please advise on the fee')

  const enquiry = buildContactEnquiry(form)
  assert.equal(enquiry.subject, 'Music commission enquiry from Ada Performer')
  assert.equal(enquiry.email, 'ada@example.com')
  assert.equal(enquiry.message, [
    'Service: Original composition',
    'Performers: Orchestra',
    'Instrumentation: Chamber orchestra with solo flute',
    'Approximate duration: 8–10 minutes',
    'Deadline or performance date: September 2027',
    'Budget: Please advise on the fee',
    '',
    'A new work for our anniversary concert.',
  ].join('\n'))
})

test('ordinary contact messages stay unchanged and tentative commissions can omit optional details', () => {
  const form = new FormData()
  form.set('name', '  Ada  ')
  form.set('email', 'ada@example.com')
  form.set('message', 'Could we discuss a concert?')
  assert.equal(buildContactEnquiry(form).message, 'Could we discuss a concert?')
  assert.equal(buildContactEnquiry(form).subject, 'Contact message from Ada')
  form.set('enquiryType', 'commission')
  assert.match(buildContactEnquiry(form).message, /Instrumentation: Not specified/)
  assert.match(buildContactEnquiry(form).message, /Could we discuss a concert\?$/)
})

test('invalid contact details and excessive input are rejected before delivery', () => {
  const form = new FormData()
  form.set('name', 'Ada')
  form.set('email', 'not-an-email')
  form.set('message', 'A piece for flute.')
  assert.throws(() => buildContactEnquiry(form), /valid email/)
  form.set('email', 'ada@example.com')
  form.set('message', '  ')
  assert.throws(() => buildContactEnquiry(form), /message/)
  form.set('message', 'x'.repeat(5001))
  assert.throws(() => buildContactEnquiry(form), /5000/)
  form.set('message', 'A piece for flute.')
  form.set('name', 'Ada\r\nInjected subject')
  assert.throws(() => buildContactEnquiry(form), /name/)
})
