import { debug, getInput, info, setFailed, setOutput, setSecret } from '@actions/core'
import { auth, calendar, calendar_v3 } from 'google-calendar-subscriptions'
import { CLIENT_EMAIL, PRIVATE_KEY } from './env'
import { instanceOfSubscription } from './utils'

const SCOPES = ['https://www.googleapis.com/auth/calendar']

export const run = async (): Promise<void> => {
  try {
    // Check the secrets.
    debug('Checking validity of secrets...')

    setSecret('CLIENT_EMAIL')
    setSecret('PRIVATE_KEY')

    if (!CLIENT_EMAIL || !PRIVATE_KEY)
      throw Error('Wrong CLIENT_EMAIL or PRIVATE_KEY.')

    debug('Secrets are valid.')

    // Initialize the client.
    debug('Initializing Google Calendar client...')

    const client = calendar({
      version: 'v3',
      auth: new auth.GoogleAuth({
        credentials: {
          client_email: CLIENT_EMAIL,
          private_key: PRIVATE_KEY,
        },
        scopes: SCOPES,
      }),
    })

    debug('Google Calendar client initialized.')
      
    // Retrieve the subscriptions.
    debug('Retrieving calendar subscriptions...')

    const subscriptionsPath = getInput('subscriptions')
    const subscriptions = ((await import(subscriptionsPath)).default || []) as calendar_v3.Schema$Subscription[]

    if (!subscriptions.length)
      throw Error('No subscriptions found.')

    if (!subscriptions.every(subscription => instanceOfSubscription(subscription)))
      throw Error('Wrong subscriptions format.')

    const subscriptionsName = subscriptions.map(subscription => subscription.summary).join(', ')

    debug(`Found ${subscriptions.length} subscriptions: ${subscriptionsName}.`)

    // Sync the subscriptions.
    info(`Syncing subscriptions ${subscriptionsName}...`)

    await client.subscriptions.sync({ requestBody: subscriptions })

    info('Subscriptions successfully synced.')

    // Return the subscriptions with the updated events.
    info('Retrieving the updated subscriptions...')

    const updatedSubscriptions = Promise.all(subscriptions.map(async subscription => {
      const events = await client.events.list({ calendarId: subscription.calendarId })
      return { ...subscription, events }
    }))

    info('Updated subscriptions successfully retrieved.')

    // Set the output.
    debug('Setting the output...')

    setOutput('subscriptions', await updatedSubscriptions)

    debug('Output set.')
  } catch ({ message }) {
    setFailed(message)
  }
}
