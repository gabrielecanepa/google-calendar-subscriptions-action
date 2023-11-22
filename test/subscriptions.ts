import { auth, calendar, calendar_v3 } from 'google-calendar-subscriptions'
import { toArray } from '../src/utils'

const CLIENT_EMAIL = process.env.TEST_CLIENT_EMAIL
const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY
const SUBSCRIPTION_URLS = process.env.TEST_SUBSCRIPTIONS_URLS
const SCOPES = ['https://www.googleapis.com/auth/calendar']

const subscriptionUrls: string[] = toArray(SUBSCRIPTION_URLS)

if (!CLIENT_EMAIL || !PRIVATE_KEY || !subscriptionUrls.length)
  throw new Error('Missing required environment variables.')

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

const createSubscriptions = async (urls: string[]): Promise<calendar_v3.Schema$Subscription[]> => {
  const promises = urls.map(url => {
    const params: calendar_v3.Params$Resource$Subscriptions$Insert = { requestBody: { url } }
    return client.subscriptions.insert(params)
  })
  return await Promise.all(promises)
}

let subscriptions: calendar_v3.Schema$Subscription[]

(async (): Promise<void> => {
  subscriptions = await createSubscriptions(subscriptionUrls)
})()

export default subscriptions
