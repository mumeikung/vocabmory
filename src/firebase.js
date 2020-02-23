import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'
import config from './config'

firebase.initializeApp(config)

const firestore = firebase.firestore()
firestore.enablePersistence({
  synchronizeTabs: true
})

export const auth = firebase.auth
export { firestore }
export const functions = firebase.app().functions('asia-east2')

export default firebase.app()
