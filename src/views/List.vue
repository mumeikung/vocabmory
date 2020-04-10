<template>
  <v-container>
    <template v-if="!playing">
      <v-snackbar v-model="errorSnackbar" top color="error" :timeout="50000">{{ errorMessage }}</v-snackbar>
      <h1 class="text-center mt-2 mb-6">Japanese - Thai</h1>
      <v-select v-model="lesson" label="บทเรียน" :items="lessonList" outlined :loading="loading || starting" :readonly="loading" hide-details multiple :disabled="starting">
        <template v-slot:prepend-item>
          <v-list-item ripple @click="selectAll">
            <v-list-item-action>
              <v-icon :color="lesson.length > 0 ? 'primary' : ''">{{ selectIcon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Select All</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider/>
        </template>
      </v-select>
      <v-row v-if="wordList.length > 1" dense>
        <v-col cols="6">
          <v-checkbox v-model="target" value="jtt" label="JP (Text) -> TH" :disabled="(target.length <= 1 && target[0] === 'jtt') || starting" hide-details></v-checkbox>
        </v-col>
        <v-col cols="6">
          <v-checkbox v-model="target" value="ttj" label="TH (Text) -> JP" :disabled="(target.length <= 1 && target[0] === 'ttj') || starting" hide-details></v-checkbox>
        </v-col>
        <v-col cols="6">
          <v-checkbox v-model="target" value="sound" label="JP (Sound) -> TH" :disabled="(target.length <= 1 && target[0] === 'sound') || starting" hide-details></v-checkbox>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model.number="limit" type="number" label="จำนวนตัวเลือกมากสุด" min="2" max="10" inputmode="numeric" outlined hide-details dense :disabled="(target.length <= 1 && target[0] === 'type') || starting"/>
        </v-col>
        <v-col cols="12">
          <v-checkbox v-model="target" value="type" label="TH (Text) -> JP (Text)" :disabled="(target.length <= 1 && target[0] === 'type') || starting"></v-checkbox>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model.number="amount" type="number" label="จำนวนข้อ" min="2" :max="wordList.length" inputmode="numeric" outlined hide-details dense :disabled="starting"/>
        </v-col>
        <v-col cols="12">
          <v-btn block color="primary" @click="startGame">
            <v-icon left>{{ starting ? 'mdi-cloud-upload-outline' : 'mdi-racing-helmet' }}</v-icon>
            {{ starting ? 'LINKING' : 'LINK START!' }}
          </v-btn>
        </v-col>
      </v-row>
      <v-divider v-if="isShow" class="my-3"></v-divider>
      <v-text-field v-if="isShow" v-model="search" placeholder="ค้นหา..." outlined hide-details></v-text-field>
      <p v-if="isShow" class="caption my-2" v-text="(!search ? '' : `พบ ${searchList.length} จาก`) + `ทั้งหมด ${wordList.length}`"></p>
      <v-list three-line v-if="isShow">
        <template v-if="searchList.length <= 0">
          <v-list-item>
            <v-list-item-title>ไม่พบคำศัพท์</v-list-item-title>
          </v-list-item>
        </template>
        <v-list-item v-for="word in searchList" :key="word.id">
          <v-list-item-content>
            <v-list-item-title class="japan-title" v-text="word.vocab"></v-list-item-title>
            <v-list-item-title class="thai-title">
              {{ word.mean }} <span v-if="word.note">[{{ word.note }}]</span>
            </v-list-item-title>
            <v-list-item-subtitle v-if="word.lesson > 0">Lesson {{ word.lesson }} <span v-if="debug" class="caption">(ID: {{ word.id }}, File: {{ fileName(word.sound) }})</span></v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="playSound(word.sound)">
              <v-icon>mdi-play-circle</v-icon>
            </v-btn>
            <span class="caption" v-text="word.type"/>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-switch v-if="isShow" v-model="debug" label="Debug" hide-details></v-switch>
      <audio ref="sound" hidden controls>
        <source v-if="sound" :src="sound"/>
      </audio>
    </template>
    <template v-else>
      <playing :words="wordList" :random="random" :limit="limit" :target="target" @stop="stopGame"/>
    </template>
    <audio ref="start_sound" hidden controls preload="auto">
      <source src="../assets/sounds/start.ogg" type="audio/ogg">
      <source src="../assets/sounds/start.mp3" type="audio/mpeg">
      <source src="../assets/sounds/start.wav" type="audio/wav">
    </audio>
  </v-container>
</template>

<script>
import { firestore } from '../firebase'
import Playing from '../components/Playing'

export default {
  name: 'List',
  components: {
    Playing
  },
  data () {
    return {
      loading: false,
      search: '',
      wordList: [],
      lessonList: [
        { text: 'Lesson 7', value: 7 },
        { text: 'Lesson 8', value: 8 },
        { text: 'Lesson 9', value: 9 },
        { text: 'Lesson 10', value: 10 },
        { text: 'Lesson 11', value: 11 },
        { text: 'Lesson 12', value: 12 },
        { text: 'Lesson 1', value: 1 },
        { text: 'Lesson 2', value: 2 },
        { text: 'Lesson 3', value: 3 },
        { text: 'Lesson 4', value: 4 },
        { text: 'Lesson 5', value: 5 },
        { text: 'Lesson 6', value: 6 },
        { text: 'อื่น ๆ', value: 0 }
      ],
      lesson: [],
      errorSnackbar: false,
      errorMessage: '',
      sound: null,
      playing: false,
      timeout: 0,
      target: ['jtt', 'ttj', 'sound', 'type'],
      starting: false,
      random: [],
      limit: 5,
      amount: 2,
      debug: false
    }
  },
  computed: {
    isSelectdAll () {
      return this.lesson.length === this.lessonList.length
    },
    isSelectdSome () {
      return this.lesson.length > 0 && !this.isSelectdAll
    },
    selectIcon () {
      if (this.isSelectdAll) return 'mdi-close-box'
      if (this.isSelectdSome) return 'mdi-minus-box'
      return 'mdi-checkbox-blank-outline'
    },
    searchList () {
      return this.wordList.filter(a => a.vocab.search(this.search) >= 0 || a.mean.search(this.search) >= 0)
    },
    isShow () {
      return this.loading === false && this.lesson.length > 0
    }
  },
  methods: {
    selectAll () {
      const lesson = []
      for (let i = 1; i <= 12; i++) lesson.push(i)
      lesson.push(0)
      if (this.lesson.length !== lesson.length) {
        this.lesson = lesson
      } else {
        this.lesson = []
      }
    },
    playSound (url) {
      if (this.sound !== url) {
        this.sound = url
        this.$refs.sound.load()
      }
      this.$refs.sound.play()
    },
    playStart () {
      this.$refs.start_sound.play()
    },
    startGame () {
      if (this.starting) return null
      this.starting = true
      const allList = []
      const random = []
      for (let i = 0; i < this.wordList.length; i++) allList.push(i)
      let start = this.amount || 2
      while (allList.length > 0 && start > 0) {
        const index = Math.floor(Math.random() * allList.length)
        random.push(...allList.splice(index, 1))
        start -= 1
      }
      this.random = random
      this.starting = false
      this.playing = true
      this.playStart()
    },
    stopGame () {
      this.playing = false
      this.random = []
    },
    fileName (url = '') {
      const found = url.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}.mp3/g)
      return (found[0] || '').replace('.mp3', '')
    }
  },
  watch: {
    lesson (val) {
      this.errorSnackbar = false
      if (val.length > 0 && !this.loading) {
        this.loading = null
        clearTimeout(this.timeout)
        this.timeout = setTimeout(async () => {
          this.loading = true
          this.wordList = []
          try {
            if (val.length > 10 && val.length !== this.lessonList.length) throw new Error('สามารถเลือกได้ไม่เกิน 10 บทเรียน')
            const ref = val.length === this.lessonList.length ? firestore.collection('word').orderBy('lesson', 'asc') : firestore.collection('word').where('lesson', 'in', val)
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
            this.amount = wordList.length
            this.wordList = wordList.sort((a, b) => sortList[a.type] - sortList[b.type]).sort((a, b) => a.lesson - b.lesson)
            this.loading = false
          } catch (error) {
            this.errorMessage = error.message
            this.errorSnackbar = true
            this.loading = null
          }
        }, val.length === this.lessonList.length ? 1 : 1500)
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
.thai-title {
  font-family: 'Sarabun' !important;
}
</style>
