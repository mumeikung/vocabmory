<template>
  <v-row>
    <v-col cols="12">
      <v-btn block @click="stopGame" color="error" :outlined="!ended">{{ ended ? 'STOP!' : 'QUIT!' }}</v-btn>
      <v-divider class="mt-4"/>
      <h3 class="mt-4 text-center">Correct {{ correct }} of {{ past }} ({{ percent }})</h3>
      <v-divider class="mt-4"/>
      <h3 v-if="nextQ" class="mt-4 text-center">WAITING NEXT QUESTION</h3>
    </v-col>
    <template v-if="!ended && question !== null">
      <v-col cols="12" class="text-center">
        <v-btn v-if="type === 'sound'" icon @click="playSound()" x-large color="primary" outlined>
          <v-icon>mdi-play-circle</v-icon>
        </v-btn>
        <v-card v-else-if="type === 'jtt' || type === 'ttj'">
          <v-card-text>
            <h1 class="japan-question">
              {{ getQuestion(question) }}
            </h1>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-divider/>
      </v-col>
      <v-col cols="12" v-for="(choice, i) in choices" :key="i">
        <v-card outlined @click="answerMe(choice)" :color="getColor(question, choice, answer)">
          <v-card-text class="text-center">
            <h3 class="japan-answer">
              {{ getAnswer(choice) }}
            </h3>
          </v-card-text>
        </v-card>
      </v-col>
    </template>
    <audio ref="sound" hidden controls>
      <source v-if="sound" :src="sound"/>
    </audio>
  </v-row>
</template>

<script>
export default {
  name: 'Playing',
  props: {
    words: {
      type: Array,
      default: () => []
    },
    target: {
      type: Array,
      default: () => ['jtt']
    },
    random: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: 4
    }
  },
  data () {
    return {
      sound: null,
      questions: [],
      question: null,
      choices: [],
      answer: null,
      type: null,
      ended: false,
      nextQ: false,
      correct: 0,
      past: 0
    }
  },
  mounted () {
    this.questions = [...this.random]
    this.nextQ = true
    setTimeout(() => {
      this.nextQuestion()
    }, 3000)
  },
  methods: {
    nextQuestion () {
      if (this.questions.length <= 0) {
        this.ended = true
        this.nextQ = false
        return null
      }
      const question = this.questions.pop()
      const count = this.words.length < this.limit ? this.words.length : this.limit
      const correct = Math.floor(Math.random() * count)
      const choices = []
      const type = this.target[Math.floor(Math.random() * this.target.length)]
      for (let i = 0; i < count; i++) {
        if (i === correct) choices[i] = question
        else {
          let index = question
          while (index === question) index = Math.floor(Math.random() * this.words.length)
          choices[i] = index
        }
      }
      this.question = question
      this.choices = choices
      this.type = type
      this.nextQ = false
      this.answer = null
      if (type === 'sound') {
        this.playSound(this.words[question].sound)
      }
    },
    answerMe (index) {
      if (this.answer !== null) return null
      this.answer = index
      this.past += 1
      if (index !== this.question) {
        if (this.type === 'sound') {
          this.playSound()
        }
      } else {
        this.correct += 1
      }
      setTimeout(() => {
        this.nextQuestion()
      }, 3500)
    },
    playSound (url = '') {
      if (!!url && this.sound !== url) {
        this.sound = url
        this.$refs.sound.load()
      }
      this.$refs.sound.play()
    },
    stopGame () {
      this.$emit('stop')
    },
    getQuestion (index) {
      if (!this.words[index]) return ''
      if (this.type === 'jtt') return this.words[index].vocab
      if (this.type === 'ttj') return this.words[index].mean
      return ''
    },
    getAnswer (index) {
      if (!this.words[index]) return ''
      if (this.type === 'jtt' || this.type === 'sound') return this.words[index].mean
      if (this.type === 'ttj') return this.words[index].vocab
      return ''
    },
    getColor (question, choice, answer) {
      if (answer === null) return ''
      if (choice === question) return 'success'
      if (choice === answer && answer !== question) return 'error'
      return ''
    }
  },
  computed: {
    percent () {
      if (this.past <= 0) return '0%'
      return ((this.correct / this.past) * 100).toFixed(2) + '%'
    }
  }
}
</script>

<style>
.japan-question {
  font-family: 'Aozora Mincho' !important;
  font-size: 3em !important;
  line-height: 1.25em !important;
  font-weight: 900 !important;
  color: black;
}
.japan-answer {
  font-family: 'Aozora Mincho' !important;
  font-size: 1.5em !important;
  line-height: 1.25em !important;
  font-weight: 500 !important;
  color: black;
}
</style>
