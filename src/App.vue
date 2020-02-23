<template>
  <v-app id="app">
    <v-system-bar id="system-bar" height="44px" app fixed dark color="black"></v-system-bar>
    <v-content id="main-content">
      <router-view v-if="user"/>
      <v-container v-else fill-height>
        <v-snackbar v-model="errorSnackbar" top color="error">{{ errorMessage }}</v-snackbar>
        <v-layout v-if="!loading" row justify-center align-center>
          <v-btn @click="signIn">
            <v-icon left>mdi-google</v-icon>
            Sign In with Google
          </v-btn>
        </v-layout>
        <v-layout v-else row justify-center align-center>
          <v-progress-circular indeterminate :size="70" :width="7"></v-progress-circular>
        </v-layout>
      </v-container>
    </v-content>
    <v-bottom-navigation v-if="user" id="bottom-nav" app fixed grow shift height="90px">
      <v-btn to="/">
        <span>New</span>
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn to="/list">
        <span>List</span>
        <v-icon>mdi-view-list</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script>
import { auth } from './firebase'

export default {
  name: 'App',
  data () {
    return {
      authEvent: () => {},
      user: null,
      loading: true,
      errorSnackbar: false,
      errorMessage: ''
    }
  },
  mounted () {
    this.authEvent = auth().onAuthStateChanged((user) => {
      this.user = user
      this.loading = false
    }, (error) => {
      this.errorMessage = 'Auth: ' + error.message
      this.errorSnackbar = true
      this.user = null
    })
  },
  methods: {
    signIn () {
      const provider = new auth.GoogleAuthProvider()
      auth().signInWithRedirect(provider).catch((error) => {
        this.errorMessage = 'Sign In: ' + error.message
        this.errorSnackbar = true
      })
    }
  },
  destroyed () {
    this.authEvent()
  }
}
</script>

<style>
.v-item-group.v-bottom-navigation .v-btn.v-size--default {
  height: inherit;
}

.v-dialog.v-dialog--fullscreen {
  padding-top: env(safe-area-inset-top) !important;
}

.v-dialog.v-dialog--fullscreen .v-toolbar__content, .v-dialog.v-dialog--fullscreen .container {
  padding-left: calc(12px + env(safe-area-inset-left)) !important;
  padding-right: calc(12px + env(safe-area-inset-right)) !important;
}

#system-bar {
  top: 0;
  height: env(safe-area-inset-top) !important;
}

#main-content {
  padding-top: env(safe-area-inset-top) !important;
  padding-left: calc(12px + env(safe-area-inset-left)) !important;
  padding-right: calc(12px + env(safe-area-inset-right)) !important;
}

#bottom-nav {
  padding-left: env(safe-area-inset-left) !important;
  padding-right: env(safe-area-inset-right) !important;
  padding-bottom: env(safe-area-inset-bottom) !important;
  bottom: 0;
}

#bottom-nav.v-item-group.v-bottom-navigation .v-btn.v-size--default {
  height: calc(90px - env(safe-area-inset-bottom, 12px));
}
</style>
