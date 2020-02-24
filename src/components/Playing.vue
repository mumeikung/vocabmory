<template>
  <v-row>
    <v-col cols="12">
      <v-btn block @click="stopGame" color="error" :outlined="!ended">{{ ended ? 'END!' : 'QUIT!' }}</v-btn>
      <v-divider class="mt-4"/>
      <h3 class="mt-4 text-center">
        Question {{ random.length - questions.length }} of {{ random.length }}
        <br>
        Correct {{ correct }} of {{ past }} ({{ percent }})
      </h3>
      <v-divider class="mt-4"/>
      <h3 v-if="nextQ" class="mt-4 text-center">WAITING NEXT QUESTION</h3>
    </v-col>
    <template v-if="!ended && question !== null">
      <v-col cols="12" class="text-center">
        <v-btn v-if="type === 'sound'" icon @click="playSound()" x-large color="primary" outlined>
          <v-icon>mdi-play-circle</v-icon>
        </v-btn>
        <v-card v-else-if="type === 'jtt' || type === 'ttj' || type === 'type'">
          <v-card-text>
            <h1 :class="(type === 'ttj' || type === 'type' ? 'thai' : 'japan') + ' text-question'">
              {{ getQuestion(question) }}
            </h1>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-divider/>
      </v-col>
      <v-col cols="12" v-if="type === 'type'" class="text-center">
        <v-text-field v-if="answer === null" v-model.trim="answerText" label="Answer" class="jp-answer" append-icon="mdi-send" @click:append="answerType" @keypress.enter="answerType" outlined autofocus hide-details></v-text-field>
        <h3 v-if="answer !== null && answer !== getAnswer(question)" class="japan text-message-answer success--text">
          {{ getAnswer(question) }}
        </h3>
        <h3 v-if="answer !== null" :class="'japan text-message-answer ' + (answer !== getAnswer(question) ? 'error--text' : 'success--text')">
          {{ answer }}
        </h3>
      </v-col>
      <v-col cols="12" v-for="(choice, i) in choices" :key="i">
        <v-card outlined @click="answerChoice(choice)" :color="getColor(question, choice, answer)">
          <v-card-text class="text-center">
            <h3 :class="(type === 'jtt' ? 'thai' : 'japan') + ' text-answer'">
              {{ getAnswer(choice) }}
            </h3>
          </v-card-text>
        </v-card>
      </v-col>
    </template>
    <audio ref="sound" hidden controls>
      <source v-if="sound" :src="sound"/>
    </audio>
    <audio ref="ready_sound" hidden controls preload="auto">
      <source src="../assets/sounds/ready.ogg" type="audio/ogg">
      <source src="../assets/sounds/ready.mp3" type="audio/mpeg">
      <source src="../assets/sounds/ready.wav" type="audio/wav">
    </audio>
    <audio ref="correct_sound" hidden controls preload="auto">
      <source src="../assets/sounds/correct.ogg" type="audio/ogg">
      <source src="../assets/sounds/correct.mp3" type="audio/mpeg">
      <source src="../assets/sounds/correct.wav" type="audio/wav">
    </audio>
    <audio ref="incorrect_sound" hidden controls preload="auto">
      <source src="../assets/sounds/incorrect.ogg" type="audio/ogg">
      <source src="../assets/sounds/incorrect.mp3" type="audio/mpeg">
      <source src="../assets/sounds/incorrect.wav" type="audio/wav">
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
      answerText: '',
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
      const choices = []
      const type = this.target[Math.floor(Math.random() * this.target.length)]
      if (type !== 'type') {
        const count = this.words.length < this.limit ? this.words.length : this.limit
        const correct = Math.floor(Math.random() * count)
        const worst = [...this.random]
        worst.splice(worst.indexOf(question), 1)
        for (let i = 0; i < count; i++) {
          choices[i] = i === correct ? question : worst.splice(Math.floor(Math.random() * worst.length), 1)[0]
        }
      }
      this.answerText = ''
      this.question = question
      this.choices = choices
      this.type = type
      this.nextQ = false
      this.answer = null
      this.playReady()
      if (type === 'sound') {
        setTimeout(() => {
          this.playSound(this.words[question].sound)
        }, 500)
      }
    },
    answerChoice (index) {
      if (this.answer !== null) return null
      this.answer = index
      this.past += 1
      if (index !== this.question) {
        this.playIncorrect()
        if (this.type === 'sound') {
          setTimeout(() => {
            this.playSound()
          }, 500)
        }
      } else {
        this.playCorrect()
        this.correct += 1
      }
      setTimeout(() => {
        this.nextQuestion()
      }, 3500)
    },
    answerType () {
      if (this.answer !== null) return null
      this.answer = this.answerText
      this.past += 1
      if (this.words[this.question].vocab !== this.answer) {
        this.playIncorrect()
        if (this.type === 'sound') {
          setTimeout(() => {
            this.playSound()
          }, 500)
        }
      } else {
        this.playCorrect()
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
    playReady () {
      this.$refs.ready_sound.play()
    },
    playCorrect () {
      this.$refs.correct_sound.play()
    },
    playIncorrect () {
      this.$refs.incorrect_sound.play()
    },
    stopGame () {
      this.$emit('stop')
    },
    getQuestion (index) {
      if (!this.words[index]) return ''
      if (this.type === 'jtt') return this.words[index].vocab
      if (this.type === 'ttj' || this.type === 'type') return this.words[index].mean
      return ''
    },
    getAnswer (index) {
      if (!this.words[index]) return ''
      if (this.type === 'jtt' || this.type === 'sound') return this.words[index].mean
      if (this.type === 'ttj' || this.type === 'type') return this.words[index].vocab
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
.japan {
  font-family: 'Aozora Mincho' !important;
}
.thai {
  font-family: 'Sarabun' !important;
}
.text-question.japan {
  font-size: 2.75em !important;
}
.text-question.thai {
  font-size: 2em !important;
}
.text-answer.japan {
  font-size: 1.75em !important;
}
.text-answer.thai {
  font-size: 1.25em !important;
}
.text-question {
  line-height: 1.25em !important;
  font-weight: 700 !important;
  color: black;
}
.text-answer {
  line-height: 1.25em !important;
  font-weight: 500 !important;
  color: black;
}
.text-message-answer {
  font-size: 2em !important;
  line-height: 2em !important;
  font-weight: 700 !important;
}
.v-text-field.jp-answer input {
  line-height: 1.25em !important;
  font-family: 'Aozora Mincho' !important;
  font-size: 1.75em !important;
  font-weight: 500 !important;
  max-height: 2em !important;
}
.v-text-field.jp-answer .v-input__control .v-input__slot {
  min-height: auto !important;
  display: flex !important;
  align-items: center !important;
}
</style>
