<template>
  <v-container>
    <v-snackbar v-model="errorSnackbar" top color="error" :timeout="0">{{ errorMessage }}</v-snackbar>
    <v-row>
      <v-col>
        <v-select v-model="lesson" label="บทเรียน" :items="lessonList" outlined :loading="loading" :readonly="loading" hide-details/>
      </v-col>
    </v-row>
    <v-list three-line v-if="!loading && !!lesson">
      <template v-if="wordList.length <= 0">
        <v-list-item>
          <v-list-item-title>ไม่พบคำศัพท์</v-list-item-title>
        </v-list-item>
      </template>
      <v-list-item v-for="word in wordList" :key="word.id">
        <v-list-item-content>
          <v-list-item-title class="japan-title" v-text="word.vocab"></v-list-item-title>
          <v-list-item-title>
            {{ word.mean }} <span v-if="word.note">({{ word.note }})</span>
          </v-list-item-title>
          <v-list-item-subtitle v-if="word.lesson > 0">Lesson {{ word.lesson }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon @click="playSound(word.sound)">
            <v-icon>mdi-play-circle</v-icon>
          </v-btn>
          <span class="caption" v-text="word.type"/>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <audio ref="sound" hidden controls>
      <source v-if="sound" :src="sound"/>
    </audio>
  </v-container>
</template>

<script>
import { firestore } from '../firebase'

export default {
  name: 'List',
  data () {
    return {
      loading: false,
      wordList: [],
      lessonList: [
        { text: 'ทั้งหมด', value: 'all' },
        { text: 'Lesson 1', value: 1 },
        { text: 'Lesson 2', value: 2 },
        { text: 'Lesson 3', value: 3 },
        { text: 'Lesson 4', value: 4 },
        { text: 'Lesson 5', value: 5 },
        { text: 'Lesson 6', value: 6 },
        { text: 'Lesson 7', value: 7 },
        { text: 'Lesson 8', value: 8 },
        { text: 'Lesson 9', value: 9 },
        { text: 'Lesson 10', value: 10 },
        { text: 'Lesson 11', value: 11 },
        { text: 'Lesson 12', value: 12 },
        { text: 'อื่น ๆ', value: 0 }
      ],
      lesson: null,
      errorSnackbar: false,
      errorMessage: '',
      sound: null
    }
  },
  methods: {
    playSound (url) {
      if (this.sound !== url) {
        this.sound = url
        this.$refs.sound.load()
      }
      this.$refs.sound.play()
    }
  },
  watch: {
    async lesson (val) {
      if (val && !this.loading) {
        this.loading = true
        this.wordList = []
        const ref = val === 'all' ? firestore.collection('word').orderBy('lesson', 'asc') : firestore.collection('word').where('lesson', '==', val)
        try {
          const getWord = await ref.get()
          const wordList = []
          getWord.forEach((doc) => {
            wordList.push({
              id: doc.id,
              ...doc.data()
            })
          })
          const sortList = {
            noun: 1,
            adjective: 2,
            verb: 3,
            phrase: 4,
            other: 5
          }
          this.wordList = wordList.sort((a, b) => sortList[a.type] - sortList[b.type]).sort((a, b) => a.lesson - b.lesson)
        } catch (error) {
          this.errorMessage = error.message
          this.errorSnackbar = true
          console.error(error)
        } finally {
          this.loading = false
        }
      } else {
        this.wordList = []
      }
    }
  }
}
</script>

<style>
.japan-title {
  font-family: 'Aozora Mincho' !important;
  font-size: 1.25em !important;
  line-height: 1.25em !important;
  font-weight: 500 !important;
}
</style>
