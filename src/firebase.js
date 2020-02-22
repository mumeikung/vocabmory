import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'
import config from './config'

firebase.initializeApp(config)

export const auth = firebase.auth
export const firestore = firebase.firestore
export const functions = firebase.functions

export default firebase
