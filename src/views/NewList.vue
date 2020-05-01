<template>
  <v-container fluid>
    <v-snackbar v-model="snackbar" top>{{ snackbarMessage }}</v-snackbar>
    <h1 class="text-center mt-2 mb-6">Japanese - Thai</h1>
    <v-form ref="form" v-model="isValid">
      <v-select v-model.number="lesson" label="บทเรียน" :rules="[v => typeof v === 'number' && v >= 0 && v <= 12 || 'โปรดเลือกเลขบทเรียน']" :items="lessonList" outlined :disabled="loading" hide-details/>
      <v-radio-group v-model="type" :rules="[v => !!v || 'โปรดเลือกประเภท']" label="ประเภท" mandatory row :disabled="loading" hide-details>
        <v-radio v-for="item in typeList" :key="item.value" :label="item.text" :value="item.value"/>
      </v-radio-group>
      <v-row>
        <v-col v-if="!loading" cols="1" class="text-center">
          <v-btn color="success" @click="pushWord" outlined>
            <v-icon left>mdi-plus-circle</v-icon>
            เพิ่มคำ
          </v-btn>
        </v-col>
        <v-col></v-col>
        <v-col cols="3">
          <v-btn v-if="afterLoad" @click="clearTrue" :disabled="loading" block>
            Clear Success
          </v-btn>
        </v-col>
        <v-col cols="3">
          <v-btn color="success" @click="addWords" :disabled="!isValid || afterLoad" :loading="loading" block>
            <v-icon left>mdi-plus</v-icon>
            Add to List
          </v-btn>
        </v-col>
      </v-row>
      <template v-for="(word, i) in wordList">
        <v-divider class="py-1" :key="'hr' + i"></v-divider>
        <v-row dense :key="'text' + i">
          <v-col cols="1" class="text-center">
            <v-btn icon large v-if="word.status === null" :disabled="wordList.length <= 1 || loading" @click="removeWord(i)">
              <v-icon>mdi-minus-circle</v-icon>
            </v-btn>
            <template v-else>
              <v-icon v-if="word.status === true" color="success">mdi-check-circle-outline</v-icon>
              <v-icon v-else-if="word.status === false" color="error">mdi-close-circle-outline</v-icon>
              <v-icon v-else-if="word.status === 'load'" color="primary">mdi-loading mdi-spin</v-icon>
            </template>
          </v-col>
          <v-col>
            <v-text-field v-model="wordList[i].vocab" :rules="[v => !!v || 'โปรดกรอกคำญี่ปุ่น']" label="คำ (ญี่ปุ่น)" outlined hint="คำจะถูกใช้เป็นข้อความ (และเสียงหากช่องถัดไปว่าง)" :disabled="loading || word.status === true" autocomplete="off" class="jp-vocab"/>
          </v-col>
          <v-col>
            <v-text-field v-model="wordList[i].synt" label="เสียงญี่ปุ่น" outlined hint="คำจะถูกนำไปแปลงเป็นเสียง (ไม่จำเป็น)" :disabled="loading || word.status === true" autocomplete="off" class="jp-vocab"/>
          </v-col>
          <v-col>
            <v-text-field v-model="wordList[i].mean" :rules="[v => !!v || 'โปรดกรอกความหมาย']" label="ความหมาย (ไทย)" outlined :disabled="loading || word.status === true" autocomplete="off"/>
          </v-col>
          <v-col>
            <v-text-field v-model="wordList[i].note" label="Note" outlined hide-details :disabled="loading || word.status === true" autocomplete="off"/>
          </v-col>
        </v-row>
      </template>
    </v-form>
  </v-container>
</template>

<script>
import { functions } from '../firebase'

export default {
  name: 'NewList',
  data () {
    return {
      snackbar: false,
      snackbarMessage: '',
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
      typeList: [
        { text: 'คำนาม', value: 'noun' },
        { text: 'คำคุณศัพท์', value: 'adjective' },
        { text: 'คำกริยา', value: 'verb' },
        { text: 'สำนวน - วลี', value: 'phrase' },
        { text: 'อื่น ๆ', value: 'other' }
      ],
      isValid: false,
      loading: false,
      lesson: null,
      type: null,
      wordList: [
        { synt: null, vocab: null, mean: null, note: null, status: null }
      ],
      afterLoad: false
    }
  },
  watch: {
    wordList: {
      handler () {},
      deep: true
    }
  },
  methods: {
    pushWord () {
      this.wordList.push({ synt: null, vocab: null, mean: null, note: null, status: null })
    },
    removeWord (i = -1) {
      if (i >= 0) this.wordList.splice(i, 1)
    },
    async addWords () {
      if (this.loading) return null
      this.afterLoad = false
      this.loading = true
      let success = 0
      let error = 0
      for (let i = 0; i < this.wordList.length; i++) {
        this.wordList[i].status = 'load'
        const bool = await this.addWord(this.wordList[i])
        if (bool) success += 1
        else error += 1
        this.wordList[i].status = bool
      }
      this.snackBar(`สำเร็จ ${success}, เกิดปัญหา ${error}`)
      this.afterLoad = true
      this.loading = false
    },
    async addWord (data = {}) {
      const addWord = functions.httpsCallable('addWord')
      try {
        await addWord({ ...data, lesson: this.lesson, type: this.type })
        return true
      } catch {
        return false
      }
    },
    clearTrue () {
      const wordList = this.wordList.filter(a => a.status === false).map(a => {
        a.status = null
        return a
      })
      if (wordList.length <= 0) {
        wordList.push({ synt: null, vocab: null, mean: null, note: null, status: null })
      }
      this.wordList = wordList
      this.$refs.form.resetValidation()
      this.afterLoad = false
    },
    snackBar (message = '') {
      this.snackbarMessage = message
      this.snackbar = true
    }
  }
}
</script>

<style>
.v-text-field.jp-vocab input {
  font-family: 'Aozora Mincho' !important;
  font-weight: 500;
}
</style>
