import * as functions from 'firebase-functions'

export const addWord = functions.region('asia-east2').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated')
  }
  return {
    message: 'Add word success'
  }
})
