import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as ttspeech from '@google-cloud/text-to-speech'
import * as uuidv4 from 'uuid/v4'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import * as util from 'util'

admin.initializeApp()
const firestore = admin.firestore()
const storage = admin.storage().bucket()
const textToSpeech = new ttspeech.TextToSpeechClient()

export const addWord = functions.region('asia-east2').https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated')
  if (context.auth.uid !== functions.config().admin.uid) throw new functions.https.HttpsError('unauthenticated', 'Admin Only')

  if (!data) throw new functions.https.HttpsError('invalid-argument', 'โปรดกรอกข้อมูล')
  if (!data.vocab) throw new functions.https.HttpsError('invalid-argument', 'โปรดกรอก คำ')
  if (!data.mean) throw new functions.https.HttpsError('invalid-argument', 'โปรดกรอก ความหมาย')
  if (!(data.lesson >= 0)) throw new functions.https.HttpsError('invalid-argument', 'โปรดกรอก เลขบทเรียน')
  if (!data.type) throw new functions.https.HttpsError('invalid-argument', 'โปรดเลือก ประเภท')

  // get sound file
  let soundPath: string
  const filename = `${uuidv4()}.mp3`
  try {
    const [response] = await textToSpeech.synthesizeSpeech({
      input: { text: data.vocab },
      voice: { name: 'ja-JP-Standard-A', languageCode: 'ja-JP' },
      audioConfig: { audioEncoding: 'MP3' }
    })
    soundPath = path.join(os.tmpdir(), filename)
    await util.promisify(fs.writeFile)(soundPath, response.audioContent, 'binary')
  } catch (error) {
    console.error('synthesize', error.message)
    throw new functions.https.HttpsError('internal', 'Synthesize: ' + error.message)
  }

  const downloadToken = uuidv4()
  const soundMetadata = {
    contentType: 'audio/mpeg',
    metadata: {
      firebaseStorageDownloadTokens: downloadToken
    }
  }

  // upload sound
  try {
    await storage.upload(soundPath, {
      destination: `synthesize/${filename}`,
      metadata: soundMetadata
    })
  } catch (error) {
    console.error('upload', error.message)
    throw new functions.https.HttpsError('internal', 'Upload: ' + error.message)
  } finally {
    fs.unlinkSync(soundPath)
  }

  // save to firestore
  const firebasePath = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(`synthesize/${filename}`)}?alt=media&token=${downloadToken}`
  try {
    await firestore.collection('word').add({
      vocab: data.vocab,
      mean: data.mean,
      note: data.note || '',
      lesson: data.lesson,
      type: data.type,
      sound: firebasePath
    })
  } catch (error) {
    console.error('save', error.message)
    throw new functions.https.HttpsError('internal', 'Save: ' + error.message)
  }

  return {
    message: 'เพิ่มคำศัพท์เรียบร้อย'
  }
})
