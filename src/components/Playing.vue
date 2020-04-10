<template>
  <v-row dense>
    <v-col cols="12">
      <v-btn block @click="stopGame" color="error" :outlined="!ended">{{ ended ? 'END!' : 'QUIT!' }}</v-btn>
      <v-divider class="mt-3"/>
      <h3 class="mt-4 text-center">
        Question {{ random.length - questions.length }} of {{ random.length }}
        <br>
        Correct {{ correct }} of {{ past }} ({{ percent }})
      </h3>
      <v-divider class="mt-4 mb-2"/>
      <h3 v-if="nextQ" class="mt-4 text-center">WAITING NEXT QUESTION</h3>
    </v-col>
    <template v-if="!ended && question !== null">
      <v-col cols="12" class="text-center">
        <v-btn v-if="type === 'sound' && !answer" icon @click="playSound()" x-large color="primary" outlined>
          <v-icon>mdi-play-circle</v-icon>
        </v-btn>
        <v-card v-else-if="type === 'jtt' || type === 'ttj' || type === 'type' || (type === 'sound' && !!answer)">
          <v-card-text>
            <h1 :class="(type === 'ttj' || type === 'type' ? 'thai' : 'japan') + ' text-question'">
              {{ getQuestion(question) }}
            </h1>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-divider class="my-2"/>
      </v-col>
      <v-col cols="12" v-if="type === 'type'" class="text-center">
        <v-text-field ref="answer_field" v-if="answer === null" v-model.trim="answerText" label="Answer" class="jp-answer" append-icon="mdi-send" @click:append="answerType" @keypress.enter="answerType" outlined autofocus hide-details></v-text-field>
        <h3 v-if="answer !== null && answer !== getAnswer(question)" class="japan text-message-answer success--text correct">
          {{ getAnswer(question) }}
        </h3>
        <h3 v-if="answer !== null" :class="'japan text-message-answer ' + (answer !== getAnswer(question) ? 'error--text' : 'success--text correct')">
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
    <template v-if="ended">
      <v-col cols="12">
        <v-list two-line dense>
          <v-list-item v-for="(report, i) in answerReport" :key="i">
            <v-list-item-content>
              <v-list-item-title :class="(report.font === 'jt' ? 'japan' : 'thai') + ' bold'">{{ report.question }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-content>
              <v-list-item-title :class="(report.font === 'tj' ? 'japan' : 'thai') + ' bold success--text'">{{ report.answer }}</v-list-item-title>
              <v-list-item-subtitle :class="(report.font === 'tj' ? 'japan' : 'thai') + ' error--text small'" v-if="report.your">{{ report.your }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
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
      past: 0,
      answerReport: [],
      lastChoice: -1
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
      let type = this.target[Math.floor(Math.random() * this.target.length)]
      if (type === 'type') {
        if (this.words[question].type === 'phrase' && this.target.length > 1) {
          const target = [...this.target]
          target.splice(target.indexOf('type'), 1)
          type = target[Math.floor(Math.random() * target.length)]
        }
      }
      if (type !== 'type') {
        const worst = []
        for (let i = 0; i < this.words.length; i++) worst.push(i)
        if (this.answer) {
          worst.splice(worst.indexOf(this.question), 1)
          if (this.type !== 'type' && this.answer !== this.question) {
            worst.splice(worst.indexOf(this.answer), 1)
          }
        }
        worst.splice(worst.indexOf(question), 1)
        const count = (worst.length + 1) < this.limit ? (worst.length + 1) : this.limit
        let correct = Math.floor(Math.random() * count)
        if (this.lastChoice >= 0) {
          const random = []
          for (let i = count - 1; i >= 0; i--) random.push(i)
          for (let i = 0; i < count; i++) {
            if (i !== this.lastChoice) random.push(i)
          }
          correct = random[Math.floor(Math.random() * random.length)]
        }
        this.lastChoice = correct
        for (let i = 0; i < count; i++) {
          choices[i] = i === correct ? question : worst.splice(Math.floor(Math.random() * worst.length), 1)[0]
        }
      }
      this.playReady()
      this.answerText = ''
      this.question = question
      this.choices = choices
      this.type = type
      this.nextQ = false
      this.answer = null
      if (type === 'sound') {
        setTimeout(() => {
          this.playSound(this.words[question].sound)
        }, 250)
      }
      if (type === 'type') {
        this.$nextTick(() => {
          this.$refs.answer_field.$refs.input.focus()
        })
      }
    },
    answerChoice (index) {
      if (this.answer !== null) return null
      this.answer = index
      this.past += 1

      const data = {}
      if (this.type === 'jtt' || this.type === 'sound') {
        data.font = 'jt'
        data.question = this.words[this.question].vocab
        data.answer = this.words[this.question].mean
        if (index !== this.question) data.your = this.words[index].mean
      } else if (this.type === 'ttj') {
        data.font = 'tj'
        data.question = this.words[this.question].mean
        data.answer = this.words[this.question].vocab
        if (index !== this.question) data.your = this.words[index].vocab
      }
      this.answerReport.push(data)

      if (index !== this.question) {
        this.playIncorrect()
      } else {
        this.playCorrect()
        this.correct += 1
      }

      setTimeout(() => {
        this.playSound(this.words[this.question].sound)
      }, 400)
      setTimeout(() => {
        this.nextQuestion()
      }, 4000)
    },
    answerType () {
      if (this.answer !== null) return null
      this.answer = this.answerText
      this.past += 1

      const data = {}
      data.font = 'tj'
      data.question = this.words[this.question].mean
      data.answer = this.words[this.question].vocab
      if (this.words[this.question].vocab !== this.answer) data.your = this.answerText
      this.answerReport.push(data)

      if (this.words[this.question].vocab !== this.answer) {
        this.playIncorrect()
      } else {
        this.playCorrect()
        this.correct += 1
      }

      setTimeout(() => {
        this.playSound(this.words[this.question].sound)
      }, 400)
      setTimeout(() => {
        this.nextQuestion()
      }, 4000)
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
      if (this.type === 'jtt' || this.type === 'sound') return this.words[index].vocab
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
.error--text.small {
  font-size: 0.75em !important;
}
.japan {
  font-family: 'Aozora Mincho' !important;
}
.thai {
  font-family: 'Sarabun' !important;
}
.japan.bold {
  font-weight: 700 !important;
}
.thai.bold {
  font-weight: 500 !important;
}
.thai.small, .japan.small {
  font-weight: 300 !important;
}
.thai.bold, .japan.bold {
  line-height: 1.5em !important;
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
  font-size: 1.5em !important;
  line-height: 1.5em !important;
  font-weight: 500 !important;
}
.text-message-answer.correct {
  font-size: 2em !important;
  line-height: 2em !important;
  font-weight: 700 !important;
}
.v-text-field.jp-answer input {
  line-height: 1.5em !important;
  font-family: 'Aozora Mincho' !important;
  font-size: 1.75em !important;
  font-weight: 500 !important;
  max-height: 2.5em !important;
}
</style>
