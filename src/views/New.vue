<template>
  <v-container>
    <v-snackbar v-model="successSnackbar" top color="success">{{ successMessage }}</v-snackbar>
    <v-snackbar v-model="errorSnackbar" top color="error">{{ errorMessage }}</v-snackbar>
    <h1 class="text-center mt-2 mb-6">Japanese - Thai</h1>
    <v-form ref="form" v-model="isValid">
      <v-text-field ref="vocab_field" v-model="vocab" :rules="[v => !!v || 'โปรดกรอกคำ']" label="คำ (ญี่ปุ่น)" outlined hint="คำจะถูกนำไปแปลงเป็นเสียง" :disabled="loading" autofocus autocomplete="off" class="jp-vocab"/>
      <v-text-field v-model="mean" :rules="[v => !!v || 'โปรดกรอกความหมาย']" label="ความหมาย (ไทย)" outlined :disabled="loading" autocomplete="off"/>
      <v-select v-model.number="lesson" label="บทเรียน" :rules="[v => typeof v === 'number' && v >= 0 && v <= 12 || 'โปรดเลือกเลขบทเรียน']" :items="lessonList" outlined :disabled="loading"/>
      <v-text-field v-model="note" label="Note" outlined hide-details :disabled="loading" autocomplete="off"/>
      <v-radio-group v-model="type" :rules="[v => !!v || 'โปรดเลือกประเภท']" label="ประเภท" mandatory :disabled="loading">
        <v-radio v-for="item in typeList" :key="item.value" :label="item.text" :value="item.value"/>
      </v-radio-group>
      <v-btn color="success" @click="addWord" :disabled="!isValid" :loading="loading">
        <v-icon left>mdi-plus</v-icon>
        Add
      </v-btn>
    </v-form>
  </v-container>
</template>

<script>
import { functions } from '../firebase'

export default {
  name: 'New',
  data () {
    return {
      isValid: false,
      loading: false,
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
      vocab: null,
      mean: null,
      lesson: null,
      note: null,
      type: null,
      successSnackbar: false,
      successMessage: '',
      errorSnackbar: false,
      errorMessage: ''
    }
  },
  methods: {
    addWord () {
      if (this.loading) return null
      this.successMessage = ''
      this.errorMessage = ''
      this.loading = true
      const addWord = functions.httpsCallable('addWord')
      addWord({
        vocab: this.vocab,
        mean: this.mean,
        lesson: this.lesson,
        note: this.note,
        type: this.type
      }).then((response) => {
        this.vocab = null
        this.mean = null
        this.note = null
        this.$refs.form.resetValidation()
        this.successMessage = response.data.message
        this.successSnackbar = true
      }).catch((error) => {
        this.errorMessage = 'Error: ' + error.message
        this.errorSnackbar = true
      }).finally(() => {
        this.loading = false
        this.$nextTick(() => {
          this.$refs.vocab_field.$refs.input.focus()
        })
      })
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
