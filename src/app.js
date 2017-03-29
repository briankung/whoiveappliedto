import Vue from 'vue'
import JobPost from './components/JobPost.vue'
var cache = require('./cache')

var whoIsHiring = new Vue({
  el: '#hn',
  data: {
    showAll: true,
    showAllNotes: false,
    jobPostIds: [],
    jobPosts: [],
    filters: [],
    monthId: 13301832,
    query: ''
  },
  components: {
    'job-post': JobPost
  },
  // template: '<jobpost/>',
  // render: h => h(JobPost),
  methods: {
    itemApiUrl(itemId) {
      return 'https://hacker-news.firebaseio.com/v0/item/' + itemId + '.json'
    },
    clearAndGetHnApi() {
      localStorage.clear()
      this.getParamMonth()
    },
    getParamMonth() {
      var regex = /id=([0-9]+)/;
      var matches = regex.exec(window.location.search);

      if (matches) {
        var monthId = matches[1]
        this.getHnApi(monthId)
      } else {
        this.getHnApi()
      }
    },
    getHnApi(monthId) {
      monthId = monthId || this.monthId

      whoIsHiring = this
      whoIsHiring.jobPosts = []
      whoIsHiring.jobPostIds = []

      axios.get(this.itemApiUrl(monthId))
        .then(function (response) {
          whoIsHiring.jobPostIds = response.data.kids;
          whoIsHiring.jobPostIds.forEach(function(postId) {
            var cachedPost = cache.methods.getCachedItem(postId)
            if (cachedPost) {
              var cachedData = cache.methods.getCachedItem(postId+'-data') || {}
              if (!cachedData.hideInstance) {
                whoIsHiring.jobPosts.push(cachedPost)
              }
            } else {
              axios.get(whoIsHiring.itemApiUrl(postId))
                .then(function (response) {
                  if (!response.data || !response.data.text) {return}

                  var emptyText = /\A\s*\z/.exec(response.data.text)
                  if (emptyText) {return}

                  whoIsHiring.jobPosts.push(response.data)
                  cache.methods.setCachedItem(postId, response.data)
                })
                .catch(function (error) {
                  console.log('Error fetching the job post.')
                })
            }
          });
        })
        .catch(function (error) {
          console.log('Error fetching the who is hiring post: ' + error.message)
        })
    },
    toggleAllCards() {
      this.showAll = !this.showAll

      this.$children.forEach((child) => {
        if (child.showCard) {
          child.showCardContent = this.showAll
        }
      })
    },
    toggleAllNotes() {
      this.showAllNotes = !this.showAllNotes

      this.$children.forEach((child) => {
        if (child.showCard) {
          child.showNotes = this.showAllNotes
        }
      })
    }
  },
  watch: {
    filters() {
      this.$children.forEach((child) => {
        if (this.filters.length === 0) { return child.showCard = true }

        child.showCard = this.filters
          .map((filter) => {
            return child[filter]
          })
          .reduce((filterStatusA, filterStatusB) => {
            if (this.filters.length > 1) {
              return filterStatusA && filterStatusB
            } else {
              return filterStatusA || filterStatusB
            }
          })
      });
    },
    query: _.debounce(() => {
      whoIsHiring.$children.forEach((child) => {
        if (whoIsHiring.query === '') { return child.showCard = true }

        if (child && child.text) {
          if (whoIsHiring.query.includes('&&')) {
            child.showCard = whoIsHiring.query.split('&&').map((andTerm) => {
              return child.search(andTerm.trim())
            }).reduce((andBoolA, andBoolB) => {
              return andBoolA && andBoolB
            })
          } else if (whoIsHiring.query.includes('||')) {
            child.showCard = whoIsHiring.query.split('||').map((orTerm) => {
              return child.search(orTerm.trim())
            }).reduce((orBoolA, orBoolB) => {
              return orBoolA || orBoolB
            })
          } else {
            child.showCard = child.search(whoIsHiring.query)
          }
        }
      });
    }, 200)
  },
  mounted() {
    this.getParamMonth()
  }
});