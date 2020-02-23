<template>
  <v-container>
    <v-snackbar v-model="successSnackbar" top color="success">{{ successMessage }}</v-snackbar>
    <v-snackbar v-model="errorSnackbar" top color="error">{{ errorMessage }}</v-snackbar>
    <v-form ref="form" v-model="isValid">
      <v-text-field v-model="vocab" :rules="[v => !!v || 'โปรดกรอกคำ']" label="คำ" outlined hint="คำจะถูกนำไปแปลงเป็นเสียง" :disabled="loading" autocomplete="off"/>
      <v-text-field v-model="mean" :rules="[v => !!v || 'โปรดกรอกความหมาย']" label="ความหมาย" outlined :disabled="loading" autocomplete="off"/>
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
      typeList: [
        { text: 'คำนาม', value: 'noun' },
        { text: 'คำคุณศัพท์', value: 'adjective' },
        { text: 'คำกริยา', value: 'verb' },
        { text: 'สำนวน - วลี', value: 'phrase' },
        { text: 'อื่น ๆ', value: 'other' }
      ],
      vocab: '',
      mean: '',
      note: '',
      type: '',
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
        note: this.note,
        type: this.type
      }).then((response) => {
        this.$refs.form.reset()
        this.successMessage = response.data.message
        this.successSnackbar = true
      }).catch((error) => {
        this.errorMessage = 'Error: ' + error.message
        this.errorSnackbar = true
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
