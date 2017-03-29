module.exports = {
  methods: {
    getCachedItem: function(postId) {
      var cachedPost = localStorage.getItem(postId)
      if (cachedPost === undefined || cachedPost ===null) {return cachedPost}
      if (cachedPost.length > 0) {
        return JSON.parse(cachedPost)
      } else {
        return null
      }
    },
    setCachedItem: function(cachedItemId, obj) {
      localStorage.setItem(cachedItemId, JSON.stringify(obj))
    } 
  }
}