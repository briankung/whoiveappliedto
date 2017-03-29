<template>
  <div :class="{ 'is-primary': selected, message: selected, card: !selected }" v-show="showCard" v-if="!hideInstance" class="JobPost">
    <header class="card-header">
      <a class="card-header-icon is-pulled-left" @click="selected = !selected">
        <input type="checkbox" v-model="selected">
      </a>
      <p class="card-header-title" v-html="firstLine" @click.self="showCardContent = !showCardContent"></p>
      <a class="card-header-icon is-pulled-right permahide" @click="hideInstance = true">
      </a>
    </header>
    <div class="card-content" v-show="showCardContent">
      <div class="content">
        <span v-html="text"></span>
        <p></p>
        <p><small>> <permalink :id="id" :time="time"></permalink> by <userlink :username="by"></userlink></small></p>
      </div>
    </div>
    <footer class="card-footer">
      <a class="card-footer-item" @click="showNotes = !showNotes">{{ showNotes ? '[-]' : '[+]' }} Notes</a>
      <label class="checkbox card-footer-item">
        <input type="checkbox" v-model="saved">
        &nbsp;
        <a>{{ this.saved ? 'Saved' : 'Save' }}</a>
      </label>
      <label class="checkbox card-footer-item">
        <input type="checkbox" v-model="applied">
        &nbsp;
        <a>{{ this.applied ? 'Applied!' : 'Applied?' }}</a>
      </label>
    </footer>
    <div class="card-content" v-show="showNotes">
      <textarea type="text" class="textarea" v-model="notes"></textarea>
    </div>
  </div>
</template>

<style>
  .card-footer-item {
    border-bottom: 1px solid #dbdbdb;
  }
</style>

<script>

var cache = require('../cache');

var UserLink = {
  props: ['username'],
  template: '<a :href="userUrl">{{ username }}</a>',
  computed: {
    userUrl() {return 'https://news.ycombinator.com/user?id=' + this.username}
  }
}
var PermaLink = {
  props: ['id', 'time'],
  template: '<a :href="itemUrl">{{ timestamp }}</a>',
  computed: {
    itemUrl() {return 'https://news.ycombinator.com/item?id=' + this.id},
    timestamp() {return moment.unix(this.time).format('MMMM Do YYYY, h:mm:ssa')}
  }
}

module.exports = {
  props: ['by', 'id', 'time', 'text'],
  // locally exclusive components
  components: {
    'userlink': UserLink,
    'permalink': PermaLink
  },
  data: () => {
    return {
      selected: false,
      notes: '',
      hideInstance: false,
      showCard: true,
      showNotes: false,
      showCardContent: true,
      saved: false,
      applied: false
    }
  },
  methods: {
    saveData() {
      cache.methods.setCachedItem(this.id+'-data', this.savedData)
    },
    search(query) {
      query = query.trim().toLowerCase()
      text = this.text.trim().toLowerCase()
      if (query[0] === '-' || query[0] === '!') {
        query = query.slice(1, query.length)
        return !text.includes(query)
      } else {
        return text.includes(query)
      }
    }
  },
  computed: {
    savedData() {
      return {
        id: this.id,
        notes: this.notes,
        hideInstance: this.hideInstance,
        showNotes: this.showNotes,
        showCardContent: this.showCardContent,
        saved: this.saved,
        applied: this.applied
      }
    },
    firstLine() {
      if (this.text){
        return this.text.trim().split('<p>')[0]
      }
    }
  },
  watch: {
    savedData() {this.saveData()}
  },
  mounted() {
    var cachedData = cache.methods.getCachedItem(this.id+'-data')
    for (var attrname in cachedData) { this[attrname] = cachedData[attrname]; }
  }

// })
}

</script>